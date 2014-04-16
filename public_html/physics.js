/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 * Author Travis Drake
 */
var PHYS_DEBUG = true;
var COLLISION_PRECISION_ITERATIONS = 5;
var AUTO_LOCK_ANGLE = 10.0                / 180 * Math.PI;  //ANGLE OF COLLISION BELOW WHICH NOT TO BOUNCE.

//INPUT TYPES!
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
function TempState(pos, vel, radius, timeDelta) {
  this.pos = pos;
  this.vel = vel;
  this.radius = radius;
  this.timeDelta = timeDelta;
}
function TempState(px, py, vx, vy, radius, timeDelta) { //overloaded constructor.
  this.pos = vec2(px, py);
  this.vel = vec2(vx, vy);
  this.radius = radius;
  this.timeDelta = timeDelta;
}



// PhysParams object contains all the physics values. These will not change between characters. 
// This exists because it will be used later on to implement other terrain types, whose static
// effect values will be passed in here.
function PhysParams(gravity) {
  this.gravity = gravity;
}



// This object contains all the values that are relative to the PLAYER. IE, anything that would be specific to different selectable characters.
function ControlParams(gLRaccel, aLRaccel, aUaccel, aDaccel, gBoostLRvel, aBoostLRvel, boostDownVel, jumpVel, doubleJumpVel, numAirCharges, dragBaseAmt, dragTerminalVel, dragExponent) {
  this.gLRaccel = gLRaccel;                 //x acceleration exerted by holding Left or Right on the ground.
  this.aLRaccel = aLRaccel;                 //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = aUaccel;                   //y acceleration exerted by holding up in the air.
  this.aDaccel = aDaccel;                   //y acceleration exerted by holding down in the air.
  this.gBoostLRvel = gBoostLRvel;           //x velocity that a boost on the ground sets.
  this.aBoostLRvel = aBoostLRvel;           //x velocity that a boost in the air sets.
  this.boostDownVel = boostDownVel;         //-y velocity that a downboost sets in the air.
  this.jumpVel = jumpVel;                   //y velocity that a ground jump sets.
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

  this.surfaceOn = terrainSurface;
  // STATE FLAGS! READ THE COMMENTS BELOW BEFORE USING!
  this.airBorne = true;              // BE CAREFUL WITH THESE. IF THE PLAYER IS ON THE GROUND, airBorne should ALWAYS be false. 
  this.groundLocked = false;         // If the player is on the ground but is not holding the lock button, then this should ALSO be false.

  this.airChargeCount = numAirCharges; //number of boosts / double jumps left.
}



// The acceleration vector state. Stores the component vectors and resulting vector in order to efficiently return the current acceleration in the air or on the ground without uneccessary calculations.
function AccelState(physEng) { 
  this.groundAccel = vec2(0.0, 0.0);
  this.airAccel = vec2(0.0, 0.0);
  this.physEng = physEng;
  
  this.getAirAccel = function() {return airAccel}
  this.getGroundAccel = function() {return groundAccel}

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
  this.lockedTo = null; // The terrain object that the player is locked to. Must extend TerrainObject.
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


// CHECKS FOR COLLISIONS, HANDLES THEIR TIME STEPS, AND THEN CALLS airStep AND / OR groundStep WHERE APPLICABLE
// eventList is a list of event objects that occurred since last update, sorted by the order in which they occurred.
PhysEng.prototype.update = function (timeDelta, eventList) { // ______timeDelta IS ALWAYS A FLOAT REPRESENTING THE FRACTION OF A SECOND ELAPSED, WHERE 1.0 IS ONE FULL SECOND. _____________                           
  if (PHYS_DEBUG) {
    console.log("\nEntered update(timeDelta), timeDelta = %.3f\n", timeDelta);
    this.printState(true, false, false);
  }

  var state = new TempState(player.pos, player.vel, 0.0);   //creates the initial state of the TempPlayer.
  eventList[eventList.length] = new RenderEvent(timeDelta); //Set up the last event in the array to be our render event, so that the loop completes up to the render time.

  for (i = 0; i < eventList.length; i++) {
    var event = eventList[i];
    while (!eventDone) {                   //The physics step loop. Checks for collisions / lockbreaks and discovers the time they occur at. Continues stepping physics until it is caught up to "timeDelta".
      if (player.airBorne) {               //In the air, call airStep
        state = this.airStep(state, eventTime);
      } else {                             //On ground, call groundStep 
        state = this.groundStep(state, eventTime);
      }
    }                                 //COMPLETED TIMESTEP UP TO WHEN EVENT HAPPENED.

    event.handler(this);              // LET THE EVENTS HANDLER DO WHAT IT NEEDS TO TO UPDATE THE PHYSICS STATE, AND CONTINUE ON IN TIME TO THE NEXT EVENT.
  }                                   // PHYSICS ARE UP TO DATE. GO AHEAD AND RENDER.

  Render();                       //________ CALL THE RENDER FUNCTION HERE! ________// TODO
}


// Returns the players new position and velocity (in a TempState object) after an airStep of this length. Does not modify values.
PhysEng.prototype.airStep = function (state, timeDelta) { 
  var accelVec = this.accelState.getAirAccel();
  var lastVel = state.vel;
  var lastPos = state.pos;
  var curVel = lastVel.plus(accelVec.multf(timeDelta));
  var curPos = lastPos.plus(lastVel.plus(curVel).divf(2.0)); 
  
  var tempState = new TempState(curPos, curVel, player.radius, timeDelta);
  var collisionData = getCollisionData(tempState);
  if (!collisionData.collided) {  //IF WE DIDNT COLLIDE, THIS SHOULD BE GOOD?
    this.player.vel = curVel;
    this.player.pos = curPos;
  } else {                        //HANDLE RECURSIVELY, TODO DONE?
    var minCollisionTime = 0.0;
    var maxCollisionTime = timeDelta;
    
    var newDelta = minCollisionTime + (maxCollisionTime - minCollisionTime) / 2.0;
    var collisions = collisionData.collidedWith;
    curVel = lastVel.plus(accelVec.multf(newDelta));
    curPos = lastPos.plus(lastVel.plus(curVel).divf(2.0));

    tempState = new TempState(curPos, curVel, player.radius, newDelta);


    for (var i = 0; i < COLLISION_PRECISION_ITERATIONS || collisions.length > 1; i++) { //If we havent narrowed it down to a single collision yet then keep going past the accuracy point.

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
    }
    var thingWeCollidedWith = collisions[0];                                              //Optimize by passing directly later, storing in named var for clarities sake for now.

    if (PHYS_DEBUG && collisions.length > 1) {                                            //DEBUG CASE CHECKING, REMOVE WHEN PHYSICS IS BUG FREE.
      throw "collisions.length shouldnt be > 1 but is, in airStep"
    }

    if (thingWeCollidedWith instanceof TerrainSurface) {      //Something we should react to hitting.
      this.handleTerrainCollision(tempState, thingWeCollidedWith);
    } else if (thingWeCollidedWith instanceof Goal) {         //TODO WE BEAT THE LEVEL, REACT ETC
      
    } else if (thingWeCollidedWith instanceof Collectible) {  //TODO HANDLE COLLECTIBLES
      
    }
  }
}




PhysEng.prototype.groundStep = function (state, timeDelta) { // A step while the player is in the ground. Returns the players new position and velocity (in a TempState object) after a groundStep of this length. Does not modify values.
  // ___+____+____+___ magnitude acceleration along a sloped surface = magnitude of force * sin(angle between force and surface normal)
  var collisionData = getCollisionData(stepState);
  
  if (!collisionData.collided) {
                                 // WE ARE NOW IN THE AIR. RECURSIVELY FIND WHERE WE LEFT THE SURFACE, HANDLE THAT, THEN STEP ACCORDINGLY DEPENDING ON WHAT WE'RE ON AFTERWARDS.
  } else if (collisionData.collidedWith.length === 1 && collisionData.collidedWith[0] === this.player.surfaceOn) {
                                 // WE ARE STILL ON THE SURFACE WE WERE ON LAST FRAME, NO OTHER COLLISIONS, HANDLE NORMALLY, TODO
  } else {     
                                 // WE COLLIDED With SOMEthING NEW, HANDLE COLLISIONS RECURSIVELY OR SOMESHIT, TODO
  }
}


//This code handles a terrain collision 
PhysEng.prototype.handleTerrainCollision = function (ballState, thingWeCollidedWith) {
  if (this.inputState.lock) { // ATTEMPT LOCK CASE CHECK STUFF AND THEN LOCK IF WITHIN BOUNDARIES! TODO

  } else {                    // ATTEMPT TO BOUNCE. Should really lock to surface at low bounce speeds though. TODO USE COLLISION SPEED TO TEST IF WE SHOULD AUTO LOCK. 
    this.player.vel = getReflectionVector(player.vel, thingWeCollidedWith.getNormalAt(ballState.pos));
  }


}
  
  // Self explanatory. For debug purposes.
PhysEng.prototype.printState = function (printExtraPlayerDebug, printExtraControlsDebug, printExtraPhysDebug) {
  console.log("Player: ");
  console.log("  pos: %.2f, %.2f", player.pos.x, player.pos.y);
  console.log("  vel: %.2f, %.2f", player.vel.x, player.vel.y);
  if (printExtraPlayerDebug) {
    console.log("  airBorne:       %s", player.airBorne);
    console.log("  groundLocked:   %s", player.groundLocked);
    console.log("  airChargeCount: %d", player.airChargeCount);
  }
  console.log("");

  if (printExtraControlsDebug) {
    console.log("Controls: ");
    console.log("  gLRaccel: %.2f", ctrl.gLRaccel);
    console.log("  aLRaccel: %.2f", ctrl.aLRaccel);
    console.log("  aUaccel: %.2f", ctrl.aUaccel);
    console.log("  aDaccel: %.2f", ctrl.aDaccel);
    console.log("  gBoostLRvel: %.2f", ctrl.gBoostLRvel);
    console.log("  aBoostLRvel: %.2f", ctrl.aBoostLRvel);
    console.log("  boostDownVel: %.2f", ctrl.boostDownVel);
    console.log("  jumpVel: %.2f", ctrl.jumpVel);
    console.log("  doubleJumpVel: %.2f", ctrl.doubleJumpVel);
    console.log("  numAirCharges: %.2f", ctrl.numAirCharges);
    console.log("  dragBase: %.2f", ctrl.dragBase);
    console.log("  dragTerminalVel: %.2f", ctrl.dragTerminalVel);
    console.log("  dragExponent: %.2f", ctrl.dragExponent);
    console.log("");
  }


  if (printExtraPhysDebug) {

    console.log("PhysParams: ");
    console.log("  gravity: %.2f", phys.gravity);
    console.log("");
  }
  console.log("");

}

// Self explanatory. For debug purposes.
PhysEng.prototype.printStartState = function () {
  console.log("Created PhysEng");
  console.log("Controls: ");
  console.log("  gLRaccel: %.2f", ctrl.gLRaccel);
  console.log("  aLRaccel: %.2f", ctrl.aLRaccel);
  console.log("  aUaccel: %.2f", ctrl.aUaccel);
  console.log("  aDaccel: %.2f", ctrl.aDaccel);
  console.log("  gBoostLRvel: %.2f", ctrl.gBoostLRvel);
  console.log("  aBoostLRvel: %.2f", ctrl.aBoostLRvel);
  console.log("  boostDownVel: %.2f", ctrl.boostDownVel);
  console.log("  jumpVel: %.2f", ctrl.jumpVel);
  console.log("  doubleJumpVel: %.2f", ctrl.doubleJumpVel);
  console.log("  numAirCharges: %.2f", ctrl.numAirCharges);
  console.log("  dragBase: %.2f", ctrl.dragBase);
  console.log("  dragTerminalVel: %.2f", ctrl.dragTerminalVel);
  console.log("  dragExponent: %.2f", ctrl.dragExponent);
  console.log("");

  console.log("PhysParams: ");
  console.log("  gravity: %.2f", phys.gravity);
  console.log("");

  console.log("Player: ");
  console.log("  radius: %.2f", player.radius);
  console.log("  starting pos: %.2f, %.2f", player.pos.x, player, pos.y);
  console.log("  starting vel: %.2f, %.2f", player.vel.x, player, vel.y);
  console.log("  airBorne: %s", player.airBorne);
  console.log("  groundLocked: %s", player.groundLocked);
  console.log("");
  console.log("");
}







//GET REFLECTION VECTOR. Really hope this is self explanitory.
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




// Event class for the render event. One of these should be the last event in the eventList array passed to update. NOT STORED IN REPLAYS.
function RenderEvent(eventTime) { // eventTime should be deltaTime since last frame, the time the physics engine should complete up to before rendering.
  Event.apply(this, [eventTime])
}

RenderEvent.prototype = new Event();
RenderEvent.prototype.constructor = RenderEvent;
RenderEvent.prototype.handler = function(physEng) {
  return;
}