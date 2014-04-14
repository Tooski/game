/* 
 * vec3 ported shamelessly from the vec.h Angel openGL examples.
 * Ported by Travis Drake.
 */


function vec3(x,y,z) {   // z = 0.0 if vector, 1.0 if 2D point
    this.x = x;
    this.y = y;
    this.z = z;
}



vec3.prototype.negate = function() // unary minus operator
{ return vec3( -this.x, -this.y, -this.z ); }

vec3.prototype.plus = function(v) // add a vec3 to this one.
{ return vec3( this.x + v.x, this.y + v.y, this.z + v.z ); }

vec3.prototype.minus = function(v) // subtract a vector from this one.
{ return vec3( this.x - v.x, this.y - v.y, this.z - v.z ); }

vec3.prototype.multf = function(f) // multiply the vector times a float.
{ return vec3( f*this.x, f*this.y, f*this.z ); } 

vec3.prototype.multv = function(v) // multiply this vector by another vector.
{ return vec3( this.x*v.x, this.y*v.y, this.z*v.z ); }

vec3.prototype.divf = function(f)  // divides this vector by a float.
{ return this.multf(1.0 / f); }


vec3.prototype.dot = function(v) {  // returns the angle between this vector and the other vector.
  return this.x*v.x + this.y*v.y + this.z*v.z ;
}

vec3.prototype.length = function() {  // returns the magnitude (length) of the 3D vector.
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

vec3.prototype.normalize = function() { // normalizes the vector to length 1.
  return this.divf(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
}

vec3.prototype.cross = function(v) {  // returns the perpendicular 3D vector to this vector.
  return vec3(this.y * v.z - this.z * v.y,
   this.z * v.x - this.x * v.z,
   this.x * v.y - this.y * v.x);
}

vec3.prototype.toString = function()
{
  return "X: " + this.x + ", Y: " + this.y + ", Z: " + this.z;
}