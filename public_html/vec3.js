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

vec3.prototype.multf = function(s) // multiply the vector times a float.
{ return vec3( s*this.x, s*this.y, s*this.z ); } 

vec3.prototype.multv = function(v) // multiply this vector by another vector.
{ return vec3( this.x*v.x, this.y*v.y, this.z*v.z ); }

vec3.prototype.divf = function(s) 
{ return this.multf(1.0 / s); }


vec3.prototype.toString = function()
{
  return "X: " + this.x + ", Y: " + this.y + ", Z: " + this.z;
}