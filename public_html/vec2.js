/* 
 * vec2 ported shamelessly from vec.h in the Angel openGL examples.
 * Ported by Travis Drake.
 */
var HORIZ_NORM = new vec2(1, 0, true);
var VERT_NORM = new vec2(0, 1, true);

var ROT_EPSILON = 0.000000001;


function vec2(x,y, normalized) {
    this.x = x;
    this.y = y;
    if (normalized) {
      this.normalized = true;
    }
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

vec2.prototype.normalize = function () { // normalizes a vector so that its length is equal to 1.0. Useful for math.
  if (this.normalized) {
    return this;
  }
  var toReturn = this.divf(Math.sqrt(this.x * this.x + this.y * this.y));
  toReturn.normalized = true;
  return toReturn;
}

vec2.prototype.perp = function() { // returns the perpendicular vector to this vector.
  return new vec2(this.y, -this.x, this.normalized);
}


vec2.prototype.angle = function () { // returns the perpendicular vector to this vector.
  return Math.acos(this.normalize().dot(HORIZ_NORM));
}


vec2.prototype.sangle = function () { // returns the perpendicular vector to this vector.
  return getSignedAngleFromAToB(HORIZ_NORM, this);
}


vec2.prototype.toJSON = function () {
  var formattedObj = { x: this.x, y: this.y };
  if (this.id) {
    throw "??? should we ever have an id in vec2 toJSON() ? most likely vec2.apply() is fucking with shit";
    formattedObj.id = this.id;
  }
  return JSON.stringify(formattedObj);;
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


/**
 * toString.
 */
vec2.prototype.toString = function () {
  return "" + this.x + ", " + this.y;
}

//console.log("vec2(2.0, 1.0).multf(3.0), %2.2f, %2.2f", (new vec2(2.0, 1.0).multf(3.0)).x, (new vec2(2.0, 1.0).multf(3.0)).y);


function vecFromPointDistAngle(point, distance, angle) {  
  //Use the Cosine Function for x:	 	cos( 22.6 °) = x / 13
  //Rearranging and solving:	 	x = 13 × cos( 22.6 °) = 13 × 0.923 = 12.002...
 	 	 
  //Use the Sine Function for y:	 	sin( 22.6 °) = y / 13
  //Rearranging and solving:	 	y = 13 × sin( 22.6 °) = 13 × 0.391 = 4.996...
  var x = Math.cos(angle) * distance + point.x;
  var y = Math.sin(angle) * distance + point.y;
  return new vec2(x, y);
}


function vecFromAngleLength(angle, length) {
  var x = Math.cos(angle) * length;
  var y = Math.sin(angle) * length;
  return new vec2(x, y);
}





function getSignedAngleFromAToB(a, b) {
  var aNorm = a.normalize();
  var bNorm = b.normalize();
  var angle = Math.acos(aNorm.dot(bNorm));
  var rMat = getRotationMatRad(angle);
  var aNRot = aNorm.multm(rMat);

  if (aNRot.x < bNorm.x - ROT_EPSILON || aNRot.x > bNorm.x + ROT_EPSILON || aNRot.y < bNorm.y - ROT_EPSILON || aNRot.y > bNorm.y + ROT_EPSILON) {
    angle = -angle;

    rMat = getRotationMatRad(angle);
    aNRot = aNorm.multm(rMat);


    if (aNRot.x < bNorm.x - ROT_EPSILON || aNRot.x > bNorm.x + ROT_EPSILON || aNRot.y < bNorm.y - ROT_EPSILON || aNRot.y > bNorm.y + ROT_EPSILON) {
      throw "neither way worked";
    } 
  } 

  return angle;
}





//function vec(angle, length) {
//  var x = Math.cos(angle) * length;
//  var y = Math.sin(angle) * length;
//  return new vec2(x, y);
//}



function getRadiansToHorizontal(vec) {
  var radiansToHorizontal = Math.acos(
    vec.normalize().dot(HORIZ_NORM));
  return radiansToHorizontal * (vec.y > 0 ? -1 : 1);
}



function getRadiansToVertical(vec) {
  var radiansToVertical = Math.acos(
    vec.normalize()
    .dot(VERT_NORM));
  return radiansToVertical * (vec.x > 0 ? -1 : 1);
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



////TESTS getSignedAngleFromAToB(a, b) 
//var tA = HORIZ_NORM;
//var tB = new vec2(1, 0.3);
//console.log("a to b ", getSignedAngleFromAToB(tA, tB));
//console.log("b to a ", getSignedAngleFromAToB(tB, tA));
//throw "dont continue";