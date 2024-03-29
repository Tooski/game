
/* 
 * terrain.js
 * Skeleton class containing the getters physics will need from a terrain object.
 * Skeleton by Travis Drake
 */
var DEBUG_TERRAIN = false;



// point class to make storing points less string intensive.
// __EVERY POINT IN ANY LINE CLASS MUST BE REPLACED WITH THESE__  Use terrainManager.toLinePoint(point) to get a point converted to a LinePoint with an ID.
// id = terrainmanager.nextPointNumber();      
function LinePoint(id, x, y, connectedLines) {
  if (!id || id < 0) {
    console.log("_+_+_+_bad LinePoint id, id: " + id);
    throw "_+_+_+_bad id for LinePoint, see above";
  }
  if (!(x || x === 0) && !(y || y === 0)) {
    console.log("_+_+_+_bad LinePoint x or y.  x " + x + ", y " + y);
    throw "_+_+_+_bad x or y in LinePoint, see above";
  }
  vec2.apply(this, [x, y]); 		 // initializes this as a vec2 with parameters x and y.  this.x is now x, this.y is now y
  this.id = id;

  this.lines = [];
  this.numLines = 0;

  if (connectedLines) {
    for (var i = 0; i < connectedLines.length; i++) {
      if (connectedLines[i]) { this.connectLine(connectedLines[i]); this.numLines++; };
    }
  }


  
}
LinePoint.prototype = new vec2();
LinePoint.constructor = LinePoint;

LinePoint.prototype.toJSON = function () {
  return { id: this.id, x: this.x, y: this.y };
}

LinePoint.prototype.collidesWith = function (point, radius) {
  var toReturn = false;
  var radSQ = radius * radius;
  if (point.subtract(this).lengthsq() < radSQ) {
    toReturn = true;
  }
  return toReturn;
}


/**
 * adds a line to this LinePoint.
 * /NOT TRACKED IN JSON, MUST BE REINITIALIZED EVERY START/
 */
LinePoint.prototype.connectLine = function (line) {
  var contains = false;
  for (var i = 0; i < this.lines.length; i++) {
    if (this.lines[i].id && this.lines[i].id === line.id) { contains = true; break; };
  }
  if (!contains) {
    this.numLines++;
    this.lines.push(line);
  }
}


/**
 * removes a line from this LinePoint.
 */
LinePoint.prototype.removeLine = function (line) {
  console.groupCollapsed("LinePoint.removeLine");
  console.log("trying a remove line, line", line);
  for (var i = 0; i < this.lines.length; i++) {
    if (this.lines[i]) {
      console.log("checking against", this.lines[i]);
      if (this.lines[i] === line) {
        console.log("===, deleting");
        delete this.lines[i];
        this.numLines--;
      } else {
        console.log("not equal");
      }
    }
  }
  console.groupEnd();
}




///**
// * TerrainPoint object. Useful for collision data info.
// */
//function TerrainPoint(pos, line0, line1, id) {

//  vec2.apply(this, [pos.x, pos.y]);
//  this.id = id || ("" + (this.x * (this.x - this.y)) + " " + (this.y * (this.y - this.x)));

//  this.line0 = line0;
//  this.line1 = line1;

//  this.angle0 = "";
//  this.angle1 = "";



//  if (line0) {
//    if (!line1) {   //Line 0 only



//    } else {        //Both lines


//      var p00 = line0.p0.subtract(pos);
//      var p01 = line0.p1.subtract(pos);
//      var v0 = p01.subtract(p00);
//      var p10 = line1.p0.subtract(pos);
//      var p11 = line1.p1.subtract(pos);
//      var v1 = p11.subtract(p10);

//      var perp0 = line0.normal;
//      var perp1 = line1.normal;

//      DEBUG_DRAW_RED.push(new DebugLine(pos, pos.add(perp0.multf(50))));
//      DEBUG_DRAW_RED.push(new DebugLine(pos, pos.add(perp1.multf(50))));

//      this.angle0 = getRadiansToHorizontal(perp0);
//      this.angle1 = getRadiansToHorizontal(perp1);

//      //if (line0.p0 === pos) {
//      //  if (line1.p0 === pos) {
//      //    throw "lines dont connect p0 to p1, might be allowable";
//      //  } else if (line1.p1 === pos) {

//      //  } else {
//      //    throw "isnt a point on line1";
//      //  }
//      //} else if (line0.p1 === pos) {
//      //  if (line1.p0 === pos) {

//      //  } else if (line1.p1 === pos) {

//      //    throw "lines dont connect p0 to p1, might be allowable";
//      //  } else {
//      //    throw "isnt a point on line1";
//      //  }
//      //} else {
//      //  throw "isnt a point on line0";
//      //}
//    }


//  } else if (line1) {//Line 1 only



//  } else {
//    throw "no line passed into TerrainPoint constructor.";
//  }
//}








// TerrainLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function TerrainLine(id, polyID, point0, point1, adjacent0, adjacent1, normal) {
  //  if (!id.toFixed) { //id.toFixed is ducktyping to check if id is a number.
  //    throw "All level objects must have a sequentially incremented numerical id.";
  //  }

  this.id = parseInt(id);
  this.polyID = polyID;
  this.p0 = point0;
  this.p0.connectLine(this);
  this.p1 = point1;
  this.p1.connectLine(this);
  this.adjacent0 = adjacent0;
  this.adjacent1 = adjacent1;
  this.normal = normal;//.normalize();



  this.toJSON = function () {
    var formattedObj = { id: this.id, polyID: this.polyID, normal: this.normal };
   // console.log("this ", this);
    formatLineToJSON(this, formattedObj);
    return formattedObj;
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

  this.string = function (pl) {
    var str = "p0 " + rl(this.p0.x, pl) + "  " + rl(this.p0.y, pl) + "      p1 " + rl(this.p1.x, pl) + "  " + rl(this.p1.y, pl);
    return str;
  }
}





// GoalLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function GoalLine(id, goalID, point0, point1, adjacent0, adjacent1) {
  if (isNaN(parseInt(id)) || isNaN(parseInt(goalID))) { //id.toFixed is ducktyping to check if id is a number.
    throw "All level objects must have a sequentially incremented numerical id.";
  }
  this.p0 = point0;
  //this.p0.connectLine(this);
  this.p1 = point1;
  //this.p1.connectLine(this);
  this.adjacent0 = adjacent0;
  this.adjacent1 = adjacent1;

  this.id = parseInt(id);
  this.goalID = goalID;

  this.toJSON = function () {
    var formattedObj = { id: this.id, goalID: this.goalID };
    formatLineToJSON(this, formattedObj);
    console.log("formatted goalLine to json, formatted obj:", formattedObj);
    return formattedObj;
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

  this.string = function (pl) {
    var str = "p0 " + rl(this.p0.x, pl) + "  " + rl(this.p0.y, pl) + "      p1 " + rl(this.p1.x, pl) + "  " + rl(this.p1.y, pl);
    return str;
  }
}





// CheckpointLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function CheckpointLine(id, checkpointID, point0, point1, adjacent0, adjacent1) {
  if (isNaN(parseInt(id)) || isNaN(parseInt(checkpointID))) { //id.toFixed is ducktyping to check if id is a number.
    throw "All level objects must have a sequentially incremented numerical id.";
  }
  this.p0 = point0;
  //this.p0.connectLine(this);
  this.p1 = point1;
  //this.p1.connectLine(this);
  this.adjacent0 = adjacent0;
  this.adjacent1 = adjacent1;
  this.id = parseInt(id);
  this.checkpointID = checkpointID;



  this.toJSON = function () {
    var formattedObj = { id: this.id, checkpointID: this.checkpointID };
    formatLineToJSON(this, formattedObj);
    return formattedObj;
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

  this.string = function (pl) {
    var str = "p0 " + rl(this.p0.x, pl) + "  " + rl(this.p0.y, pl) + "      p1 " + rl(this.p1.x, pl) + "  " + rl(this.p1.y, pl);
    return str;
  }
}






// KillLine object is the representation of a line that will kill the player.
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function KillLine(id, killZoneID, point0, point1, adjacent0, adjacent1) {
  if (isNaN(parseInt(id)) || isNaN(parseInt(killZoneID))) { //id.toFixed is ducktyping to check if id is a number.
    throw "All level objects must have a sequentially incremented numerical id.";
  }
  this.p0 = point0;
  //this.p0.connectLine(this);
  this.p1 = point1;
  //this.p1.connectLine(this);
  this.adjacent0 = adjacent0;
  this.adjacent1 = adjacent1;
  this.id = parseInt(id);
  this.killZoneID = killZoneID;



  this.toJSON = function () {
    var formattedObj = { id: this.id, killZoneID: this.killZoneID };
    formatLineToJSON(this, formattedObj);
    return formattedObj;
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

  this.string = function (pl) {
    var str = "p0 " + rl(this.p0.x, pl) + "  " + rl(this.p0.y, pl) + "      p1 " + rl(this.p1.x, pl) + "  " + rl(this.p1.y, pl);
    return str;
  }
}










/**
 * 
 */
function Polygon(init, image) {
  //Entity.call();
  this.polyID = true;
  this.init = init;
  this.image = image;
  this.fill = false;
  //  
  //  
//  this.polygon = {};
//
//  var i = 0;
//  for (var item in polygon) {
//    var temp = polygon[item];
//    this.polygon[i++] = this.polygon[temp.id] = ({ id: temp.id, polyID: this.polyID, p0: temp.p0, p1: temp.p1 });
//    //this.polygon[i++] = this.polygon[temp.id] = (new TerrainLine(temp.id, this.polyID, temp.p0, temp.p1));
//  }
//
//  var poly = this.polygon[0];
//  var itr = poly;
//  while (itr.adjacent1 !== poly) {
//    itr.adjacent0 = this.polygon[polygon[itr.id].adjacent0.id];
//    itr.adjacent1 = this.polygon[polygon[itr.id].adjacent1.id];
//    itr = itr.adjacent1;
//  }
//  itr.adjacent0 = this.polygon[polygon[itr.id].adjacent0.id];
//  itr.adjacent1 = this.polygon[polygon[itr.id].adjacent1.id];


  this.toJSON = function () {
    return { polyID: this.polyID, init : this.init, image : this.image };
  }
}
//
//
//Polygon.prototype = new Entity();
//
//Polygon.prototype.draw = function (ctx) {
//
//  var rect = new Rectangle(Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
//  ctx.save();
//  ctx.beginPath();
//
//  for (var k in this.polygon) {
//    this.fillTerrain(ctx, this.polygon[k], {}, rect, {});
//
//    break;
//  }
//
//
//
//  ctx.closePath();
//  ctx.clip();
//  var img = ASSET_MANAGER.cache["assets/dirt.jpg"];
//  for (var x = rect.x1 ; x < rect.x2; x += img.width) {
//    for (var y = rect.y1; y < rect.y2; y += img.height) {
//      ctx.drawImage(img, x, y);
//    }
//  }
//  ctx.restore();
//  ctx.lineWidth = this.polygon[k].lineWidth;
//  ctx.stroke();
//
//
//  for (var item in this.polygon) {
//    var midPoint = this.polygon[item].p0.add(this.polygon[item].p1).divf(2.0);
//    var pNormalPosEnd = midPoint.add(this.polygon[item].normal.multf(20));
//    this.polygon[item].normalPosCol.x = pNormalPosEnd.x - this.polygon[item].normalPosCol.w / 2;
//    this.polygon[item].normalPosCol.y = pNormalPosEnd.y - this.polygon[item].normalPosCol.h / 2;
//    this.polygon[item].p0edit.x = this.polygon[item].p0.x;
//    this.polygon[item].p0edit.y = this.polygon[item].p0.y;
//    this.polygon[item].p1edit.x = this.polygon[item].p1.x;
//    this.polygon[item].p1edit.y = this.polygon[item].p1.y;
//    ctx.moveTo(midPoint.x, midPoint.y);
//    ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);
//    ctx.stroke();
//  }
//};
//
//
//Polygon.prototype.fillTerrain = function (ctx, terrain, visited, rect, visitedLine) {
//  if (rect.x1 > terrain.p0.x) rect.x1 = terrain.p0.x;
//  if (rect.x2 < terrain.p0.x) rect.x2 = terrain.p0.x;
//  if (rect.y1 > terrain.p0.y) rect.y1 = terrain.p0.y;
//  if (rect.y2 < terrain.p0.y) rect.y2 = terrain.p0.y;
//  if (rect.x1 > terrain.p1.x) rect.x1 = terrain.p1.x;
//  if (rect.x2 < terrain.p1.x) rect.x2 = terrain.p1.x;
//  if (rect.y1 > terrain.p1.y) rect.y1 = terrain.p1.y;
//  if (rect.y2 < terrain.p1.y) rect.y2 = terrain.p1.y;
//
//
//  visitedLine[terrain.id] = true;
//
//  var t0 = JSON.stringify(terrain.p0);
//  var t1 = JSON.stringify(terrain.p1);
//
//
//  if (visited.length === 0) {
//    ctx.moveTo(terrain.p0.x, terrain.p0.y);
//    visited[t0] = true;
//  }
//
//  if (!visited[t0]) ctx.lineTo(terrain.p0.x, terrain.p0.y);
//  else if (!visited[t1]) ctx.lineTo(terrain.p1.x, terrain.p1.y);
//
//  if (terrain.adjacent0 && !visitedLine[terrain.adjacent0.id]) {
//    var o0 = JSON.stringify(terrain.adjacent0.p0);
//    var o1 = JSON.stringify(terrain.adjacent0.p1);
//    if (!visited[t0] || !visited[t1]) {
//
//      if (t0 === o0 || t0 === o1) visited[t0] = true;
//      else if (t1 === o0 || t1 === o1) visited[t1] = true;
//
//
//
//      this.fillTerrain(ctx, terrain.adjacent0, visited, rect, visitedLine);
//    }
//  }
//  if (terrain.adjacent1 && !visitedLine[terrain.adjacent1.id]) {
//
//    var o0 = JSON.stringify(terrain.adjacent1.p0);
//    var o1 = JSON.stringify(terrain.adjacent1.p1);
//    if (!visited[t0] || !visited[t1]) {
//      if (t0 === o0 || t0 === o1) visited[t0] = true;
//      else if (t1 === o0 || t1 === o1) visited[t1] = true;
//
//
//
//
//      this.fillTerrain(ctx, terrain.adjacent1, visited, rect, visitedLine);
//    }
//  }
//
//};
//








/**
 * Removing mass duplicate code from across the different line types.
 */
function lineCollidesWith(line, point, radius, ctx) {
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
  objectToAppendTo.p0id = line.p0.id;
  objectToAppendTo.p1id = line.p1.id;
  objectToAppendTo.adj0id = line.adjacent0.id;
  objectToAppendTo.adj1id = line.adjacent1.id;
}


