/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 * Author Travis Drake
 */
var PHYS_DEBUG = true;

var HALF_PI = Math.PI / 2.0;

var COLLISION_PRECISION_ITERATIONS = 5;
var LOCK_MIN_ANGLE = 45.0 / 180 * Math.PI;  //ANGLE OF COLLISION BELOW WHICH NOT TO BOUNCE.

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





//DEFAULT PHYSICS VALS, TWEAK HERE
// WIDTH  = 1920 UNITS
// HEIGHT = 1080 UNITS
var DFLT_gravity = 450;        // FORCE EXERTED BY GRAVITY IS 400 ADDITIONAL UNITS OF VELOCITY DOWNWARD PER SECOND. 

var DFLT_JUMP_HOLD_TIME = 0.15; // To jump full height, jump must be held for this long. Anything less creates a fraction of the jump height based on the fraction of the full time the button was held. 

// CONST ACCEL INPUTS
var DFLT_gLRaccel = 300;
var DFLT_aLRaccel = 200;
var DFLT_aUaccel = 50;
var DFLT_aDaccel = 100;
var DFLT_gUaccel = 50;
var DFLT_gDaccel = 100;
var DFLT_gBoostLRvel = 700;
var DFLT_aBoostLRvel = 700;
var DFLT_aBoostDownVel = 500;

// CONST PULSE INPUTS
var DFLT_jumpVelNormPulse = 800;
var DFLT_doubleJumpVelYPulse = 600;
var DFLT_doubleJumpVelYMin = 600;

// OTHER CHAR DEFAULTS
var DFLT_numAirCharges = 1;

// CONST RATIOS
var DFLT_jumpSurfaceSpeedLossRatio = 0.7;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 





// PhysParams object contains all the physics values. These will not change between characters. 
// This exists because it will be used later on to implement other terrain types, whose static
// effect values will be passed in here.
function PhysParams(gravity) {
  this.gravity = gravity;
}




// This object contains all the values that are relative to the PLAYER. IE, anything that would be specific to different selectable characters.
function ControlParams(gLRaccel, aLRaccel, aUaccel, aDaccel, gUaccel, gDaccel, gBoostLRvel, aBoostLRvel, aBoostDownVel, jumpVelNormPulse, doubleJumpVelYPulse, doubleJumpVelYMin, numAirCharges, dragBaseAmt, dragTerminalVel, dragExponent, jumpSurfaceSpeedLossRatio) {
  this.gLRaccel = gLRaccel;                 //x acceleration exerted by holding Left or Right on the surface.
  this.aLRaccel = aLRaccel;                 //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = aUaccel;                   //y acceleration exerted by holding up in the air.
  this.aDaccel = aDaccel;                   //y acceleration exerted by holding down in the air.
  this.gUaccel = gUaccel;                   //y acceleration exerted by holding up on a surface.
  this.gDaccel = gDaccel;                   //y acceleration exerted by holding down on a surface.
  this.gBoostLRvel = gBoostLRvel;           //x velocity that a boost on the surface sets.
  this.aBoostLRvel = aBoostLRvel;           //x velocity that a boost in the air sets.
  this.boostDownVel = boostDownVel;         //-y velocity that a downboost sets in the air.
  this.jumpVelNormPulse = jumpVelNormPulse;             //velocity that a surface jump sets from the normal.
  this.doubleJumpVelYPulse = doubleJumpVelYPulse;       //y velocity that a double jump adds.
  this.doubleJumpVelYMin = doubleJumpVelYMin;           //min y velocity that a double jump must result in.
  this.jumpSurfaceSpeedLossRatio = jumpSurfaceSpeedLossRatio;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 

  this.numAirCharges = numAirCharges;       //number of boost / double jumps left in the air.

  this.dragBase = dragBaseAmt;              //base drag exerted
  this.dragTerminalVel = dragTerminalVel;   //the velocity at which drag and gravity will be equal with no other factors present.
  this.dragExponent = dragExponent;         //the exponent used to create the drag curve.

}



function PlayerModel(controlParams, ballRadius, startPoint, surfaceOrNull) {     // THIS IS THE PLAYER PHYSICS MODEL, EXTENDABLE FOR DIFFERENT CHARACTER TYPES.
  // Player properties.
  this.radius = ballRadius;          //float radius
  this.controlParameters = controlParams;
  this.state = new PlayerState(terrainSurface, numAirCharges);
  // Movement values.
  this.pos = startPoint;             //vec2 for position!
  this.vel = new vec2(0.0, 0.0);     //vec2 for velocity!

  this.timeDelta = 0.0;

  // PLAYER STATE
  this.surfaceOn = surfaceOrNull;   // what surface is the player on?
  this.onGround = true;     // is the player on the ground?
  this.gLocked = false;     // is the player locked to the ground?
  if (surfaceOrNull === null) {
    this.onGround = false;
  }
  this.gBoosting = false;   // is the player in the ground boost state?
  this.aBoosting = false;   // is the player in the air boost state?
  this.gJumping = false;    // is the player jumping from the ground?
  this.aJumping = false;    // is the player air jumping?

  this.airChargeCount = controlParams.numAirCharges; //number of boosts / double jumps left.
}



// The acceleration vector state. Stores the component vectors and resulting vector in order to efficiently return the current acceleration in the air or on the surface without uneccessary calculations.
function AccelState(physParams, controlParams, playerModel) {  // DO WE NEED A REFERENCE TO PhysEng?
  this.accelVec = new vec2(0.0, 0.0);
  //this.physEng = physEng;
  this.player = playerModel;
  this.controlParams = controlParams;
  this.physParams = physParams;


  /*
  this.gLRaccel = gLRaccel;                 //x acceleration exerted by holding Left or Right on the surface.
  this.aLRaccel = aLRaccel;                 //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = aUaccel;                   //y acceleration exerted by holding up in the air.
  this.aDaccel = aDaccel;                   //y acceleration exerted by holding down in the air.
  this.gUaccel = gUaccel;                   //y acceleration exerted by holding up on a surface.
  this.gDaccel = gDaccel;                   //y acceleration exerted by holding down on a surface.
  this.gBoostLRvel = gBoostLRvel;           //x velocity that a boost on the surface sets.
  this.aBoostLRvel = aBoostLRvel;           //x velocity that a boost in the air sets.
  this.boostDownVel = boostDownVel;         //-y velocity that a downboost sets in the air.
  */

  this.updateGround = function (inputState) {  // TODO
    var baseForceX = 0.0;
    var baseForceY = this.physParams.gravity;

    if (inputState.up) {
      baseForceY -= this.controlParams.gUaccel;
    } else if (inputState.down) {
      baseForceY += this.controlParams.gDaccel;
    }

    if (inputState.left) {
      baseForceX -= this.controlParams.gLRaccel;
    } else if (inputState.down) {
      baseForceX += this.controlParams.gLRaccel;
    }


    var baseForceVec = new vec2(baseForceX, baseForceY);
    if (inputState.additionalVec !== null) {                          // if theres an additional vector of force to consider
      baseForceVec = baseForceVec.add(inputState.additionalVec);
    }

    var surface = inputState.surfaceOn;
    var baseForceNormalized = baseForceVec.normalize();
    var angleToNormal = Math.acos(surface.getNormalAt(this.player.pos).dot(baseForceNormalized));
    if (angleToNormal > HALF_PI || angleToNormal < -HALF_PI) {          // If the baseForceVec is pushing us towards the surface we're on:
      // ___+____+____+___ magnitude acceleration along a sloped surface = magnitude of force * sin(angle between force and surface normal)
      var surfaceVec = surface.p1.subtract(surface.p0);
      var angleToSurface = Math.acos(surfaceVec.normalize().dot(baseForceNormalized));
      this.accelVec = baseForceVec.length()
    } else {                                                            // We're being pushed away from the surface. TODO HANDLE?

    }
    this.accelVec = surfacebaseForceVec;
  }
  

  this.updateAirStates = function (inputState) {  // TODO
    this.airAccel = new vec2(0.0, 0.0);
  }
}
AccelState.prototype.getAirAccel = function () { return this.airAccel }
AccelState.prototype.getSurfaceAccel = function () { return this.surfaceAccel }



// The input state object. May replace later on with however we handle input, but this is how I'm visualizing it for now.
function InputState() {
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.lock = false;
  this.surfaceOn = null; // The terrain object that the player is locked to. Must extend TerrainObject or be null.
  this.additionalVec = null;
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

  var state = new TempState(this.player.pos, this.player.vel, 0.0, 0.0);   //creates the initial state of the TempPlayer.
  eventList.push(new RenderEvent(timeDelta)); //Set up the last event in the array to be our render event, so that the loop completes up to the render time.

  var timeCompleted = 0.0;
  for (i = 0; i < eventList.length; i++) { //Handle all the events that have happened since last frame at their respective times.
    var event = eventList[i];
    var state = this.stepToEndOfEvent(state, event); // Guarantees time has completed up to the event and the event has been handled.
  }                                   // PHYSICS ARE UP TO DATE. GO AHEAD AND RENDER.

  this.player.timeDelta = 0.0;
  //Render();                       //________ CALL THE RENDER FUNCTION HERE! ________// TODO
}




// Steps to the end of the event and handles any intermediate events recursively.
PhysEng.prototype.stepToEndOfEvent = function (state, event) {
  //while (!eventDone) {                   //The physics step loop. Checks for collisions / lockbreaks and discovers the time they occur at. Continues stepping physics until it is caught up to "timeDelta".
  console.log("START stepToEndOfEvent");
  var newEvents = [];
  if (this.player.airBorne) {               //In the air, call airStep
    console.log("player airborne");
    state = this.airStep(state, event.time); // TODO STATE SHOULD HAVE EVENTS NOT TerrainSurfaces.
    for (var k = 0; k < state.eventList.length; k++) {
      newEvents.push(state.eventList[k]); 
    }

  } else {                             //On surface, call surfaceStep 
    console.log("player NOT airborne");
    state = this.surfaceStep(state, event.time);
    for (var k = 0; k < state.eventList.length; k++) {
      newEvents.push(state.eventList[k]);
    }
  }

  var newTerrainEvents = [];
  var newCollectibleEvents = [];
  var goal = false;
  var collectibles = false;
  if (newEvents.length > 0) { // WE DIDNT FINISH, A NEW EVENT HAPPENED. ALT state.timeDelta < event.time
    console.log("newEvents.length > 0");
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
      return;
    } else if (collectibles) {
      // TODO HANDLE COLLECTIBLES
    } else if (newTerrainEvents.length > 0) {
      console.log("newTerrainEvents.length > 0");
      this.handleTerrainAirCollision(tempState, newTerrainEvents); // TODO REFACTOR TO PASS COLLISION OBJECT WITH ADDITIONAL DATA. SEE handleTerrainAirCollision COMMENTS FOR MORE INFO.
    }
    var tempState = new TempState(this.player.pos, this.player.vel, this.player.radius, this.player.timeDelta);
    this.stepToEndOfEvent(tempState, event);
  } else {                           // WE DID FINISH

    event.handler(this);              // LET THE EVENTS HANDLER DO WHAT IT NEEDS TO TO UPDATE THE PHYSICS STATE, AND CONTINUE ON IN TIME TO THE NEXT EVENT.
  }

  //}                                 //COMPLETED TIMESTEP UP TO WHEN EVENT HAPPENED.


}


// Returns the players new position and velocity (in a TempState object) after an airStep of this length. Does not modify values.
PhysEng.prototype.airStep = function (state, timeGoal) {
  var startTime = state.timeDelta;
  console.log("timeGoal: %3.3, startTime: %3.3", timeGoal, startTime);
  var accelVec = this.accelState.getAirAccel();
  var lastVel = state.vel;
  var lastPos = state.pos;
  var multed = accelVec.multf(timeGoal - startTime);
  console.log("lastVel: ", lastVel);
  var curVel = lastVel.add(multed);
  var curPos = lastPos.add(lastVel.add(curVel).divf(2.0));

  var tempState = new TempState(curPos, curVel, this.player.radius, timeGoal);
  var collisionData = getCollisionData(tempState);
  var returnState;
  if (!collisionData.collided) {  //IF WE DIDNT COLLIDE, THIS SHOULD BE GOOD? TODO CHECK TO MAKE SURE WE DIDNT MOVE MORE THAN RADIUS IN THIS STEP.
    returnState = new TempState(curPos, curVel, this.player.Radius, timeGoal)
  } else {                        //HANDLE RECURSIVELY, TODO DONE?
    var minCollisionTime = startTime;
    var maxCollisionTime = timeGoal;
    
    var newDelta = minCollisionTime + (maxCollisionTime - minCollisionTime) / 2.0;
    var collisions = collisionData.collidedWith;
    curVel = lastVel.add(accelVec.multf(newDelta));
    curPos = lastPos.add(lastVel.add(curVel).divf(2.0));

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

      curVel = lastVel.add(accelVec.multf(newDelta));
      curPos = lastPos.add(lastVel.add(curVel).divf(2.0));

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



// A step while the player is in the surface. Returns the players new position and velocity and time and any events that happened (in a TempState object) after attempting surfaceStep of this length. Does not modify values.
PhysEng.prototype.surfaceStep = function (state, timeDelta) { 

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
  console.log("START handleTerrainAirCollision");
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