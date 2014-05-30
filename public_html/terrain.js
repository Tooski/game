
/* 
 * terrain.js
 * Skeleton class containing the getters physics will need from a terrain object.
 * Skeleton by Travis Drake
 */
var DEBUG_TERRAIN = false;
var editMode = true;

// TerrainSurface object is the parent class for all collideable terrain objects. Has a start point and end point (and is therefore a line or curve).
function TerrainSurface(point0, point1, adjacent0, adjacent1, pl) {
  if (point0 && point1) {
    //if (!point0.id || !point1.id) {
    //  console.log("-+-");
    //  console.log("-+-  (note that the below message is true for all line types, not just terrainLines. They are just an example)");
    //  console.log("-+- bad new Line constructor call. It should look like below");
    //  console.log("-+- new TerrainLine(tm.toLinePoint(p0), tm.toLinePoint(p1), player, adjacent0, adjacent1, normal)");
    //  console.log("-+- where tm is the terrainManager, or use \"this\" in place of \"tm\" if constructing from within terrainmanager: ");
    //  throw "point0 and point1 are not LinePoints. Ensure you use terrainManager.toLinePoint(), see above";
    //}

    Collideable.apply(this);    // SET UP TerrainSurface objects' inheritance from Collideable.
    this.p0 = point0;                                   // p0 and p1 are either end of this TerrainSurface.
    this.p1 = point1;


  }


  this.adjacent0 = adjacent0;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p0. NULL IF p0 CONNECTS TO NOTHING.
  this.adjacent1 = adjacent1;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p1. NULL IF p1 CONNECTS TO NOTHING.
  this.player = pl;
  this.getNormalAt = function (ballLocation) { };     // ballLocation is simple where the ball currently is, for which we are trying to obtain the normal applicable to the ball. 
  this.getSurfaceAt = function (ballLocation) { };    // Gets a normalized surface vector.

  this.string = function (pl) {
    var str = "p0 " + rl(this.p0.x, pl) + "  " + rl(this.p0.y, pl) + "      p1 " + rl(this.p1.x, pl) + "  " + rl(this.p1.y, pl);
    return str;
  }
}

function normalDrag(terrain) {
  if (terrain.normal) {
    var oneNormal = terrain.p0.subtract(terrain.p1).perp().normalize();
    if (oneNormal.dot(terrain.normal) < 0) {
      oneNormal = oneNormal.negate();
    }
    terrain.normal.x = oneNormal.x;
    terrain.normal.y = oneNormal.y;
  }
}


TerrainSurface.prototype = new Collideable();         // Establishes this as a child of Collideable.
TerrainSurface.prototype.constructor = TerrainSurface;// Establishes this as having its own constructor.





// TerrainLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function TerrainLine(point0, point1, player, adjacent0, adjacent1, normal) {

  TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1, player]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.
  this.normal = normal;//.normalize();



  this.toJSON = function () {
    var formattedObj = { id: this.id };
    formattedObj = formatLineToJSON(this, formattedObj);

    formattedObj.normal = this.normal;
    return JSON.stringify(formattedObj);;
  }



  this.getNormalAt = function (ballLocation, radius) {
    if (!ballLocation) {
      throw "ballLocation undefined";
    } else if (!radius) {
      throw "radius undefined";
    }
    var normalToReturn;
    if (this.isPointWithinPerpBounds(ballLocation)) {
      normalToReturn = this.normal;
    } else {
      var pA = this.p0;              // TerrainLine point 1
      var pB = this.p1;              // TerrainLine point 2
      var pC = ballLocation;                // center of the ball
      var vAC = pA.subtract(pC);     // vector from A to the ball
      var vBC = pB.subtract(pC);     // vector from B to the ball
      var rSQ = radius * radius;
      var acbool = (vAC.lengthsq() <= rSQ);
      var bcbool = (vBC.lengthsq() <= rSQ);
      if (acbool && bcbool) {         // if we're super close to both line endpoints.
        //console.log("hitting both endpoints");
        throw "this should never happen";
        normalToReturn = this.normal;
      } else if (acbool === true) {            // if we're touching pointA
        //console.log("hitting point A");
        normalToReturn = vAC.normalize().negate();
      } else if (bcbool === true) {
        //console.log("hitting point B");
        normalToReturn = vBC.normalize().negate();
      } else {
        //throw "no collision, nigga y u want normal?";
        normalToReturn = this.normal; //??
      }
    }
    return normalToReturn;
  };



  this.getSurfaceAt = function (ballLocation) {
    return this.p1.subtract(this.p0).normalize();
  };




  /**
    * Returns a result object detailing whether or not this adjacent is concave, and the angle between this surface and adj0.
    * return { concave: true or false, angle } angle is in radians, the closer to Math.PI the less the angle of change between surfaces.
    */
  this.getAdj0Angle = function () {
    if (this.adjacent0) {
      var thisVec = this.p1.subtract(this.p0).normalize();
      var adjVec = this.adjacent0.p0.subtract(this.adjacent0.p1).normalize();
      var angleNorm = getSignedAngleFromAToB( this.adjacent0.normal, this.normal);
      var angle = Math.acos(thisVec.dot(adjVec));

      //connection to adj0 is concave when the angle between this.normal and next surface is < HALF_PI, or 90 degrees. 

      //console.log("angleNorm0: ", angleNorm);
      var result = { concave: (angleNorm < 0), angle: angle };
      return result;

    } else {
      return null;
    }
  }




  /**
   * Returns a result object detailing whether or not this adjacent is concave, and the angle between this surface and adj1.
   * return { concave: true or false, angle } angle is in radians, the closer to Math.PI the less the angle of change between surfaces.
   */
  this.getAdj1Angle = function () {
    if (this.adjacent1) {
      var thisVec = this.p0.subtract(this.p1).normalize();
      var adjVec = this.adjacent1.p1.subtract(this.adjacent1.p0).normalize();
      var angleNorm = getSignedAngleFromAToB(this.normal, this.adjacent1.normal);
      var angle = Math.acos(thisVec.dot(adjVec));

      //connection to adj0 is concave when the angle between this.normal and next surface is < HALF_PI, or 90 degrees. 

      //console.log("angleNorm1: ", angleNorm);
      var result = { concave: (angleNorm < 0), angle: angle };
      return result;

    } else {
      return null;
    }
  }




  /**
   * checks for a collision.
   */
  this.collidesWith = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!
    return lineCollidesWith(this, point, radius, ctx);
  };



  /**
   * Checks for a collision and 
   * returns data { collision, collidedLine, collidedP0, collidedP1, perpendicularIntersect };
   */
  this.collidesData = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!  If collidesWith is modified, this needs to match.
    return lineCollidesData(this, point, radius, ctx);
  };





  /**
   * Tests a point to see if it lies within the rays passing through each point at either end of the line segment that are perpendicular to the line segment.
   */
  this.isPointWithinPerpBounds = function (point) {
    return isPointWithinLineSegmentPerp(this, point);
  }
}
TerrainLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
TerrainLine.prototype.constructor = TerrainLine;   //Establishes this as having its own constructor.
TerrainLine.prototype.lineWidth = 5;





// GoalLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function GoalLine(point0, point1, player, adjacent0, adjacent1) {

  TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1, player]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.

  this.id;
  this.goalID;

  this.toJSON = function () {
    var formattedObj = { id: this.id, goalID: this.goalID };
    formattedObj = formatLineToJSON(this, formattedObj);
    return JSON.stringify(formattedObj);
  }

  /**
   * checks for a collision.
   */
  this.collidesWith = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!
    return lineCollidesWith(this, point, radius, ctx);
  };



  /**
   * Checks for a collision and 
   * returns data { collision, collidedLine, collidedP0, collidedP1, perpendicularIntersect };
   */
  this.collidesData = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!  If collidesWith is modified, this needs to match.
    return lineCollidesData(this, point, radius, ctx);
  };





  /**
   * Tests a point to see if it lies within the rays passing through each point at either end of the line segment that are perpendicular to the line segment.
   */
  this.isPointWithinPerpBounds = function (point) {
    return isPointWithinLineSegmentPerp(this, point);
  }
}
GoalLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
GoalLine.prototype.constructor = GoalLine;   //Establishes this as having its own constructor.
GoalLine.prototype.lineWidth = 5;





// CheckpointLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function CheckpointLine(point0, point1, player, adjacent0, adjacent1) {

  TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1, player]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.
  this.id;
  this.checkpointID;

  this.toJSON = function () {
    var formattedObj = { id: this.id, checkpointID: this.checkpointID };
    formattedObj = formatLineToJSON(this, formattedObj);
    return JSON.stringify(formattedObj);
  }
  /**
   * checks for a collision.
   */
  this.collidesWith = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!
    return lineCollidesWith(this, point, radius, ctx);
  };



  /**
   * Checks for a collision and 
   * returns data { collision, collidedLine, collidedP0, collidedP1, perpendicularIntersect };
   */
  this.collidesData = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!  If collidesWith is modified, this needs to match.
    return lineCollidesData(this, point, radius, ctx);
  };





  /**
   * Tests a point to see if it lies within the rays passing through each point at either end of the line segment that are perpendicular to the line segment.
   */
  this.isPointWithinPerpBounds = function (point) {
    return isPointWithinLineSegmentPerp(this, point);
  }
}
CheckpointLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
CheckpointLine.prototype.constructor = CheckpointLine;   //Establishes this as having its own constructor.
CheckpointLine.prototype.lineWidth = 5;






// KillLine object is the representation of a line that will kill the player.
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function KillLine(point0, point1, player, adjacent0, adjacent1) {

  TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1, player]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.
  this.id;

  this.toJSON = function () {
    var formattedObj = { id: this.id };
    formattedObj = formatLineToJSON(this, formattedObj);
    return JSON.stringify(formattedObj);
  }

  /**
   * checks for a collision.
   */
  this.collidesWith = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!
    return lineCollidesWith(this, point, radius, ctx);
  };

  /**
   * Checks for a collision and 
   * returns data { collision, collidedLine, collidedP0, collidedP1, perpendicularIntersect };
   */
  this.collidesData = function (point, radius, ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!  If collidesWith is modified, this needs to match.
    return lineCollidesData(this, point, radius, ctx);
  };

  /**
   * Tests a point to see if it lies within the rays passing through each point at either end of the line segment that are perpendicular to the line segment.
   */
  this.isPointWithinPerpBounds = function (point) {
    return isPointWithinLineSegmentPerp(this, point);
  }
}
KillLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
KillLine.prototype.constructor = KillLine;   //Establishes this as having its own constructor.
KillLine.prototype.lineWidth = 5;






function findNormalByMouse(e, line) {
  var mousePos = getMousePos(e);
  var midPoint = line.p0.add(line.p1).divf(2.0);
  var surfaceVector = line.p0.subtract(line.p1);
  var mouseVector = new vec2(mousePos.x, mousePos.y).subtract(midPoint);
  var oneNormal = surfaceVector.perp().normalize();

  if (oneNormal.dot(mouseVector.normalize()) < 0) {
    oneNormal = oneNormal.negate();
  }
  return oneNormal;
}









/**
 * Removing mass duplicate code from across the different line types.
 */
function lineCollidesWith (line, point, radius, ctx) {
  var pA = line.p0;              // TerrainLine point 1
  var pB = line.p1;              // TerrainLine point 2
  var pC = ORIGIN.add(point);                // center of the ball

  var vAB = pB.subtract(pA);     // vector from A to B
  var vAC = pC.subtract(pA);     // vector from A to the ball
  var vBC = pC.subtract(pB);     // vector from B to the ball
  //console.log(pA + " " + pB + " " + pC);
  var vAD = projectVec2(vAC, vAB); //project the vector to the ball onto the surface.
  var pD = pA.add(vAD);            // find the perpendicular intersect of the surface.
  var vCD = pC.subtract(pD);       // find the vector from ball to the perpendicular intersection.

  var collision = false;
  var radiussq = radius * radius;
  var vABlensq = vAB.lengthsq();
  if (vCD.lengthsq() < radiussq && vAD.lengthsq() < vABlensq && vAB.subtract(vAD).lengthsq() < vABlensq) {
    //if (vCD.lengthsq() < radiussq - COLLISION_EPSILON_SQ && vAD.lengthsq() < vABlensq - COLLISION_EPSILON_SQ && vAB.subtract(vAD).lengthsq() < vABlensq - COLLISION_EPSILON_SQ) {
    // THEN THE CENTER OF OUR CIRCLE IS WITHIN THE PERPENDICULAR BOUNDS OF THE LINE SEGMENT, AND CIRCLE IS LESS THAN RADIUS AWAY FROM THE LINE.
    //console.log("Within perpendicular line bounds.");
    collision = true;
  } else if (vAC.lengthsq() < radiussq || vBC.lengthsq() < radiussq) {
    //} else if (vAC.lengthsq() < radiussq - COLLISION_EPSILON_SQ || vBC.lengthsq() < radiussq - COLLISION_EPSILON_SQ) {
    // WE ARE OFF THE SIDES OF THE PERPENDICULAR BOUNDING BOX, BUT WE STILL COLLIDED WITH THE LINES ENDPOINT.
    //console.log("Outside line bounds, hit endpoint");
    collision = true;
  } else {
    // No collision, unless we're missing a case in which case add additional detection here.
  }


  return collision;
}





/**
 * Removing mass duplicate code from across the different line types.
 */
function lineCollidesData(line, point, radius, ctx) {
  var pA = line.p0;              // TerrainLine point 1
  var pB = line.p1;              // TerrainLine point 2
  var pC = ORIGIN.add(point);    // center of the ball

  var vAB = pB.subtract(pA);     // vector from A to B
  var vAC = pC.subtract(pA);     // vector from A to the ball
  var vBC = pC.subtract(pB);     // vector from B to the ball
  //console.log(pA + " " + pB + " " + pC);
  var vAD = projectVec2(vAC, vAB); //project the vector to the ball onto the surface.
  var pD = pA.add(vAD);            // find the perpendicular intersect of the surface.
  var vCD = pC.subtract(pD);       // find the vector from ball to the perpendicular intersection.

  var dcollision = false;
  var dcollidedLine = false;
  var dcollidedP0 = false;
  var dcollidedP1 = false;
  var dsurface = line;
  var dperpendicularIntersect = pD;

  var radiussq = radius * radius;
  var vABlensq = vAB.lengthsq();


  if (vAC.lengthsq() < radiussq) {      // hit P0
    //if (vAC.lengthsq() < radiussq - COLLISION_EPSILON_SQ) {      // hit P0
    dcollision = true;
    dcollidedP0 = true;
    console.log("hit P0.");
  }
  if (vBC.lengthsq() < radiussq) {       // hit P1
    //if (vBC.lengthsq() < radiussq - COLLISION_EPSILON_SQ) {       // hit P1
    dcollision = true;
    dcollidedP1 = true;
    console.log("hit P1.");
  }
  if (vCD.lengthsq() < radiussq && vAD.lengthsq() < vABlensq && vAB.subtract(vAD).lengthsq() < vABlensq) {
    //if (vCD.lengthsq() < radiussq - COLLISION_EPSILON_SQ && vAD.lengthsq() < vABlensq - COLLISION_EPSILON_SQ && vAB.subtract(vAD).lengthsq() < vABlensq - COLLISION_EPSILON_SQ) {
    // THEN THE CENTER OF OUR CIRCLE IS WITHIN THE PERPENDICULAR BOUNDS OF THE LINE SEGMENT, AND CIRCLE IS LESS THAN RADIUS AWAY FROM THE LINE.
    console.log("    Within perpendicular line bounds AND collided.  =-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=");
    //DEBUG_DRAW_RED.push(new DebugCircle(point, radius, 5));
    //DEBUG_DRAW_GREEN.push(new DebugLine(this.p0, this.p1, 5));
    dcollision = true;
    dcollidedLine = true;
  } else {
    // No collision, unless we're missing a case in which case add additional detection here.
    //DEBUG_DRAW_BLUE.push(new DebugCircle(point, radius, 5));
  }




  var data = { collided: dcollision, collidedLine: dcollidedLine, collidedP0: dcollidedP0, collidedP1: dcollidedP1, surface: dsurface, perpendicularIntersect: dperpendicularIntersect };
  //console.log("data: ", data);
  return data;
}




/**
 * removing mass dupe code
 */
function isPointWithinLineSegmentPerp(line, point) {
  var pA = line.p0;              // TerrainLine point 1
  var pB = line.p1;              // TerrainLine point 2
  var pC = point;                // center of the ball

  var vAB = pB.subtract(pA);     // vector from A to B
  var vAC = pC.subtract(pA);     // vector from A to the ball
  var vBC = pC.subtract(pB);     // vector from B to the ball
  //console.log(pA + " " + pB + " " + pC);
  var vAD = projectVec2(vAC, vAB); //project the vector to the ball onto the surface.
  var pD = pA.add(vAD);            // find the perpendicular intersect of the surface.
  var vCD = pC.subtract(pD);       // find the vector from ball to the perpendicular intersection.

  var vABlensq = vAB.lengthsq();

  if (vAD.lengthsq() < vABlensq && vAB.subtract(vAD).lengthsq() < vABlensq) {
    // THEN THE CENTER OF OUR CIRCLE IS WITHIN THE PERPENDICULAR BOUNDS OF THE LINE SEGMENT, AND CIRCLE IS LESS THAN RADIUS AWAY FROM THE LINE.
    return true;
  } else {
    return false;
  }
}









// helper method to get the line part of any of the above things that are lines, and terrainLines.
// objectToAppendTo is an object that is passed in 
function formatLineToJSON(line, objectToAppendTo) {
  var obj = objectToAppendTo;
  obj.p0id = line.p0.id;
  obj.p1id = line.p1.id;
  obj.adj0id = line.adjacent0.id;
  obj.adj1id = line.adjacent1.id;
}


