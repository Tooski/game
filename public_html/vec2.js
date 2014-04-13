/* 
 * vec2 ported shamelessly from vec.h in the Angel openGL examples.
 * Ported by Travis Drake.
 */


function vec2(x,y) {
    this.x = x;
    this.y = y;
}




vec2.prototype.negate = function() // unary minus operator
{ return vec2( -this.x, -this.y ); }

vec2.prototype.plus = function(v)  // add vectors, this + v
{ return vec2( this.x + v.x, this.y + v.y ); }

vec2.prototype.minus = function(v)  // subtract vectors, this - v 
{ return vec2( this.x - v.x, this.y - v.y ); }

vec2.prototype.multf = function(s)  // multiply vector by float, this * s           
{ return vec2( s*this.x, s*this.y ); }

vec2.prototype.multv = function (v) // multiply vectors, this * v
{ return vec2( this.x*v.x, this.y*v.y ); }

vec2.prototype.divf = function (s) // divide vector by float, this / s
{ return this.multf(1.0 / s); }



vec2.prototype.dot = function(v) {  // returns the dot product of this.dot(v)
  return this.x * v.x + this.y * v.y;
}

vec2.prototype.length = function() {  // returns the magnitude of the vector. (Or Euclidean length of the vectors line).
  return Math.sqrt(this.dot(this));
}

vec2.prototype.normalize = function(v) { // normalizes a vector so that its length is equal to 1.0. Useful for math.
  return v.divf(v.length());
}


vec2.prototype.toString = function () {
  return "X: " + this.x + ", Y: " + this.y;
}