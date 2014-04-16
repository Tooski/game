/* 
 * terrain.js
 * Skeleton class containing the getters physics will need from a terrain object.
 * Skeleton by Travis Drake
 */


// TerrainSurface object is the parent class for all collideable terrain objects. Has a start point and end point (and is therefore a line or curve).
function TerrainSurface(point0, point1, adjacent0, adjacent1) {
  Collideable.apply(this);    // SET UP TerrainSurface objects' inheritance from Collideable.
  this.p0 = point0;                                // p0 and p1 are either end of this TerrainSurface.
  this.p1 = point1;
  this.adjacent0 = adjacent0;                      // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p0. NULL IF p0 SIMPLY ENDS.
  this.adjacent1 = adjacent1;                      // THIS IS A LINK TO THE TerrainSurface CONNECTING AT p1. NULL IF p1 SIMPLY ENDS.
  this.getNormal = function (percentageAlongSurface) { }; // percentageAlongSurface is the percentage across the surface to get the normal at. Useful for curves and beziers etc.
}
TerrainSurface.prototype = new Collideable();      // Establishes this as a child of Collideable.



// TerrainLine object is the representation of a basic line that the player can roll on in a level. 
// Extends TerrainSurface and implements its required methods and those of its parent, Collideable.
// @param normal is a normalized vector representing the normal of this line. 
// @param adjacents is an array of terrainObjects where adjacents[0] is connected by p0, and adjacent
function TerrainLine(point0, point1, adjacent0, adjacent1, normal) {  
  TerrainSurface.apply(this, [point0, point1, adjacent0, adjacent1]); // Sets this up as a child of TerrainSurface and initializes TerrainSurface's fields.
  this.normal = normal;
}
TerrainLine.prototype = new TerrainSurface();      //Establishes this as a child of TerrainSurface.
TerrainLine.prototype.getNormal = new function (percentageAlongSurface) {
  return this.normal;
}