
/* 
 * collision.js, currently skeleton class explaining what the physics engine needs collision-wise.
 * 
 */
var PRINT_EVERY = 240;
var COLLISION_TEST_COUNT = 0;




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





//What I will be calling in the recursive physics bounds checking function to check the initial collision list.
//doNotCheck may be empty.
function getCollisionsInList(ballState, collidersToCheck, doNotCheck) {
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




var DEBUG_DRAW_RED = [];
var DEBUG_DRAW_GREEN = [];
var DEBUG_DRAW_BLUE = [];
var DEBUG_DRAW_ORANGE = [];
var DEBUG_DRAW_BROWN = [];
var DEBUG_DRAW_GRAY = [];
var DEBUG_DRAW_TAN = [];
var DEBUG_DRAW_YELLOW = [];
var DEBUG_DRAW_LIGHTBLUE = [];

var DEBUG_DRAW = true;



function DebugLine(p0, p1, lineWidth) {
  this.lineWidth = lineWidth;
  this.p0 = p0;
  this.p1 = p1;
}


function DebugPoint(p) {
  this.p = p;
}


function DebugCircle(pos, radius, lineWidth) {
  this.lineWidth = lineWidth;
  this.radius = radius;
  this.p = pos;
}


drawDebug = function (ctx) {
  ctx.save();
  var oldStroke = ctx.strokeStyle;
  var oldLineWidth = ctx.lineWidth;
  ctx.miterLimit = 3;

  drawDebugArray(DEBUG_DRAW_RED, "red", ctx);
  drawDebugArray(DEBUG_DRAW_GREEN, "#00FF00", ctx);
  drawDebugArray(DEBUG_DRAW_BLUE, "blue", ctx);
  drawDebugArray(DEBUG_DRAW_ORANGE, "orange", ctx);
  drawDebugArray(DEBUG_DRAW_BROWN, "brown", ctx);
  drawDebugArray(DEBUG_DRAW_GRAY, "gray", ctx);
  drawDebugArray(DEBUG_DRAW_TAN, "tan", ctx);
  drawDebugArray(DEBUG_DRAW_YELLOW, "yellow", ctx);
  drawDebugArray(DEBUG_DRAW_LIGHTBLUE, "lightblue", ctx);



  ctx.strokeStyle = oldStroke;
  ctx.lineWidth = oldLineWidth;
  //DEBUG_DRAW_BLUE = [];
  //DEBUG_DRAW_GREEN = [];
  //DEBUG_DRAW_RED = [];
  ctx.restore();
}




function drawDebugArray(array, color, ctx) {
  //draw blue debug
  ctx.beginPath();
  ctx.strokeStyle = color;
  for (var i = 0; i < array.length; i++) {
    //console.log("    DEBUG_DRAW_BLUE[", i, "] ", DEBUG_DRAW_BLUE[i]);
    if (array[i] instanceof DebugLine) {
      ctx.lineWidth = array[i].lineWidth;
      //ctx.lineCap = "round";

      //ctx.lineJoin = "round";
      ctx.moveTo(array[i].p0.x, array[i].p0.y);
      ctx.lineTo(array[i].p1.x, array[i].p1.y);
    } else if (array[i] instanceof DebugPoint) {
      ctx.moveTo(ctx.moveTo(array[i].p.x - 1, array[i].p.y - 1));
      ctx.fillRect(array[i].p.x - 1, array[i].p.y - 1, 3, 3);
    } else if (array[i] instanceof DebugCircle) {
      //throw "drawing circle";
      ctx.moveTo(array[i].p.x + array[i].radius, array[i].p.y);
      ctx.arc(array[i].p.x, array[i].p.y, array[i].radius, 0, 2 * Math.PI, false);
    }
  }
  ctx.stroke();
}