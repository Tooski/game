
/* 
 * collision.js, currently skeleton class explaining what the physics engine needs collision-wise.
 * 
 */
var PRINT_EVERY = 240;
var COLLISION_TEST_COUNT = 0;

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
function TerrainPoint(pos, leftLine, rightLine) {
  this.x = pos.x;
  this.y = pos.y;
  this.leftLine = leftLine;
  this.rightLine = rightLine;
}
function TerrainPoint(pos, terrainLine) {
  this.x = pos.x;
  this.y = pos.y;
  if (pos === terrainLine.p0) {
    this.leftLine = terrainLine.adjacent0;
    this.rightLine = terrainLine;
  } else if (pos === terrainLine.p1) {
    this.leftLine = terrainLine;
    this.rightLine = terrainLine.adjacent1;
  } else {
    throw "bad pos / terrainLine combo in TerrainPoint constructor";
  } 
}



//What I will be calling in the recursive physics bounds checking function to check the initial collision list.
//doNotCheck may be empty.
function getCollisionsInList(ballState, collidersToCheck, doNotCheck) {
  "use strict";
  //code to check for collisions ONLY WITH THE THINGS IN THE PASSED LIST! Should be about the same as the above method but only searches this specific list, and returns the subset of it that is still being collided with.
  var stuffWeCollidedWith = [];
  //console.log("collidersToCheck, ", collidersToCheck);
  for (var i = 0; i < collidersToCheck.length; i++) {
    if (!contains(doNotCheck, collidersToCheck[i].id)) {
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
      console.log("doNotCheck contained colliders[i]: ", collidersToCheck[i]);
    }
  }
  var didWeCollide = false;
  if (stuffWeCollidedWith.length > 0) {
    didWeCollide = true;
  }
  //console.log("stuffWeCollidedWith:", stuffWeCollidedWith);
  return stuffWeCollidedWith;
}