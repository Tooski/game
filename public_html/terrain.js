/* 
 * terrain.js
 * Skeleton class containing the getters physics will need from a terrain object.
 * Skeleton by Travis Drake
 */


// TerrainSurface object is the parent class for all collideable terrain objects. Has a start point and end point (and is therefore a line or curve).
function TerrainSurface(point0, point1, adjacent0, adjacent1) {
  Collideable.apply(this);    // SET UP TerrainSurface objects' inheritance from Collideable.
  this.p0 = point0;                                   // p0 and p1 are either end of this TerrainSurface.
  this.p1 = point1;
  this.adjacent0 = adjacent0;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p0. NULL IF p0 CONNECTS TO NOTHING.
  this.adjacent1 = adjacent1;                         // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p1. NULL IF p1 CONNECTS TO NOTHING.
  this.getNormalAt = function (ballLocation) { };     // ballLocation is simple where the ball currently is, for which we are trying to obtain the normal applicable to the ball. 
}
TerrainSurface.prototype = new Collideable();         // Establishes this as a child of Collideable.
TerrainSurface.prototype.constructor = TerrainSurface;// Establishes this as having its own constructor.



// TerrainLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function TerrainLine(point0, point1, adjacent0, adjacent1, normal) {  
  TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.
  this.normal = normal;
}
TerrainLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
TerrainLine.prototype.constructor = TerrainLine;   //Establishes this as having its own constructor.
TerrainLine.prototype.getNormalAt = function (ballLocation) {
  return this.normal;
}