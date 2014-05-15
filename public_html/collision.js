
/* 
 * collision.js, currently skeleton class explaining what the physics engine needs collision-wise.
 * 
 */
var PRINT_EVERY = 240;
var COLLISION_TEST_COUNT = 0;


function DebugLine(p0, p1, lineWidth, color) {
  this.color = color;
  this.lineWidth = lineWidth;
  this.p0 = p0;
  this.p1 = p1;
}


function DebugPoint(p, lineWidth, color) {
  this.color = color;
  this.lineWidth = lineWidth;
  this.p = p;
}


drawDebug = function (ctx, drawList) {

  ctx.beginPath();

  for (var i = 0; i < DEBUG_DRAW.length; i++) {

    var oldLineWidth = ctx.lineWidth;
    ctx.lineWidth = drawList[i].lineWidth;
    //ctx.lineCap = "round";

    //ctx.lineJoin = "round";
    ctx.miterLimit = 3;
    var oldStroke = ctx.strokeStyle;
    ctx.strokeStyle = drawList[i].color;
    ctx.moveTo(drawList[i].p0.x, drawList[i].p0.y);
    ctx.lineTo(drawList[i].p1.x, drawList[i].p1.y);
  }
  ctx.stroke();

  ctx.strokeStyle = oldStroke;
  ctx.lineWidth = oldLineWidth;
}


  // Collideable parent class for all things collideable with by a collider.
function Collideable() {
  Entity.apply(this);
}
Collideable.prototype = new Entity();
Collideable.prototype.collidesWith = function (point, radius) { }; // for now just checks a point and its radius aka the hamster ball's center + radius to see if it collides. 
Collideable.prototype.collidesData = function (point, radius) { }; // for now just checks a point and its radius aka the hamster ball's center + radius to see if it collides. 
Collideable.constructor = Collideable;


/*
	RETURN:
		What was collided with.
		The EXACT time of the collision
		The collisions normalVec and surfaceVec (which represents the perp to the normalVec, not necessarily the surface collided with) ONLY IF THIS IS A SURFACE THAT MAY BE COLLIDED WITH.		
*/
  // Collision data object to return to physics.
function CollisionResults(collided, collisionList) {
  // Did we collide with something? True or false.
  this.collided = collided;


  //The "stuff" that we collided with. Unimplemented for now, but just return an array of whatever the terrain objects are stored as, whether lines or beziers or boxs etc.
  this.collisionList = collisionList;
}


/**
 * TerrainPoint object. Useful for collision data info.
 */
function TerrainPoint(pos, line0, line1) {
  this.x = pos.x;
  this.y = pos.y
  this.id = "" + (this.x * (this.x - this.y)) + " " + (this.y * (this.y - this.x));

  this.line0 = line0;
  this.line1 = line1;

  this.angle0 = "";
  this.angle1 = "";



  if (line0) {
    if (!line1) {   //Line 0 only



    } else {        //Both lines


      var p00 = line0.p0.subtract(pos);
      var p01 = line0.p1.subtract(pos);
      var v0 = p01.subtract(p00);
      var p10 = line1.p0.subtract(pos);
      var p11 = line1.p1.subtract(pos);
      var v1 = p11.subtract(p10);

      var perp0 = v0.perp().normalize();
      var perp1 = v1.perp().normalize();

      DEBUG_DRAW.push(new TerrainLine(pos, pos.add(perp0.multf(50))));
      DEBUG_DRAW.push(new TerrainLine(pos, pos.add(perp1.multf(50))));

      this.angle0 = getRadiansToHorizontal(perp0);
      this.angle1 = getRadiansToHorizontal(perp1);

      //if (line0.p0 === pos) {
      //  if (line1.p0 === pos) {
      //    throw "lines dont connect p0 to p1, might be allowable";
      //  } else if (line1.p1 === pos) {

      //  } else {
      //    throw "isnt a point on line1";
      //  }
      //} else if (line0.p1 === pos) {
      //  if (line1.p0 === pos) {

      //  } else if (line1.p1 === pos) {

      //    throw "lines dont connect p0 to p1, might be allowable";
      //  } else {
      //    throw "isnt a point on line1";
      //  }
      //} else {
      //  throw "isnt a point on line0";
      //}
    }


  } else if (line1) {//Line 1 only



  } else {
    throw "no line passed into TerrainPoint constructor.";
  }

  console.log("angle0, ", this.angle0, ", angle1, ", this.angle1);
}



//What I will be calling in the recursive physics bounds checking function to check the initial collision list.
//doNotCheck may be empty.
function getCollisionsInList(ballState, collidersToCheck, doNotCheck) {
  "use strict";
  //code to check for collisions ONLY WITH THE THINGS IN THE PASSED LIST! Should be about the same as the above method but only searches this specific list, and returns the subset of it that is still being collided with.
  var stuffWeCollidedWith = [];
  //console.log("collidersToCheck, ", collidersToCheck);
  for (var i = 0; i < collidersToCheck.length; i++) {
    if (!contains(doNotCheck, collidersToCheck[i])) {
      //data { collided, collidedLine, collidedP0, collidedP1, surface, perpendicularIntersect }
      var data = collidersToCheck[i].collidesData(ballState.pos, ballState.radius);
      //console.log(data);
      if (data.collided) {
        stuffWeCollidedWith.push(data);
      }

      //if (data.collidedP0) {
      //  stuffWeCollidedWith.push(new TerrainPoint(collidersToCheck[i].p0, collidersToCheck[i].adjacent0, collidersToCheck[i]));
      //}
      //if (data.collidedP1) {
      //  stuffWeCollidedWith.push(new TerrainPoint(collidersToCheck[i].p1, collidersToCheck[i], collidersToCheck[i].adjacent1));
      //}
      //if (data.collidedLine) {
      //  stuffWeCollidedWith.push(collidersToCheck[i]);
      //}

    } else {
      //console.log("doNotCheck contained colliders[i]: ", collidersToCheck[i]);
    }
  }
  var didWeCollide = false;
  if (stuffWeCollidedWith.length > 0) {
    didWeCollide = true;
  }
  //console.log("stuffWeCollidedWith:", stuffWeCollidedWith);
  return stuffWeCollidedWith;
}