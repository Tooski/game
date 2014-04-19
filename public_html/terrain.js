/* 
 * terrain.js
 * Skeleton class containing the getters physics will need from a terrain object.
 * Skeleton by Travis Drake
 */


// TerrainSurface object is the parent class for all collideable terrain objects. Has a start point and end point (and is therefore a line or curve).
function TerrainSurface(point0, point1, adjacent0, adjacent1, player) {
 // Collideable.apply(this);    // SET UP TerrainSurface objects' inheritance from Collideable.
  this.p0 = point0;                                   // p0 and p1 are either end of this TerrainSurface.
  this.p1 = point1;
  this.adjacent0 = adjacent0;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p0. NULL IF p0 CONNECTS TO NOTHING.
  this.adjacent1 = adjacent1;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p1. NULL IF p1 CONNECTS TO NOTHING.
  this.player = player;
    this.getNormalAt = function (ballLocation) { };     // ballLocation is simple where the ball currently is, for which we are trying to obtain the normal applicable to the ball. 
  this.getSurfaceAt = function (ballLocation) { };    // Gets a normalized surface vector.
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
TerrainLine.prototype.getNormalAt = function (ballLocation) {
  return this.normal;
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
  
     if(ctx) {
        
        ctx.strokeStyle = collision ? "Red" : "Black";
        
      var centerX = point.x ;
      var centerY = point.y  ;
      ctx.beginPath();
      ctx.arc(centerX  , centerY , radius, 0, 2 * Math.PI, false);


    ctx.moveTo(point.x  , point.y );
    ctx.lineTo(pB.x , pB.y );
    
    ctx.moveTo(point.x  , point.y );
    ctx.lineTo(pA.x , pA.y );
    
    ctx.moveTo(point.x  , point.y );
    ctx.lineTo(pD.x  , pD .y  );

    ctx.stroke();
  }
  
  return collision;
}




TerrainLine.prototype.draw = function(ctx) {
        ctx.lineWidth=10;

    ctx.moveTo(this.p0.x  , this.p0.y  );
    ctx.lineTo(this.p1.x  , this.p1.y  );
    ctx.stroke();
    this.collidesWith(this.player.position,25, ctx);
}

