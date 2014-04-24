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
Collideable.constructor = Collideable;

  // Collision data object to return to physics.
function CollisionData(collided, collidedWith) {
  // Did we collide with something? True or false.
  this.collided = collided;

  //The "stuff" that we collided with. Unimplemented for now, but just return an array of whatever the terrain objects are stored as, whether lines or beziers or boxs etc.
  //When a collision is found, I'm going to use a binary time search to recursively find the point in time where the first collision occurred.
  this.collidedWith = collidedWith;
}



//What I will be calling from physicsEngine. If there were no collisions, return an empty array as the collidedWith field.
function getCollisionData(ballState, LevelList, doNotCheck) {
  //state is a TempState object as seen in physics.js. The only parts you will probably care about in collision are:
  //state.pos           a vec2(x position, y position); the center of the circle you're checking collisions against. state.pos.x, state.pos.y
  //state.radius        the radius of the circle you're checking collisions against. 
  COLLISION_TEST_COUNT++;


  //code to check for collisions here. TODO optimize
  if (COLLISION_TEST_COUNT = PRINT_EVERY) {
    //console.log("checking collisions");
  }
  var stuffWeCollidedWith = [];
  //doNotCheck = [];
  for (var i = 0; i < LevelList.length; i++) {
    if (LevelList[i].collidesWith(ballState.pos, ballState.radius) ) {
      if (!contains(doNotCheck, LevelList[i].id)) {

        stuffWeCollidedWith.push(LevelList[i]);
      } else {
    //    console.log("had stuff");
      }
    } 
  }
  var didWeCollide = false;
  if (stuffWeCollidedWith.length > 0) {
    didWeCollide = true;
  }

  //create the CollisionData object to return to the physics function.
  var data = new CollisionData(didWeCollide, stuffWeCollidedWith);

  if (COLLISION_TEST_COUNT === PRINT_EVERY) {
    COLLISION_TEST_COUNT = 0;
  }


  return data;
}


//What I will be calling in the recursive physics bounds checking function to check the initial collision list.
function getCollisionDataInList(ballState, collidersToCheck, doNotCheck) {
  //code to check for collisions ONLY WITH THE THINGS IN THE PASSED LIST! Should be about the same as the above method but only searches this specific list, and returns the subset of it that is still being collided with.
  var stuffWeCollidedWith = [];
  for (var i = 0; i < collidersToCheck.length; i++) {
    
    if (!contains(doNotCheck, collidersToCheck[i].id)) {
      if (collidersToCheck[i].collidesWith(ballState.pos, ballState.radius)) {
        stuffWeCollidedWith.push(collidersToCheck[i]);
      }
    }
  }
  var didWeCollide = false;
  if (stuffWeCollidedWith.length > 0) {
    didWeCollide = true;
  }

  //create the CollisionData object to return to the physics function.
  var data = new CollisionData(didWeCollide, stuffWeCollidedWith);
  return data;
}