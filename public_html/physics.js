/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 * Author Travis Drake
 */
var PHYS_DEBUG = true;
var COLLISION_PRECISION_ITERATIONS = 5;
var LOCK_MIN_ANGLE = 45.0                / 180 * Math.PI;  //ANGLE OF COLLISION BELOW WHICH NOT TO BOUNCE.

//INPUT TYPES AND CORRESPONDING INT VALUE
var inLeft = 0;
var inRight = 1;
var inUp = 2;
var inDown = 3;
var inJump = 4;
var inBoost = 5;
var inLock = 6;


//var CONST_DRAG = 0.5;


// this should work in just about any browser, and allows us to use performance.now() successfully no matter the browser.
// source http://www.sitepoint.com/discovering-the-high-resolution-time-api/
window.performance = window.performance || {};
performance.now = (function () {
  return performance.now ||
         performance.mozNow ||
         performance.msNow ||
         performance.oNow ||
         performance.webkitNow ||
         function () { return new Date().getTime(); };
})();



// this thing is just useful for storing potential states in an object.
function TempState(pos, vel, radius, timeDelta, eventList) {
  this.pos = pos;
  this.vel = vel;
  this.radius = radius;
  this.timeDelta = timeDelta;
  this.eventList = eventList;
}
function TempState(pos, vel, radius, timeDelta) { // overloaded constructor
  this.pos = pos;
  this.vel = vel;
  this.radius = radius;
  this.timeDelta = timeDelta;
  this.eventList = [];
}



// PhysParams object contains all the physics values. These will not change between characters. 
// This exists because it will be used later on to implement other terrain types, whose static
// effect values will be passed in here.
function PhysParams(gravity) {
  this.gravity = gravity;
}



// This object contains all the values that are relative to the PLAYER. IE, anything that would be specific to different selectable characters.
function ControlParams(gLRaccel, aLRaccel, aUaccel, aDaccel, gBoostLRvel, aBoostLRvel, boostDownVel, jumpVel, doubleJumpVel, numAirCharges, dragBaseAmt, dragTerminalVel, dragExponent) {
  this.gLRaccel = gLRaccel;                 //x acceleration exerted by holding Left or Right on the surface.
  this.aLRaccel = aLRaccel;                 //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = aUaccel;                   //y acceleration exerted by holding up in the air.
  this.aDaccel = aDaccel;                   //y acceleration exerted by holding down in the air.
  this.gBoostLRvel = gBoostLRvel;           //x velocity that a boost on the surface sets.
  this.aBoostLRvel = aBoostLRvel;           //x velocity that a boost in the air sets.
  this.boostDownVel = boostDownVel;         //-y velocity that a downboost sets in the air.
  this.jumpVel = jumpVel;                   //y velocity that a surface jump sets.
  this.doubleJumpVel = doubleJumpVel;       //y velocity that a double jump sets.

  this.numAirCharges = numAirCharges;       //number of boost / double jumps left in the air.

  this.dragBase = dragBaseAmt;              //base drag exerted
  this.dragTerminalVel = dragTerminalVel;   //the velocity at which drag and gravity will be equal with no other factors present.
  this.dragExponent = dragExponent;         //the exponent used to create the drag curve.
}



function PlayerModel(controlParams, ballRadius, startPoint, numAirCharges, terrainSurface) {     // THIS IS THE PLAYER PHYSICS MODEL, EXTENDABLE FOR DIFFERENT CHARACTER TYPES.
  // Player properties.
  this.radius = ballRadius;          //float radius
  this.controlParameters = controlParams;

  // Movement values.
  this.pos = startPoint;             //vec2 for position!
  this.vel = new vec2(0.0, 0.0);     //vec2 for velocity!

  this.timeDelta = 0.0;

  this.surfaceOn = terrainSurface;
  // STATE FLAGS! READ THE COMMENTS BELOW BEFORE USING!
  this.airBorne = true;              // BE CAREFUL WITH THESE. IF THE PLAYER IS ON THE surface, airBorne should ALWAYS be false. 
  this.surfaceLocked = false;         // If the player is on the surface but is not holding the lock button, then this should ALSO be false.

  this.airChargeCount = numAirCharges; //number of boosts / double jumps left.
}



// The acceleration vector state. Stores the component vectors and resulting vector in order to efficiently return the current acceleration in the air or on the surface without uneccessary calculations.
function AccelState(physEng) { 
  this.surfaceAccel = vec2(0.0, 0.0);
  this.airAccel = vec2(0.0, 0.0);
  this.physEng = physEng;
  
  this.getAirAccel = function() {return airAccel}
  this.getsurfaceAccel = function() {return surfaceAccel}

  this.updateStates = function (inputState) {  // TODO
    
  }
}



// The input state object. May replace later on with however we handle input, but this is how I'm visualizing it for now.
function InputState() {
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.jump = false;
  this.boost = false;
  this.lock = false;
  this.surfaceOn = null; // The terrain object that the player is locked to. Must extend TerrainObject.
}



// Physics Engine constructor.
function PhysEng(physParams, playerModel) {
  this.player = playerModel;                        // the players character model
  this.ctrl = playerModel.controlcontrolParameters; // control parameters.
  this.phys = physParams;                           // physics parameters
  this.inputState = new InputState();
  //this.activeEvents = [];                           // array of active events. ???? DONT NEED THIS ???? TODO
  this.accelState = new AccelState(this);
  if (PHYS_DEBUG) {
    this.printStartState();
  }
}


// CHECKS FOR COLLISIONS, HANDLES THEIR TIME STEPS, AND THEN CALLS airStep AND / OR surfaceStep WHERE APPLICABLE
// eventList is a list of event objects that occurred since last update, sorted by the order in which they occurred.
PhysEng.prototype.update = function (timeDelta, eventList) { // ______timeDelta IS ALWAYS A FLOAT REPRESENTING THE FRACTION OF A SECOND ELAPSED, WHERE 1.0 IS ONE FULL SECOND. _____________                           
  if (PHYS_DEBUG) {
    console.log("\nEntered update(timeDelta), timeDelta = %.3f\n", timeDelta);
    this.printState(true, false, false);
  }

  var state = new TempState(this.player.pos, this.player.vel, 0.0);   //creates the initial state of the TempPlayer.
  eventList.push(new RenderEvent(timeDelta)); //Set up the last event in the array to be our render event, so that the loop completes up to the render time.

  var timeCompleted = 0.0;
  for (i = 0; i < eventList.length; i++) { //Handle all the events that have happened since last frame at their respective times.
    var event = eventList[i];
    var newState = stepToAndProcessEvent(state, event); // Guarantees time has completed up to the event.
  }                                   // PHYSICS ARE UP TO DATE. GO AHEAD AND RENDER.

  this.player.timeDelta = 0.0;
  //Render();                       //________ CALL THE RENDER FUNCTION HERE! ________// TODO
}


// Returns the players new position and velocity (in a TempState object) after an airStep of this length. Does not modify values.
PhysEng.prototype.airStep = function (state, timeGoal) { 
  var accelVec = this.accelState.getAirAccel();
  var lastVel = state.vel;
  var lastPos = state.pos;
  var curVel = lastVel.plus(accelVec.multf(timeDelta));
  var curPos = lastPos.plus(lastVel.plus(curVel).divf(2.0));

  var startTime = state.timeAt;
  var tempState = new TempState(curPos, curVel, player.radius, timeGoal);
  var collisionData = getCollisionData(tempState);
  var returnState;
  if (!collisionData.collided) {  //IF WE DIDNT COLLIDE, THIS SHOULD BE GOOD? TODO CHECK TO MAKE SURE WE DIDNT MOVE MORE THAN RADIUS IN THIS STEP.
    returnState = new TempState(curPos, curVel, player.Radius, timeGoal)
  } else {                        //HANDLE RECURSIVELY, TODO DONE?
    var minCollisionTime = startTime;
    var maxCollisionTime = timeGoal;
    
    var newDelta = minCollisionTime + (maxCollisionTime - minCollisionTime) / 2.0;
    var collisions = collisionData.collidedWith;
    curVel = lastVel.plus(accelVec.multf(newDelta));
    curPos = lastPos.plus(lastVel.plus(curVel).divf(2.0));

    tempState = new TempState(curPos, curVel, player.radius, newDelta);

    //If we havent narrowed it down to a single collision yet then keep going past the accuracy point.
    for (var i = 0; i < COLLISION_PRECISION_ITERATIONS || collisions.length > 1; i++) { //find collision point
      collisionData = getCollisionDataInList(tempState, collisions);
      if (!collisionData.collided) {  // NO COLLISION
        minCollisionTime = newDelta;
      } else {                        // COLLIDED
        maxCollisionTime = newDelta;
        collisions = collisionData.collidedWith;
      }

      newDelta = minCollisionTime + (maxCollisionTime - minCollisionTime) / 2.0;

      curVel = lastVel.plus(accelVec.multf(newDelta));
      curPos = lastPos.plus(lastVel.plus(curVel).divf(2.0));

      tempState = new TempState(curPos, curVel, player.radius, newDelta);
    }   // tempstate is collision point.                                              //Optimize by passing directly later, storing in named var for clarities sake for now.
    returnState = tempState;
    returnState.eventList = collisions; // TODO IMPLEMENT EVENT TYPE TO BE RETURNED IN THE CASE OF A COLLISION.
    if (PHYS_DEBUG && collisions.length > 1) {                                            //DEBUG CASE CHECKING, REMOVE WHEN PHYSICS IS BUG FREE.
      console.log("collisions.length() shouldnt be > 1 but is, in airStep");
    }

  } // done with stepping
  return returnState;

}
// Steps to the end of the event and handles any intermediate events recursively.
PhysEng.prototype.stepToEndOfEvent = function(state, event) {
  //while (!eventDone) {                   //The physics step loop. Checks for collisions / lockbreaks and discovers the time they occur at. Continues stepping physics until it is caught up to "timeDelta".
  var newEvents = [];
  if (this.player.airBorne) {               //In the air, call airStep
    state = this.airStep(state, event.time); // TODO STATE SHOULD HAVE EVENTS NOT TerrainSurfaces.
    for (var k = 0; k < state.eventList.length; k++) {
      newEvents.push() = state.eventList;
    }

  } else {                             //On surface, call surfaceStep 
    state = this.surfaceStep(state, event.time);
    for (var k = 0; k < state.eventList.length; k++) {
      newEvents.push() = state.eventList;
    }
  }

  var newTerrainEvents = [];
  var newCollectibleEvents = [];
  var goal = false;
  var collectibles = false;
  if (newEvents.length > 0) { // WE DIDNT FINISH, A NEW EVENT HAPPENED. ALT state.timeDelta < event.time

    for (var j = 0; j < newEvents.length; j++) {         //THESE SHOULD BE EVENTS THAT CONTAIN TERRAIN COLLISIONS.
      if (newEvents[j] instanceof TerrainSurface) {      //Something we should react to hitting.
        newTerrainEvents.push(newEvents[j]);
      } else if (newEvents[j] instanceof GoalEvent) {         
        goal = true;
      } else if (newEvents[j] instanceof CollectibleEvent) {
        collectibles = true;
        newCollectibleEvents.push(newEvents[j]);
      }
    }


    if (goal) {
                        // TODO HANDLE GOAL
    }  else if (collectibles) {
                      // TODO HANDLE COLLECTIBLES
    } else if (newTerrainEvents.length > 0) {
      this.handleTerrainAirCollision(tempState, newTerrainEvents); // TODO REFACTOR TO PASS COLLISION OBJECT WITH ADDITIONAL DATA. SEE handleTerrainAirCollision COMMENTS FOR MORE INFO.
    }

    
  } else {                           // WE DID FINISH

    event.handler(this);              // LET THE EVENTS HANDLER DO WHAT IT NEEDS TO TO UPDATE THE PHYSICS STATE, AND CONTINUE ON IN TIME TO THE NEXT EVENT.
  }

  //}                                 //COMPLETED TIMESTEP UP TO WHEN EVENT HAPPENED.


}



// A step while the player is in the surface. Returns the players new position and velocity and time and any events that happened (in a TempState object) after attempting surfaceStep of this length. Does not modify values.
PhysEng.prototype.surfaceStep = function (state, timeDelta) { 
  // ___+____+____+___ magnitude acceleration along a sloped surface = magnitude of force * sin(angle between force and surface normal)

  var collisionData = getCollisionData(stepState);
  
  if (!collisionData.collided) {
                                 // WE ARE NOW IN THE AIR. RECURSIVELY FIND WHERE WE LEFT THE SURFACE, HANDLE THAT, THEN STEP ACCORDINGLY DEPENDING ON WHAT WE'RE ON AFTERWARDS.
  } else if (collisionData.collidedWith.length === 1 && collisionData.collidedWith[0] === this.player.surfaceOn) {
                                 // WE ARE STILL ON THE SURFACE WE WERE ON LAST FRAME, NO OTHER COLLISIONS, HANDLE NORMALLY, TODO
  } else {     
                                 // WE COLLIDED With SOMEthING NEW, HANDLE COLLISIONS RECURSIVELY OR SOMESHIT, TODO

  }

  // REMEMBER TO UPDATE this.player.timeDelta to the state where the surfaceStep ended.
}


//This code handles a terrain collision. TODO REFACTOR TO TAKE A COLLISION OBJECT THAT HAS A NORMAL OF COLLISION, AND A SINGLE SURFACE THAT MAY BE LOCKED TO, IF ANY. THIS WILL COVER MULTICOLLISIONS AND CORNERS / ENDPOINT CASES.
// RETURNS NOTHING, SIMPLY SETS STATES.
PhysEng.prototype.handleTerrainAirCollision = function (ballState, stuffWeCollidedWith) {
  var normalBallVel = ballState.vel.normalize();
  var angleToNormal;
  if (stuffWeCollidedWith.length > 1) {
    var collisionNormal = stuffWeCollidedWith[0].getNormalAt(ballState.pos);
    for (var i = 1; i < stuffWeCollidedWith.length; i++) {
      collisionNormal = collisionNormal.add(stuffWeCollidedWith[i]);
    }
    angleToNormal = Math.acos(collisionNormal.normalize().dot(normalBallVel));
  } else {
    angleToNormal = Math.acos(stuffWeCollidedWith[0].getNormalAt(ballState.pos).dot(normalBallVel));
  }


  var COLLISION_GLANCING_ENOUGH_TO_AUTO_LOCK = false; //TODO do some math
  if (COLLISION_GLANCING_ENOUGH_TO_AUTO_LOCK) {
    var velocityMag = ballState.vel.length();
    var surfaceVec = stuffWeCollidedWith[0].getSurfaceAt(ballState.pos);      //TODO OHGOD REFACTOR TO THIS METHOD TAKING A COLLISION OBJECT THAT STORES NORMALS AND THE SINGLE SURFACE TO LOCK TO
    var surfaceAngle = surfaceVec.dot(normalBallVel);
    var surfaceInvertAngle = surfaceVec.negate().dot(normalBallVel);

    if (surfaceAngle > surfaceInvertAngle) {
      surfaceVec = surfaceVec.negate();
    }
    this.player.pos = ballState.pos;
    this.player.vel = surfaceVec.multf(velocityMag);
    this.player.airBorne = false;
    this.player.surfaceLocked = inputState.lock;

  } else if (this.inputState.lock && (angleToNormal > LOCK_MIN_ANGLE || angleToNormal < -LOCK_MIN_ANGLE)) { // ATTEMPT LOCK CASE CHECK STUFF AND THEN LOCK IF WITHIN BOUNDARIES! TODO IS THE NEGATIVE LOCK_MIN_ANGLE CHECK NEEDED!!!?
    var velocityMag = ballState.vel.length();
    var surfaceVec = stuffWeCollidedWith[0].getSurfaceAt(ballState.pos); // REFACTOR TO USE NEW COLLISION OBJECT
    var surfaceAngle = surfaceVec.dot(normalBallVel);
    var surfaceInvertAngle = (surfaceVec.negate()).dot(normalBallVel);

    if (surfaceAngle > surfaceInvertAngle) {
      surfaceVec = surfaceVec.negate();
    }
    this.player.pos = ballState.pos;
    this.player.vel = surfaceVec.multf(velocityMag);
    this.player.airBorne = false;
    this.player.surfaceLocked = inputState.lock;
    this.player.surfaceOn = stuffWeCollidedWith[0]; // TODO REFACTOR TO USE NEW COLLISION OBJECT
  } else {                                                          // BOUNCE. TODO implement addition of normalVector * jumpVel to allow jump being held to bounce him higher?        
    this.player.vel = getReflectionVector(ballState.vel, stuffWeCollidedWith[0].getNormalAt(ballState.pos)); //TODO REFACTOR TO USE NEW COLLISION OBJECT
    this.player.pos = ballState.pos;
    this.player.airBorne = true;
    //this.player.surfaceOn = null;      //TODO remove. This shouldnt be necessary as should be set when a player leaves a surface.
  }
  this.player.timeDelta = ballState.timeDelta;
}

  // Self explanatory. For debug purposes.
PhysEng.prototype.printState = function (printExtraPlayerDebug, printExtraControlsDebug, printExtraPhysDebug) {
  console.log("Player: ");
  console.log("  pos: %.2f, %.2f", this.player.pos.x, this.player.pos.y);
  console.log("  vel: %.2f, %.2f", this.player.vel.x, this.player.vel.y);
  if (printExtraPlayerDebug) {
    console.log("  airBorne:       %s", this.player.airBorne);
    console.log("  surfaceLocked:   %s", this.player.surfaceLocked);
    console.log("  airChargeCount: %d", this.player.airChargeCount);
  }
  console.log("");

  if (printExtraControlsDebug) {
    console.log("Controls: ");
    console.log("  gLRaccel: %.2f", this.player.controlParameters.gLRaccel);
    console.log("  aLRaccel: %.2f", this.player.controlParameters.aLRaccel);
    console.log("  aUaccel: %.2f", this.player.controlParameters.aUaccel);
    console.log("  aDaccel: %.2f", this.player.controlParameters.aDaccel);
    console.log("  gBoostLRvel: %.2f", this.player.controlParameters.gBoostLRvel);
    console.log("  aBoostLRvel: %.2f", this.player.controlParameters.aBoostLRvel);
    console.log("  boostDownVel: %.2f", this.player.controlParameters.boostDownVel);
    console.log("  jumpVel: %.2f", this.player.controlParameters.jumpVel);
    console.log("  doubleJumpVel: %.2f", this.player.controlParameters.doubleJumpVel);
    console.log("  numAirCharges: %.2f", this.player.controlParameters.numAirCharges);
    console.log("  dragBase: %.2f", this.player.controlParameters.dragBase);
    console.log("  dragTerminalVel: %.2f", this.player.controlParameters.dragTerminalVel);
    console.log("  dragExponent: %.2f", this.player.controlParameters.dragExponent);
    console.log("");
  }


  if (printExtraPhysDebug) {

    console.log("PhysParams: ");
    console.log("  gravity: %.2f", this.phys.gravity);
    console.log("");
  }
  console.log("");

}

// Self explanatory. For debug purposes.
PhysEng.prototype.printStartState = function () {
  console.log("Created PhysEng");
  console.log("Controls: ");
  console.log("  gLRaccel: %.2f", this.player.controlParameters.gLRaccel);
  console.log("  aLRaccel: %.2f", this.player.controlParameters.aLRaccel);
  console.log("  aUaccel: %.2f", this.player.controlParameters.aUaccel);
  console.log("  aDaccel: %.2f", this.player.controlParameters.aDaccel);
  console.log("  gBoostLRvel: %.2f", this.player.controlParameters.gBoostLRvel);
  console.log("  aBoostLRvel: %.2f", this.player.controlParameters.aBoostLRvel);
  console.log("  boostDownVel: %.2f", this.player.controlParameters.boostDownVel);
  console.log("  jumpVel: %.2f", this.player.controlParameters.jumpVel);
  console.log("  doubleJumpVel: %.2f", this.player.controlParameters.doubleJumpVel);
  console.log("  numAirCharges: %.2f", this.player.controlParameters.numAirCharges);
  console.log("  dragBase: %.2f", this.player.controlParameters.dragBase);
  console.log("  dragTerminalVel: %.2f", this.player.controlParameters.dragTerminalVel);
  console.log("  dragExponent: %.2f", this.player.controlParameters.dragExponent);
  console.log("");

  console.log("PhysParams: ");
  console.log("  gravity: %.2f", this.phys.gravity);
  console.log("");

  console.log("Player: ");
  console.log("  radius: %.2f", this.player.radius);
  console.log("  starting pos: %.2f, %.2f", this.player.pos.x, this.player.pos.y);
  console.log("  starting vel: %.2f, %.2f", this.player.vel.x, this.player.vel.y);
  console.log("  airBorne: %s", this.player.airBorne);
  console.log("  surfaceLocked: %s", this.player.surfaceLocked);
  console.log("");
  console.log("");
}







//GET REFLECTION VECTOR. velVec = vector to get the reflection of. normalVec, the normal of the surface that you're reflecting off of. TODO possibly a bug if velVec isnt normalized for the function and then length remultiplied at the end? P sure this is right but if bounces are buggy start here.
getReflectionVector = function (velVec, normalVec) {
  // Basically if you have a vector v, which represents the object's velocity, and a normalized normal vector n, 
  // which is perpendicular to the surface with which the object collides, then the new velocity v' is given by the equation
  //     v' = 2 * (v . n) * n - v;
  // Where '*' is the scalar multiplication operator, '.' is the dot product of two vectors, and '-' is the subtraction operator 
  // for two vectors. v is reflected off of the surface, and gives a reflection vector v' which is used as the new velocity of the object. 

  return normalVec.multf(2.0 * velVec.dot(normalVec)).subtract(velVec);
}




// Event class. All events interpreted by the physics engine must extend this, as seen below. 
// Currently input and render events exist. Physics events will probably follow shortly (for example, when the player passes from one terrain line to another, etc).
function Event(eventTime) {    //eventTime is the amount of time since last rendered frame that the event occurred at. THIS IS A PARENT CLASS. THERE ARE SUBCLASSES FOR THIS, THIS CLASS IS NEVER ACTUALLY INSTANTIATED.
  this.time = eventTime;
  this.handler = function (physEng) { };     // NEEDS TO BE OVERRIDDEN IN CHILDREN CLASSES
}



// InputEvent class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEvent(eventTime, inputType, pressed) {   //
  Event.apply(this, [eventTime])
  this.inputType = inputType;
  this.pressed = pressed;       // PRESSED DOWN OR RELEASED
}

InputEvent.prototype = new Event();
InputEvent.prototype.constructor = InputEvent;
InputEvent.prototype.handler = function(physEng) {          //THIS CODE HANDLES INPUT CHANGES.  TODO
  switch (this.inputType) {
    case inLeft:
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    case inRight: 
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    case inUp:
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    case inDown: 
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    case inJump:
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    case inBoost:
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    case inLock:
      if(this.pressed) {  // Input was just pressed down.

      } else {            // Input was just released.
      
      }
      break;
    default:
      throw "Wtf bad inputType. Please reference the inName list at the top of physics.js";
  }
}




// Event class for the Collectible Event when the player runs into a collectible. 
function CollectibleEvent(eventTime) {
  Event.apply(this, [eventTime])
}

CollectibleEvent.prototype = new Event();
CollectibleEvent.prototype.constructor = CollectibleEvent;
CollectibleEvent.prototype.handler = function (physEng) {
  return;
}




// Event class for the Goal Event. TODO IMPLEMENT, NEEDS TO STORE WHICH GOAL AND ANY OTHER RELEVENT VICTORY INFORMATION.
function GoalEvent(eventTime) { // eventTime is deltaTime since last frame.
  Event.apply(this, [eventTime])
}

GoalEvent.prototype = new Event();
GoalEvent.prototype.constructor = GoalEvent;
GoalEvent.prototype.handler = function (physEng) {
  return;
}




// Event class for the render event. One of these should be the last event in the eventList array passed to update. NOT STORED IN REPLAYS.
function RenderEvent(eventTime) { // eventTime should be deltaTime since last frame, the time the physics engine should complete up to before rendering.
  Event.apply(this, [eventTime])
}

RenderEvent.prototype = new Event();
RenderEvent.prototype.constructor = RenderEvent;
RenderEvent.prototype.handler = function (physEng) {
  return;
}









// MAIN CODE TESTING BS HERE
//var physParams = new PhysParams(0.2);
//var controlParams = new ControlParams(0.1, 0.08, 0.04, 0.04, 2.0, 2.0, 2.0, 4.0, 3.0, 1, 0.0, 10.0, 2.0);
//var playerModel = new PlayerModel(controlParams, 0.5, new vec2(10, 10), 1, null);
//var physeng = new PhysEng(physParams, playerModel);
//physeng.update(0.001, []);
//physeng.update(0.001, []);
//physeng.update(0.001, []);
//physeng.update(0.001, []);
//physeng.update(0.001, []);