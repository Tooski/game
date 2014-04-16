/* 
 * collision.js, currently skeleton class explaining what the physics engine needs collision-wise.
 * 
 */




// Collideable parent class for all things collideable with by a collider.
function Collideable() {
  this.collidesWith = function (collider) { };
}



// Collision data object to return to physics.
function CollisionData(collided, collidedWith) {
  // Did we collide with something? True or false.
  this.collided = collided;

  //The "stuff" that we collided with. Unimplemented for now, but just return an array of whatever the terrain objects are stored as, whether lines or beziers or boxs etc.
  //When a collision is found, I'm going to use a binary time search to recursively find the point in time where the first collision occurred.
  this.collidedWith = collidedWith;
}



//What I will be calling from physicsEngine. If there were no collisions, return an empty array as the collidedWith field.
function getCollisions(state) {
  //state is a TempState object as seen in physics.js. The only parts you will probably care about in collision are:
  //state.pos           a vec2(x position, y position); the center of the circle you're checking collisions against. state.pos.x, state.pos.y
  //state.radius        the radius of the circle you're checking collisions against. 

  //code to check for collisions here


  var didWeCollide = true;    
  var stuffWeCollidedWith = [collidable1, collideable2, collideable3, etc];    // IF THE PLAYER IS CURRENTLY ROLLING ON A SURFACE, THAT SURFACE SHOULD STILL BE RETURNED IN THIS LIST UNLESS THE PLAYER HAS LEFT THE SURFACE!

  //create the CollisionData object to return to the physics function.
  var data = new CollisionData(didWeCollide, collidedWith);
  return data;
}