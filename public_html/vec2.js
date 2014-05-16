/* 
 * vec2 ported shamelessly from vec.h in the Angel openGL examples.
 * Ported by Travis Drake.
 */
var HORIZ_NORM = vec2(1, 0);


function vec2(x,y) {
    this.x = x;
    this.y = y;
}




vec2.prototype.negate = function() // unary minus operator
{ return new vec2( -this.x, -this.y ); }

vec2.prototype.add = function(v)  // add vectors, this + v
{ return new vec2( this.x + v.x, this.y + v.y ); }

vec2.prototype.subtract = function(v)  // subtract vectors, this - v 
{ return new vec2( this.x - v.x, this.y - v.y ); }


vec2.prototype.multv = function (v) // multiply vectors, this * v
{ return new vec2( this.x*v.x, this.y*v.y ); }

vec2.prototype.multf = function (f)  // multiply vector by float, this * s           
{ return new vec2(f * this.x, f * this.y); }

vec2.prototype.multm = function (m)
{return new vec2(m[0][0]*this.x + m[0][1]*this.y,
       m[1][0]*this.x + m[1][1]*this.y );
}

vec2.prototype.divf = function (f) // divide vector by float, this / s
{ return this.multf(1.0 / f); }



vec2.prototype.dot = function(v) {  // returns the dot product of this.dot(v) aka the angle between this vector and v in radians.
  return this.x * v.x + this.y * v.y;
}

vec2.prototype.length = function () {  // returns the magnitude of the vector. (Or Euclidean length of the vectors line).
  return Math.sqrt(this.x * this.x + this.y * this.y);
}

vec2.prototype.lengthsq = function () {  // returns the square of the vector.
  return this.x * this.x + this.y * this.y;
}

vec2.prototype.normalize = function() { // normalizes a vector so that its length is equal to 1.0. Useful for math.
  return this.divf(Math.sqrt(this.x * this.x + this.y * this.y));
}

vec2.prototype.perp = function() { // returns the perpendicular vector to this vector.
  return new vec2(this.y, -this.x);
}

//projects vec2 a onto vec2 b.
function projectVec2(a, b) {
  //formula: b(dot(a,b)/(|b|^2))
  var temp = ((a.x*b.x)+(a.y*b.y)) / ((b.x*b.x)+(b.y*b.y)); // temp = dot product / b.length^2
  return new vec2(b.x*temp,b.y*temp);
}


vec2.prototype.toString = function () {
  return "X: " + this.x.toFixed(2); + ", Y: " + this.y.toFixed(2);
};


vec2.prototype.equals = function(otherVec) {
  return otherVec instanceof vec2 && this.x === otherVec.x && this.y === otherVec.y;
}


/**
 * Hopefully this will return whichever vector, this or this.negate(), that most faces towards otherVec
 */
vec2.prototype.getFacing = function (otherVec) {
  if (this.dot(otherVec.normalize()) < 0) {
    return (this.negate());
  } else {
    return this;
  }
}

//console.log("vec2(2.0, 1.0).multf(3.0), %2.2f, %2.2f", (new vec2(2.0, 1.0).multf(3.0)).x, (new vec2(2.0, 1.0).multf(3.0)).y);




function getRadiansToHorizontal(vec) {
  var radiansToHorizontal = Math.acos(
    vec.normalize()
    .dot(HORIZ_NORM));
  return radiansToHorizontal * (vec.y > 0 ? -1 : 1);
}


function getRotationMatDegrees(degrees) {
  var radians = -(degrees * Math.PI / 180);
  var s = Math.sin(radians);
  var c = Math.cos(radians);
  return [[c, -s], [s, c]];
}

function getRotationMatRad(radians) {
  var s = Math.sin(radians);
  var c = Math.cos(radians);
  return [[c, -s], [s, c]];
}

