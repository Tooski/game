/* 
 * terrain.js
 * Skeleton class containing the getters physics will need from a terrain object.
 * Skeleton by Travis Drake
 */
var DEBUG_TERRAIN = false;
var editMode = true;

// TerrainSurface object is the parent class for all collideable terrain objects. Has a start point and end point (and is therefore a line or curve).
function TerrainSurface(point0, point1, adjacent0, adjacent1, pl) {
  if(point0 && point1) {
    Collideable.apply(this);    // SET UP TerrainSurface objects' inheritance from Collideable.
  this.p0 = point0;                                   // p0 and p1 are either end of this TerrainSurface.
  this.p1 = point1;
  var that = this;
 
  if(editMode) {
      var wh = 10;
      this.p0edit = new MouseCollideable("point", this.p0.x - wh, this.p0.y - wh, wh*2, wh*2);
      
      this.p0edit.onDrag = function(e) {
        var xOffset = e.offsetX/ initScale - (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 + player.position.x;
        var yOffset = e.offsetY/ initScale - (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 + player.position.y;

        this.x = (that.p0.x = xOffset) - wh;
        this.y = (that.p0.y = yOffset) - wh;
        normalDrag(that);
        if(that.adjacent0) {
            if(that.adjacent0.adjacent1 === that) {
                that.adjacent0.p1edit.x = (that.adjacent0.p1.x = xOffset) - wh;
                that.adjacent0.p1edit.y = (that.adjacent0.p1.y = yOffset) - wh;
                normalDrag(that.adjacent0);
            } else if (that.adjacent0.adjacent0 === that) {
                that.adjacent0.p0edit.x = (that.adjacent0.p0.x = xOffset) - wh;
                that.adjacent0.p0edit.y = (that.adjacent0.p0.y = yOffset) - wh;
                normalDrag(that.adjacent0);
            }
        }
      };
      this.p0edit.onRelease = function(e) {
          snapTo(that);
      };
      this.p1edit = new MouseCollideable("point", this.p1.x - wh, this.p1.y - wh, wh*2, wh*2);
      this.p1edit.onDrag = function(e) {
        var xOffset = e.offsetX/ initScale - (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 + player.position.x;
        var yOffset = e.offsetY/ initScale - (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 + player.position.y;
 
          
        this.x = (that.p1.x = xOffset) - wh;
        this.y = (that.p1.y = yOffset) - wh;
        normalDrag(that);
        if(that.adjacent1) {
            if(that.adjacent1.adjacent1 === that) {
                that.adjacent1.p1edit.x = (that.adjacent1.p1.x = xOffset) - wh;
                that.adjacent1.p1edit.y = (that.adjacent1.p1.y = yOffset) - wh;
                normalDrag(that.adjacent1);
            } else if (that.adjacent1.adjacent0 === that) {
                that.adjacent1.p0edit.x = (that.adjacent1.p0.x = xOffset) - wh;
                that.adjacent1.p0edit.y = (that.adjacent1.p0.y = yOffset) - wh;
                normalDrag(that.adjacent1);
            }
        }
   
      };
      this.p1edit.onRelease = function(e) {
          snapTo(that);
      };
     
      this.normalPosVec = new vec2(this.p0.x, this.p0.y);
      this.normalPosCol = new MouseCollideable("normal", this.p0.x - wh, this.p0.y - wh, wh*2, wh*2);
      this.normalPosCol.onDrag = function(e) {
          if(that.normal) {
          var point = findNormalByMouse(e, that);
          

          that.normal.x = point.x;
          that.normal.y = point.y;
          
        }
      };
    }
  }
  
  
  this.adjacent0 = adjacent0;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p0. NULL IF p0 CONNECTS TO NOTHING.
  this.adjacent1 = adjacent1;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p1. NULL IF p1 CONNECTS TO NOTHING.
  this.player = pl;
  this.getNormalAt = function (ballLocation) { };     // ballLocation is simple where the ball currently is, for which we are trying to obtain the normal applicable to the ball. 
  this.getSurfaceAt = function (ballLocation) { };    // Gets a normalized surface vector.
}

function normalDrag(terrain) {
    if(terrain.normal) {
        var oneNormal = terrain.p0.subtract(terrain.p1).perp().normalize();
        if(oneNormal.dot(terrain.normal) < 0) {
             oneNormal = oneNormal.negate();
        }
        terrain.normal.x =  oneNormal.x;
        terrain.normal.y =  oneNormal.y;
    }  
}


TerrainSurface.prototype = new Collideable();         // Establishes this as a child of Collideable.
TerrainSurface.prototype.constructor = TerrainSurface;// Establishes this as having its own constructor.



// TerrainLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function TerrainLine(point0, point1, player, adjacent0, adjacent1, normal) {  
   
    TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1,player]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.
  this.normal = normal;//.normalize();
}
TerrainLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
TerrainLine.prototype.constructor = TerrainLine;   //Establishes this as having its own constructor.
TerrainLine.prototype.getNormalAt = function (ballLocation, radius) {
  var pA = this.p0;              // TerrainLine point 1
  var pB = this.p1;              // TerrainLine point 2
  var pC = ballLocation;                // center of the ball
  var vAC = pC.subtract(pA);     // vector from A to the ball
  var vBC = pC.subtract(pB);     // vector from B to the ball
  if (vAC.length() <= radius) {
    return vAC.normalize();
  } else if (vBC.length() <= radius) {
    // WE ARE OFF THE SIDES OF THE PERPENDICULAR BOUNDING BOX, BUT WE STILL COLLIDED WITH THE LINES ENDPOINT.
    return vBC.normalize();
  } else {
    return this.normal;
  }
}
TerrainLine.prototype.getSurfaceAt = function (ballLocation) {
  return (vec2(this.p1 - this.p0)).normalize();
}
TerrainLine.prototype.collidesWith = function (point, radius ,ctx) { // OVERRIDES THE COLLIDEABLE METHOD!!
  var pA = this.p0;              // TerrainLine point 1
  var pB = this.p1;              // TerrainLine point 2
  var pC = point;                // center of the ball

  var vAB = pB.subtract(pA);     // vector from A to B
  var vAC = pC.subtract(pA);     // vector from A to the ball
  var vBC = pC.subtract(pB);     // vector from B to the ball
  //console.log(pA + " " + pB + " " + pC);
  var vAD = projectVec2(vAC, vAB); //project the vector to the ball onto the surface.
  var pD = pA.add(vAD);            // find the perpendicular intersect of the surface.
  var vCD = pC.subtract(pD);       // find the vector from ball to the perpendicular intersection.
  
  var collision = false;
  var vABlen = vAB.length();
  if (vCD.length() <= radius && vAD.length() < vABlen && vAB.subtract(vAD).length() < vABlen) {
    // THEN THE CENTER OF OUR CIRCLE IS WITHIN THE PERPENDICULAR BOUNDS OF THE LINE SEGMENT, AND CIRCLE IS LESS THAN RADIUS AWAY FROM THE LINE.
    collision = true;
  } else if (vAC.length() <= radius || vBC.length() <= radius) {
    // WE ARE OFF THE SIDES OF THE PERPENDICULAR BOUNDING BOX, BUT WE STILL COLLIDED WITH THE LINES ENDPOINT.
    collision = true;
  } else {
    // No collision, unless we're missing a case in which case add additional detection here.
  }
  if (DEBUG_TERRAIN && ctx) {
    ctx.strokeStyle = collision ? "Red" : "Black";



    ctx.lineWidth = 3;

    ctx.moveTo(point.x, point.y);
    ctx.lineTo(pB.x, pB.y);

    ctx.moveTo(point.x, point.y);
    ctx.lineTo(pA.x, pA.y);

    ctx.moveTo(point.x, point.y);
    ctx.lineTo(pD.x, pD.y);

    ctx.stroke();
  }
  
  return collision;
}
TerrainLine.prototype.draw = function(ctx) {
  ctx.lineWidth=5;

  ctx.moveTo(this.p0.x, this.p0.y);
  ctx.lineTo(this.p1.x, this.p1.y);
  ctx.stroke();
  
  
  //// CODE BELOW ONLY SHOWS IF EDIT MODE IS ENABLED FOR MAP EDITOR!
      if(editMode) {
        ctx.beginPath();
        ctx.arc(this.p0.x  , this.p0.y , 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.p1.x  , this.p1.y , 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();

        if(this.normal) {
          
            var midPoint = this.p0.add(this.p1).divf(2.0);
            
            
            this.normalPosVec = midPoint.add(this.normal.multf(20));
            
            this.normalPosCol.x = this.normalPosVec.x - this.normalPosCol.w/2;
            this.normalPosCol.y = this.normalPosVec.y - this.normalPosCol.h/2;

            ctx.moveTo(midPoint.x  , midPoint.y  );
            ctx.lineTo(this.normalPosVec.x  , this.normalPosVec.y  );
            ctx.stroke();
            ctx.beginPath();

            ctx.arc(this.normalPosVec.x  , this.normalPosVec.y , this.normalPosCol.w/2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'orange';
            ctx.fill();
            ctx.stroke();
        
        }
    }
  
  
  
  if (DEBUG_TERRAIN) {
    this.collidesWith(this.player.position, 25, ctx);
  } 
}

function findNormalByMouse(e, line) {
    var mousePos = getMousePos(e);
    var midPoint = line.p0.add(line.p1).divf(2.0);
    var surfaceVector = line.p0.subtract(line.p1);
    var mouseVector = new vec2(mousePos.x, mousePos.y).subtract(midPoint);
    var oneNormal = surfaceVector.perp().normalize();
    
    if(oneNormal.dot(mouseVector.normalize()) < 0) {
         oneNormal =oneNormal.negate();
    }
    return oneNormal;
}
