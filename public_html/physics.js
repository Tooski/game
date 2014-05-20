
/*
 * The physics engine. This is a complex system that uses no timers, but rather mathematically discretizes
 * all events across time into component events, predicts future events, and only acts upon events that are reached.
 * RenderEvents are passed into the physics engine to choose what time for the engine to determine the events up to.
 * 
 * May later be extended to support different player characters with different physics properties.
 *
 * Author Travis Drake
 * All rights reserved.
 */


//IF FALSE, RUN NORMALLY
var DEBUG_STEP =                                    false;

//IF FALSE ONLY STEPS TO RENDEREVENTS
var DEBUG_EVENT_AT_A_TIME =                         false && DEBUG_STEP; //only true if debug step is also true. Saves me the time of changing 2 variables to switch between normal state and debug state.

//DEBUG FRAME TIME
var DEBUG_MAX_TIMESTEP = 0.1;


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


// DO A THING WITH A DRAG LOOKUP TABLE TODO PLZ



//CONSTANTS
var HALF_PI = Math.PI / 2.0;   // AKA 90 DEGREES IN RADIANS

var TIME_EPSILON = 0.00000001;
var TIME_EPSILON_SQ = TIME_EPSILON * TIME_EPSILON;
var COLLISION_EPSILON_SQ = 0.0000; // fuck the police


//DEFAULT PHYSICS VALS, TWEAK HERE
// WIDTH  = 1920 UNITS
// HEIGHT = 1080 UNITS
var DFLT_gravity = 00;        // FORCE EXERTED BY GRAVITY IS 400 ADDITIONAL UNITS OF VELOCITY DOWNWARD PER SECOND. 
var DFLT_lockThreshold = 1000;
var DFLT_autoLockThreshold = 500;

//angle between surfaces at which the player continues onto the next surface whether locked or not.
var DFLT_surfaceSnapAngle = -(45               / 180) * Math.PI + Math.PI;

var DFLT_JUMP_HOLD_TIME = 0.15; // To jump full height, jump must be held for this long. Anything less creates a fraction of the jump height based on the fraction of the full time the button was held. TODO implement.

// CONST ACCEL INPUTS
var DFLT_gLRaccel = 800;
var DFLT_aLRaccel = 600;
var DFLT_aUaccel = 600;
var DFLT_aDaccel = 600;
var DFLT_gUaccel = 300;
var DFLT_gDaccel = 300;
var DFLT_gBoostLRvel = 1500;
var DFLT_aBoostLRvel = 1500;
var DFLT_aBoostDownVel = 1500;

// CONST PULSE INPUTS
var DFLT_jumpVelNormPulse = 600;
var DFLT_doubleJumpVelYPulse = 600;
var DFLT_doubleJumpVelYMin = 600;

// OTHER CHAR DEFAULTS
var DFLT_numAirCharges = 1;
var DFLT_radius = 1920 / 32;

// CONST RATIOS
var DFLT_jumpSurfaceSpeedLossRatio = 0.7;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 
var DFLT_bounceSpeedLossRatio = 0.9;
var DFLT_reverseAirJumpSpeed = 300;



/*
 * The fraction of player radius that our max movement distance will be.
*/
var MAX_MOVE_FRACTION_OF_RADIUS = 1.0;


var REPLAY_SYNC_INTERVAL = 1.0;


// this thing is just useful for storing potential states in an object.
function State(time, radius, pos, vel, accel) {

  this.time = time;
  this.radius = radius;
  this.pos = pos;
  this.vel = vel;
  this.accel = accel;
}




 
/**
 * Object representing the result of a step. 
 * contains the state, time, and collisions
 */
function StepResult (state, eventArray) {
  this.state = state;
  this.success = true;
  this.events;
  if (eventArray && eventArray.length > 0) {  // new events
    this.events = eventArray;
    this.success = false;
  }
}




/**
 * PhysParams object contains all the physics values. These will not change between characters. 
 * This exists because it will be used later on to implement other terrain types, whose static
 * effect values will be passed in here.
 */
function PhysParams(gravity, lockThreshold, autoLockThreshold, surfaceSnapAngle) {
  if (!((gravity || gravity === 0) && (lockThreshold || lockThreshold === 0) && (autoLockThreshold || autoLockThreshold === 0))) {
    console.log("");
    console.log("");
    console.log("gravity: ", gravity);
    console.log("lockThreshold: ", lockThreshold);
    console.log("autoLockThreshold: ", autoLockThreshold);
    throw "missing PhysParams";
  }
  this.gravity = gravity;                           // Force of gravity. Hopefully you knew that.
  this.lockThreshold = lockThreshold;               // Force of a collision after which locking is disallowed.
  this.autoLockThreshold = autoLockThreshold;       // Force of a collision after which autoLocking is disallowed.
  this.surfaceSnapAngle = surfaceSnapAngle;
}



/**This object contains all the values that are relative to the PLAYER. 
 * IE, anything that would be specific to different selectable characters.
 */
function ControlParams(gLRaccel, aLRaccel, aUaccel, aDaccel, gUaccel, gDaccel,
  gBoostLRvel, aBoostLRvel, aBoostDownVel, jumpVelNormPulse, doubleJumpVelYPulse,
  doubleJumpVelYMin, numAirCharges, dragBaseAmt, dragTerminalVel, dragExponent,
  jumpSurfaceSpeedLossRatio, reverseAirJumpSpeed, lockThreshold) {

  if (!(gLRaccel && aLRaccel && aUaccel && aDaccel && gUaccel && gDaccel &&   //DEBUG TODO REMOVE
  gBoostLRvel && aBoostLRvel && aBoostDownVel && jumpVelNormPulse && doubleJumpVelYPulse &&
  doubleJumpVelYMin && numAirCharges &&
    //dragBaseAmt && dragTerminalVel && dragExponent &&
  jumpSurfaceSpeedLossRatio && reverseAirJumpSpeed)) {
    console.log("");
    console.log("");
    console.log("gLRaccel: ", gLRaccel);
    console.log("aLRaccel: ", aLRaccel);
    console.log("aUaccel: ", aUaccel);
    console.log("aDaccel: ", aDaccel);
    console.log("gUaccel: ", gUaccel);
    console.log("gDaccel: ", gDaccel);
    console.log("gBoostLRvel: ", gBoostLRvel);
    console.log("aBoostLRvel: ", aBoostLRvel);
    console.log("aBoostDownVel: ", aBoostDownVel);
    console.log("jumpVelNormPulse: ", jumpVelNormPulse);
    console.log("doubleJumpVelYPulse: ", doubleJumpVelYPulse);
    console.log("doubleJumpVelYMin: ", doubleJumpVelYMin);
    console.log("numAirCharges: ", numAirCharges);
    console.log("dragBaseAmt: ", dragBaseAmt);
    console.log("dragTerminalVel: ", dragTerminalVel);
    console.log("dragExponent ", dragExponent);
    console.log("jumpSurfaceSpeedLossRatio: ", jumpSurfaceSpeedLossRatio);
    console.log("reverseAirJumpSpeed: ", reverseAirJumpSpeed);
    throw "missing ControlParams";
  }

  this.gLRaccel = gLRaccel;                 //x acceleration exerted by holding Left or Right on the surface.
  this.aLRaccel = aLRaccel;                 //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = aUaccel;                   //y acceleration exerted by holding up in the air.
  this.aDaccel = aDaccel;                   //y acceleration exerted by holding down in the air.
  this.gUaccel = gUaccel;                   //y acceleration exerted by holding up on a surface.
  this.gDaccel = gDaccel;                   //y acceleration exerted by holding down on a surface.
  this.gBoostLRvel = gBoostLRvel;           //x velocity that a boost on the surface sets.
  this.aBoostLRvel = aBoostLRvel;           //x velocity that a boost in the air sets.
  this.aBoostDownVel = aBoostDownVel;         //-y velocity that a downboost sets in the air.
  this.jumpVelNormPulse = jumpVelNormPulse;             //velocity that a surface jump sets from the normal.
  this.doubleJumpVelYPulse = doubleJumpVelYPulse;       //y velocity that a double jump adds.
  this.doubleJumpVelYMin = doubleJumpVelYMin;           //min y velocity that a double jump must result in.
  this.jumpSurfaceSpeedLossRatio = jumpSurfaceSpeedLossRatio;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 
  this.reverseAirJumpSpeed = reverseAirJumpSpeed;

  this.numAirCharges = numAirCharges;       //number of boost / double jumps left in the air.

  this.dragBase = dragBaseAmt;              //base drag exerted
  this.dragTerminalVel = dragTerminalVel;   //the velocity at which drag and gravity will be equal with no other factors present.
  this.dragExponent = dragExponent;         //the exponent used to create the drag curve.

}



/**
 * The input state object. May replace later on with however we handle input, but this is how I'm visualizing it for now.
 */
function InputState() {
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.lock = false;
  this.pauseIgnoreRelease = false;
  this.additionalVecs = null;
}



/**
 * The CompletionState object. Contains information about how the level was completed.
 */
function CompletionState(player, time, state, goalNumber, replay) {
  this.player = player;
  this.time = time;
  this.state = state;
  this.goalNumber = goalNumber;
  this.replay = replay;
}


/**
 * TimeManager object for physics.
 */
function TimeManager(time, referenceBrowserTime, referenceGameTime, timeRate) {
  this.time = time;
  this.referenceBrowserTime = referenceBrowserTime;
  this.referenceGameTime = referenceGameTime;
  this.timeRate = timeRate;

  this.convertBrowserTime = function (browserTime) {
    var deltaBrowser = browserTime - this.referenceBrowserTime;
    var deltaConverted;
    if (timeRate !== 1) {
      deltaConverted = deltaBrowser * timeRate;
    } else {
      deltaConverted = deltaBrowser;
    }
    return this.referenceGameTime + deltaConverted;
  }
}



function PlayerModel(controlParams, physParams, time, radius, pos, vel, accel, surfaceOrNull) {
  State.apply(this, [time, radius, pos, vel, accel]);

  this.pos = new vec2(0, 0);
  this.vel = new vec2(0, 0);
  this.accel = new vec2(0, 0);

  this.replayData = [];


  this.doNotCheckStepSurfaces = [];

  this.predictedDirty = true;
  /**
   * ANIMATION FIELDS FOR MIKE!
   */
  this.animationFacing = "left";          // "left" or "right" or "neutral"
  this.animationWalking = false;         // is the player in the walking state?
  this.animationRunning = false;         // is the player in the running state?
  this.animationBoosting = false;         // is the player in the boost state?
  this.animationDownBoosting = false;         // is the player in the Down boost state?
  this.animationGroundJumping = false;    // is the player jumping from the ground?
  this.animationDoubleJumping = false;    // is the player air jumping?
  this.animationColliding = false;        // is the player in the collision animation?
  this.animationFreefall = false;         // is the player in the Freefall animation?
	
  this.animationTimeInCurrentAnimation = 0.0;   // what amount of time in seconds have we been in this animation state?
  this.animationStartTime = 0.0;
  this.animationAngleOfAnimation = 0.0;         // DO WE WANT THIS IN DEGREES OR RADIANS?
  this.animationSpeed = 0.0;                    // The player speed. Used for walking / running animations.
  
  //END ANIMATION FIELDS


  this.controlParams = controlParams;
  this.physParams = physParams;
  this.inputState = new InputState();
  this.completionState = null;
	
  // PLAYER STATE
  this.surface = surfaceOrNull;   // what surface is the player on?
  this.locked = false;     // is the player locked to the ground?


  this.roundingPoint = false;
  this.pointBeingRounded = null;
  this.angleAroundPoint = 0.0;   //RADIANS OR DEGREES I HAVE NO IDEA
  this.rotationDirection = false; // TRUE IF CLOCKWISE, FALSE IF COUNTER-CLOCKWISE.
	
  //console.log("controlParams.numAirCharges, ", controlParams.numAirCharges);
  this.airChargeCount = controlParams.numAirCharges; //number of boosts / double jumps left.
	
	



  /**
   * updates the playerModel to the provided state.
   */
  this.updateToState = function (state) {
    if (!(
      (state.time  || state.time === 0) &&
      (state.radius || state.radius === 0)  &&
      (state.pos) &&
     (state.vel) &&
      (state.accel))) {
      console.log("Missing fields in state.");
      console.log("time: ", state.time);
      console.log("radius: ", state.radius);
      console.log("pos: ", state.pos);
      console.log("vel: ", state.vel);
      console.log("accel: ", state.accel);
      throw "Missing fields in state.";
    }
    this.time = state.time;
    this.radius = state.radius;
    this.pos = state.pos;
    this.vel = state.vel;
    this.accel = state.accel;
  }
	

  this.leaveGround = function () { // TODO write code to handle leaving the ground here.
    this.surface = null;
    this.locked = false;
    this.roundingPoint = false;
    this.pointBeingRounded = null;
    this.predictedDirty = true;
    this.airChargeCount = this.controlParams.numAirCharges;
    this.updateVecs(this.inputState);
    animationSetPlayerFreefall(this, this.time);
  }



  // Figures out which vector update call to use and then updates vectors.
  this.updateVecs = function (inputState) {
    //console.log(" in AccelState update function. inputState ", inputState);
    if (!this.surface) {
      //console.log("    Calling updateAir, player.surfaceOn === null.");
      this.updateVecsAir(inputState);
    } else {
      //console.log("    Calling updateGround, player.surfaceOn !== null.");
      this.updateVecsGround(inputState);
    }
  }


  // UPDATES THE ACCEL VECTOR AND LOWER TIER VECS BASED ON THE CURRENT INPUT STATE AND ITS EFFECTS ON THE GROUND.
  this.updateVecsGround = function (inputState) {  // DONE? TEST
    //console.log("  in AccelState.updateGround(), setting accelVec. ");
    var baseForceX = 0.0;
    var baseForceY = this.physParams.gravity;

    if (inputState.up) {
      //console.log("   inputState.up true");
      baseForceY -= this.controlParams.aUaccel;
    } else if (inputState.down) {
      //console.log("   inputState.down true");
      baseForceY += this.controlParams.aDaccel;
    }

    if (inputState.left) {
      //console.log("   inputState.left true");
      baseForceX -= this.controlParams.aLRaccel;
    } else if (inputState.right) {
      //console.log("   inputState.right true");
      baseForceX += this.controlParams.aLRaccel;
    }


    var baseForceVec = new vec2(baseForceX, baseForceY);
    if (inputState.additionalVecs) {                          // if theres an additional vector of force to consider
      for (var i = 0; i < additionalVecs.length; i++) {
        baseForceVec = baseForceVec.add(inputState.additionalVecs[i]);
      }
    }



    var surface = this.surface;
    var baseForceNormalized = baseForceVec.normalize();
    //console.log("");
    //console.log("");
    //console.log("in updateVecsGround(),  surface: ", surface);
    //console.log("surface.getNormalAt(this.pos, this.radius), ", surface.getNormalAt(this.pos, this.radius));
    //console.log("baseForceVec.lengthsq(), ", baseForceVec.lengthsq());
    var angleToNormal = Math.acos(surface.getNormalAt(this.pos, this.radius).dot(baseForceNormalized));

    //if (angleToNormal > HALF_PI) {
    //  console.log("GREATER angleToNormal, ", angleToNormal)
    //} else if (angleToNormal < -HALF_PI) {
    //  console.log("LESSER  angleToNormal, ", angleToNormal)

    //} else {
    //  console.log("BETWEEN angleToNormal, ", angleToNormal)

    //}


    if (baseForceVec.lengthsq() === 0) {
      //console.log("   we are not being pushed, just chill");
      this.accel = new vec2(0, 0);
      this.predictedDirty = true;
    } else if (inputState.lock) {                                                // If we are locked to the surface we are on.
      //console.log("   we are being locked to the surface we are on.");
      var surfaceDir = this.vel;
      this.accel = projectVec2(baseForceVec, surfaceDir);
      this.predictedDirty = true;
      
    } else if (angleToNormal >= HALF_PI || angleToNormal <= -HALF_PI) {          // If the baseForceVec is pushing us towards the surface we're on:
      //console.log("   we are being pushed TOWARDS the surface we are on.");
      // WE ASSUME PLAYER'S VELOCITY VECTOR IS ALREADY ALIGNED WITH THE SURFACE.
      // ___+____+____+___ magnitude acceleration along a sloped surface = magnitude of force * sin(angle between force and surface normal)
      var surfaceDir = surface.getSurfaceAt(this.pos, this.radius);
      //console.log("surfaceDir: ", surfaceDir);
      this.accel = projectVec2(baseForceVec, surfaceDir);
      this.predictedDirty = true;
      //console.log("this.accel: ", this.accel);
      //var angleToSurface = Math.acos(surfaceVec.normalize().dot(baseForceNormalized));
    } else  {  // we are being pushed away from the surface we are on. Updating states to have left the ground, and then calling updateAirStates.
      //console.log("   we are being pushed AWAY from the surface we are on. Simply calling updateAirStates.");
      this.doNotCheckStepSurfaces.push(this.surface);
      this.leaveGround();
      this.updateVecsAir(inputState);
      this.predictedDirty = true;
    }
  }
  

  // updates the accel vector based in the provided inputs based on the character being in the air state.
  this.updateVecsAir = function (inputState) {  // DONE? TEST
    console.log("in updateVecsAir, setting accelVec. ");
    var baseForceX = 0.0;
    var baseForceY = this.physParams.gravity;

    if (inputState.up) {
      //console.log("   inputState.up true");
      baseForceY -= this.controlParams.aUaccel;
    }
    if (inputState.down) {
      //console.log("   inputState.down true");
      baseForceY += this.controlParams.aDaccel;
    }

    if (inputState.left) {
      //console.log("   inputState.left true");
      baseForceX -= this.controlParams.aLRaccel;
    }
    if (inputState.right) {
      //console.log("   inputState.right true");
      baseForceX += this.controlParams.aLRaccel;
    }


    var baseForceVec = new vec2(baseForceX, baseForceY);
    if (inputState.additionalVecs) {                          // if theres an additional vector of force to consider
      for (var i = 0; i < additionalVecs.length; i++) {
        baseForceVec = baseForceVec.add(inputState.additionalVecs[i]);
      }
    }
    this.accel = baseForceVec;
    //console.log(this.accel);
    //this.predictedDirty = true;
  }

}
PlayerModel.prototype = new State();
//PlayerModel.prototype.constructor = PlayerModel;
PlayerModel.prototype.doubleJump = function () {
  var input = this.inputState;
  var velx;
  var vely;
  this.airChargeCount--;

  animationSetPlayerDoubleJumping(this, this.time);
  //add end animation event for double jump. TODO

  vely = this.vel.y - this.controlParams.doubleJumpVelYPulse;

  if (vely > -this.controlParams.doubleJumpVelYMin) {
    //Min double jump value
    vely = -this.controlParams.doubleJumpVelYMin;
  }
  //this.jumpVelNormPulse = jumpVelNormPulse;             //velocity that a surface jump sets from the normal.
  //this.doubleJumpVelYPulse = doubleJumpVelYPulse;       //y velocity that a double jump adds.
  //this.doubleJumpVelYMin = doubleJumpVelYMin;           //min y velocity that a double jump must result in.

  if (this.vel.x < 0 && input.right) { //moving left, holding right\
    velx = this.controlParams.reverseAirJumpSpeed;
  } else if (this.vel.x > 0 && input.left) { //moving right, holding left
    velx = -this.controlParams.reverseAirJumpSpeed;
  } else {                          // continue moving as normal.
    velx = this.vel.x;
  }

  this.vel = new vec2(velx, vely);
  //this.predictedDirty = true;
}



/**
 * function that handles jumping the player model.
 */
PlayerModel.prototype.jump = function () {
  if (!this.surface) {    //DEBUG TODO REMOVE
    throw "no surface and jump was called.";
  }

  var input = this.inputState;
  var velx;
  var vely;
  this.airchargeCount--;
  //console.log("this.surface", this.surface);
  animationSetPlayerJumping(this, this.time, this.surface.getSurfaceAt(this.pos));
  //add end animation event for double jump. TODO

  var jumpVec = this.surface.getNormalAt(this.pos, this.radius);
  jumpVec = jumpVec.multf(this.controlParams.jumpVelNormPulse);
  this.vel = this.vel.add(jumpVec);
  this.predictedDirty = true;
  this.leaveGround();
}



/**
 * Function that locks the playerModel to a surface. TerrainSurface or TerrainPoint.
 */
PlayerModel.prototype.lockTo = function (surface, surfaceVecNorm) {
  //var velocityMag = ballState.vel.length();                 // COMMENTED OUT FOR REALISTIC PHYSICS
  //var surfaceVecNorm = stuffWeCollidedWith[0].getSurfaceAt(ballState.pos); // REFACTOR TO USE NEW COLLISION OBJECT
  //var surfaceAngle = surfaceVecNorm.dot(normalBallVel);
  //var surfaceInvertAngle = (surfaceVec.negate()).dot(normalBallVel);

  //if (surfaceAngle > surfaceInvertAngle) {
  //  surfaceVec = surfaceVec.negate();
  //}
  //this.player.vel = surfaceVec.multf(velocityMag);          // END COMMENTED OUT FOR REALISTIC PHYSICS
  this.vel = projectVec2(this.vel, surfaceVecNorm);    //GROUNDBOOST TODO                     TODO HANDLE IF THIS IS A POINT.
  this.surfaceLock(surface);
}



/**
 * Function that snaps the playerModel's velocity to a surface. TerrainSurface or TerrainPoint.
 * TODO REFACTOR TO PROJECT BASED ON AN ANGLE A FRACTION BETWEEN COLLISION AND NORMAL VEC, TO ACHIEVE SOMETHING LIKE A GROUNDBOOST?
 */
PlayerModel.prototype.snapTo = function (surface, surfaceVecNorm) {
  this.vel = projectVec2(this.vel, surfaceVecNorm).normalize().multf(this.vel.length());
  this.surfaceLock(surface);
}




/**
 * Helper method to cut down on code repetition in lockTo and snapTo.
 */
PlayerModel.prototype.surfaceLock = function (surface) {
  this.airChargeCount = this.controlParams.numAirCharges;
  this.surface = surface;
  this.airBorne = false;
  this.locked = this.inputState.lock;
  this.updateVecs(this.inputState);
}
		



// Physics Engine constructor.
function PhysEng(gameEngine, playerModel) {
  if (!playerModel) {
    throw "need to pass a playerModel into PhysEng constructor.";
  }
  if (!gameEngine) {
    throw "need to pass a gameEngine into PhysEng constructor.";
  }
  this.gameEngine = gameEngine;
  this.tm = null;
  // Self explanitory
  this.MAX_MOVE_DIST = playerModel.radius * MAX_MOVE_FRACTION_OF_RADIUS;

  // The above but squared. Useful
  this.MAX_MOVE_DIST_SQ = this.MAX_MOVE_DIST * this.MAX_MOVE_DIST;


  this.debugInputs = [];

  //The previous real timestamp given to update.
  this.prevBrowserTime = 0.0;

  //The current real timestamp given to update.
  this.curBrowserTime = 0.0;

  //The gameTime of the last sync event.
  this.lastSyncEventTime = 0.0;


  this.inReplay = false;
  this.isPaused = true;
  this.ReplayData = [];


  // the players character model
  this.player = playerModel;
  console.log(this.player);
  this.player.updateVecs(this.player.inputState);

  // The level terrainManager.
  this.tm = currentLevel;
  //this.player.pos = this.tm.playerStartPos;    //sets player position to the level starting position.

  this.timeMgr = new TimeManager(0.0, 0.0, 0.0, 1); // TODO DO THE THING

  //The events that will need to be handled.
  this.primaryEventHeap = getNewPrimaryHeap();


  //The predicted events. This is cleared and re-predicted every time the inputs to PhysEng are modified.
  this.predictedEventHeap = getNewPredictedHeap();


  //The tween events. This is should always be empty at the end of a step.
  this.tweenEventHeap = getNewTweenHeap();


  this.debugEventHeap = getNewDebugHeap();


  ////The state events, such as time a dash will end. Modified at certain times.
  //this.stateEventHeap = new MinHeap(null, function (e1, e2) {
  //  return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  //});
	
	
}



/**
 * Update function for physEng. If you want it to use browser time you need to add a renderEvent at the browser timestamp to newEvents before passing it into update.
 */
PhysEng.prototype.update = function (time, newEvents) {
  if (!DEBUG_STEP) {                                      //UPDATE RUNNING NORMALL
    this.tm = currentLevel;
    //console.log("time???, ", time);
    newEvents.push(new RenderEvent(time));
    this.updatePhys(newEvents, !DEBUG_EVENT_AT_A_TIME);


  } else {                                                // USING DEBUG STEPPING, 
    for (var i = 0; i < newEvents.length; i++) {
      newEvents[i].time = this.getTime();
      newEvents[i].validTime = true;
      this.debugInputs.push(newEvents[i]);
    }
  }
}



/**
 * runs a debug step instead of a full step.
 */
PhysEng.prototype.stepDebug = function () {
  if (DEBUG_STEP) {
    this.tm = currentLevel;
    if (DEBUG_EVENT_AT_A_TIME) {
      // adds a new renderEvent to the predicted event heap. will be overwritten if a different event happens.
      this.debugEventHeap.push(new RenderEvent(0.0, DEBUG_MAX_TIMESTEP + (this.getTime())));
      //console.log("(this.getTime()) + DEBUG_MAX_TIMESTEP = ", DEBUG_MAX_TIMESTEP + (this.getTime()));
      this.updatePhys(this.debugInputs, !DEBUG_EVENT_AT_A_TIME);
      this.debugEventHeap = getNewDebugHeap();
      this.debugInputs = [];
    } else {
      this.debugInputs.push(new RenderEvent(0.0, DEBUG_MAX_TIMESTEP + (this.getTime())));
      this.updatePhys(this.debugInputs, !DEBUG_EVENT_AT_A_TIME);
      this.debugInputs = [];
    }
  }
}



/**
 * Update function for physEng. If you want it to use browser time you need to add a renderEvent at the browser timestamp to newEvents before passing it into update.
 */
PhysEng.prototype.updatePhys = function (newEvents, stepToRender) {
  if (this.primaryEventHeap.size() > 0 && !this.inReplay) {
    console.log(this.primaryEventHeap.size(), this.primaryEventHeap);
    throw "why the hell are we starting update with events still in primaryEventHeap thing?";
  }
  if (this.tweenEventHeap.size() > 0 && !this.inReplay) {
    console.log("this.tweenEventHeap, ", this.tweenEventHeap);
    throw "why the hell are we starting update with events still in tweenEventHeap thing?";
  }
  if (!newEvents) {
    throw "you need to pass an array of newEvents into physEng.update(targetBrowserTime, newEvents). It can be empty, but it must exist.";
  }
  

  //var gameTime = this.timeMgr.convertBrowserTime(targetBrowserTime);

  this.addNewEventsToEventHeap(newEvents);


  do {    // The stepping loop.
    //seems as good a place as any to check if predictedEvents are dirty.
    if (this.player.predictedDirty) {
      this.player.predictedDirty = false;
      this.updatePredicted();
    }

    var eventsArray = this.getEventHeapArray();
    var targetTime = this.getMinTimeInEventList(eventsArray);

    var currentEvent = this.peekMostRecentEvent();
    //console.log("before pop: ", this.primaryEventHeap.size());
    //console.log("after pop: ", this.primaryEventHeap.size());
    //console.log("stepResult: ", stepResult);
    //console.log("currentEvent: ", currentEvent);
    //console.log("");
    //console.log("");
    //console.log("");
    //console.log("start of an update.        start of an update.        start of an update.        start of an update.        start of an update.      ");
    //console.log("  starting pos: ", this.player.pos);
    //console.log("  starting vel: ", this.player.vel);
    //console.log("  starting accel: ", this.player.accel);
    //console.log("  attempting to step to Event: ", currentEvent);
    //console.log("  targetTime: ", targetTime);
    //console.log("starting do: while step loop, targetTime = ", targetTime);
    //console.log("all EventHeaps", eventsArray);
    var stepResult = this.attemptNextStep(targetTime); //stepResult .state .success .events


    //if stepResult has new events
    for (var i = 0; stepResult.events && i < stepResult.events.length; i++) {
      //add new events events to eventHeap
      if (i > 1) {                                        //DEBUG CASE TESTING TODO REMOVE
        console.log("added more than one new event??? event #", i);
      }
      this.tweenEventHeap.push(stepResult.events[i]);
    }

    currentEvent = this.peekMostRecentEvent();
    //console.log("before pop: ", this.primaryEventHeap.size());
    //console.log("after pop: ", this.primaryEventHeap.size());
    //console.log("stepResult: ", stepResult);
    //console.log("currentEvent: ", currentEvent);

    //console.log("  after attempt.");
    //console.log("  most recent event: ", currentEvent);
    //console.log("  stepResult: ", stepResult);



    var timeDifference = (currentEvent.time - stepResult.state.time);
    if (timeDifference * timeDifference > TIME_EPSILON_SQ) {     //DEBUG CASE TESTING TODO REMOVE??
                                        //IF NOT THROWN, EVENT IS IGNORED.
      console.log("=-=-=-=-=-=");
      console.log(" -=-=-=-=-");
      console.log("  currentEvent: ", currentEvent);
      console.log("  stepResult: ", stepResult);
      console.log("  timeDifference * timeDifference, ", timeDifference * timeDifference);
      console.log("  TIME_EPSILON_SQ, ", TIME_EPSILON_SQ);
      console.log("  times dont match between the event and the stepResult.state");

      //throw "times dont match between the event and the stepResult.state";


      this.tweenEventHeap = getNewTweenHeap();
      var tempState = stepStateToTime(this.player, targetTime);
      //update player state to resulting state.
      currentEvent = this.popMostRecentEvent();
      this.player.updateToState(tempState);
      this.timeMgr.time = tempState.time;
      
    } else {
      this.popMostRecentEvent()
      //update player state to resulting state.
      this.player.updateToState(stepResult.state);
      this.timeMgr.time = stepResult.state.time;
    }



    if (!(currentEvent.mask & E_RENDER_MASK)) {
      console.log("    handling non-render event. Event: ", currentEvent);

    }
    //console.log(currentEvent);
    currentEvent.handler(this);
    if (this.player.predictedDirty) {
      this.updatePredicted();
    }

    //console.log("ending iteration of do: while step loop, currentEvent = ", currentEvent);
    this.trySync();
  } while (stepToRender && (!(currentEvent.mask & E_RENDER_MASK)));
  //console.log(currentEvent);
  //console.log("(!(currentEvent.mask & E_RENDER_MASK))", (!(currentEvent.mask & E_RENDER_MASK)));
  if (currentEvent.time != this.timeMgr.time) {
    console.log("  Current events time: ", currentEvent.time);
    console.log("  this.timeMgr.time: ", this.timeMgr.time);
    throw "see above";
  }
  //console.log("after while: ", this.primaryEventHeap);
  //console.log("finished do while loop in update, currentEvent = ", currentEvent);
  //console.log(this.player.pos);
  //console.log("");
  //console.log(stepResult.state.pos);
  return this.player.completionState;
}





/**
 * attempts to step playerModel to the provided time.
 */
PhysEng.prototype.attemptNextStep = function (goalGameTime) {
  //console.log("");
  //console.log("");
  //console.log("new attemptNextStep, goalGameTime: ", goalGameTime);
  var stepCount = 1;
  var startGameTime = this.player.time;
  var deltaTime = goalGameTime - startGameTime;

  //console.log("  start of an attemptNextStep. ");
  //console.log("    attempting to step to goalGameTime: ", goalGameTime);
  //console.log("    playerState: ", this.player);
  var debugState = new State(this.player.time, this.player.radius, this.player.pos, this.player.vel, this.player.accel);

  var velStep = new vec2(this.player.vel.x, this.player.vel.y);
  velStep = velStep.multf(deltaTime);

  while (velStep.lengthsq() > this.MAX_MOVE_DIST_SQ)   // Figure out how many steps to divide this step into.
  {
    velStep = velStep.divf(2);
    stepCount *= 2;
  }



  var stepFraction = 0.0;
  var collisionList = [];
  var tweenTime = null;
  var tempState = null;

  //console.log("   CollisionList.length: ", collisionList.length, " stepCount: ", stepCount);
  for (var i = 1; i < stepCount && collisionList.length === 0; i++) {     // DO check steps.
    var doNotCheck = this.getNewDoNotCheck();
    stepFraction = i / stepCount;
    tweenTime = startGameTime + stepFraction * deltaTime;

    tempState = stepStateToTime(this.player, tweenTime);
    collisionList = getCollisionsInList(tempState, this.tm.terrainList, doNotCheck);    //TODO MINIMIZE THIS LIST SIZE, THIS IS IDIOTIC

    //console.log("      tweenStepping, i: ", i, " tweenTime: ", tweenTime);
  }

  var events = [];
  if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF AND EXITED THE LOOP EARLY, handle.
    events = this.findEventsAndTimesFromCollisions(collisionList);         // a bunch of TerrainCollisionEvent's hopefully?
    tempState = events[0].state;
    this.resetPredicted();
    //console.log("    ended tweenStepping loop early");
    //console.log("    collisions: ", collisionList);
    //console.log("    tempState: ", tempState);
    DEBUG_DRAW_BLUE.push(new DebugCircle(debugState.pos, debugState.radius, 5));

    //TODO HANDLE PREDICTING EVENTS HERE.
  } else {                // TRY FINAL STEP
    var doNotCheck = this.getNewDoNotCheck();
    //console.log("doNotCheck, ", doNotCheck);
    tweenTime = goalGameTime;
    //console.log("  finalStepping, i: ", stepCount, " tweenTime: ", tweenTime);
    tempState = stepStateToTime(this.player, tweenTime);
    collisionList = getCollisionsInList(tempState, this.tm.terrainList, doNotCheck);    //TODO MINIMIZE THIS LIST SIZE, THIS IS IDIOTIC
    //console.log(this.tm.terrainList);
    //console.log(this.tm);
    if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF ON FINAL STEP.
      events = this.findEventsAndTimesFromCollisions(collisionList);
      tempState = events[0].state;
      //console.log("    collided on last step.");
      //console.log("    collisions: ", collisionList);
      //console.log("    tempState: ", tempState);
      DEBUG_DRAW_BLUE.push(new DebugCircle(debugState.pos, debugState.radius, 5));
    }
  }


  var results = new StepResult(tempState, events);
  //TODO UPDATE PLAYER HERE???
  //console.log("  End attemptNextStep");
  return results;
}






function CollisionHeapObj(state, collisionObj) {
  if (!state || !collisionObj) {
    throw "missing state or collisionObj in CollisionHeapObj constructor";
  }
  this.time = state.time;
  this.collisionObj = collisionObj;
  this.state = state;
  this.id = collisionObj.id;
}



/**
 * checks to see if a syncEvent should be added to the current replay, and adds it if so.
 */
PhysEng.prototype.trySync = function () {
  if (!this.inReplay && this.time > this.lastSyncEventTime + REPLAY_SYNC_INTERVAL) {    // We need to add a syncEvent to the replay.
    this.replayData.push(new ReplaySyncEvent(this.time, this.player.state));
    this.lastSyncEventTime = this.getTime();
  }
}



/**
 * updates the predicted events.
 */
PhysEng.prototype.updatePredicted = function () {           //TODO FINISH
  this.resetPredicted();
  this.player.predictedDirty = false;
  if (this.player.surface) {
    var surfaceEndEvent = this.getSurfaceEndEvent();
    if (surfaceEndEvent) {
      console.log("adding surfaceEndEvent to predictedEvents. Event: ", surfaceEndEvent);
      this.predictedEventHeap.push(surfaceEndEvent);
    }
  }
  

  //this.roundingPoint = false;
  //this.pointBeingRounded = null;
  //this.angleAroundPoint = 0.0;   //RADIANS OR DEGREES I HAVE NO IDEA
  //this.rotationDirection = false; // TRUE IF CLOCKWISE, FALSE IF COUNTER-CLOCKWISE.
  if (this.player.roundingPoint) {

  }
}




/**
 * Resets the predictedEventHeap.
 */
PhysEng.prototype.resetPredicted = function () {
  this.predictedEventHeap = getNewPredictedHeap();
}



/**
 * Gets the SurfaceEndEvent for a particular surface, if it exists.
 */
PhysEng.prototype.getSurfaceEndEvent = function () {

  /* returns { adjNumber: 0 or 1, time, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
   * null if none in positive time or both not concave.*/
  var adjData = getNextSurfaceData(this.player, this.player.surface);
  //second, find the time that we will reach the end of the surface.
  //returns { pointNumber: 0 or 1, time }
  var endPointData = solveEarliestSurfaceEndpoint(this.player, this.player.surface);
  //console.log("    in getSurfaceEndEvent");
  //console.log("    adjData ", adjData);
  //console.log("    endPointData ", endPointData);


  var nextSurfaceEvent = null;  //SurfaceAdjacentEvent(predictedTime, dependencyMask, surface, nextSurface, angle, allowLock)

  if (adjData && (adjData.time || adjData.time === 0)) {
    if (endPointData && (endPointData.time || endPointData.time === 0)) {
      if (adjData.adjNumber === endPointData.pointNumber) {
        // use the adjacent surface for the event. It was concave, doesnt matter what time it supposedly comes at.
        if (adjData.time > endPointData.time) {
          //console.log("adjData.time, ", adjData.time, "endPointData.time, ", endPointData.time);
          var adjDataState = stepStateToTime(this.player, adjData.time);
          //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));

          console.log("gray thing");
          var endPointState = stepStateToTime(this.player, endPointData.time);
          DEBUG_DRAW_GRAY.push(new DebugCircle(endPointState.pos, this.player.radius, 5));
          
          throw "Debug, but this technically shouldnt happen where endpoint was hit before the adjacent line was.";
        }
        //handle me.
        nextSurfaceEvent = new SurfaceAdjacentEvent(adjData.time, 0, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
        var adjDataState = stepStateToTime(this.player, adjData.time);
        //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));
      } else {
        // endpoint and adjSurface are on opposite ends. Event whichever is soonest.
        if (adjData.time < endPointData.time) {
          // use adjacent.
          nextSurfaceEvent = new SurfaceAdjacentEvent(adjData.time, 0, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
          var adjDataState = stepStateToTime(this.player, adjData.time);
          //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));
        } else {
          // use endpoint.
          console.log("gray thing");
          var endPointState = stepStateToTime(this.player, endPointData.time);
          DEBUG_DRAW_GRAY.push(new DebugCircle(endPointState.pos, this.player.radius, 5));
        }
      }
    } else {
      // no endPointData, use adjacent.
      nextSurfaceEvent = new SurfaceAdjacentEvent(adjData.time, 0, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
      var adjDataState = stepStateToTime(this.player, adjData.time);
      //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));
    }
  } else if (endPointData && (endPointData.time || endPointData.time === 0)) {
    // no adjData, use endPointData.
    console.log("gray thing");
    var endPointState = stepStateToTime(this.player, endPointData.time);
    DEBUG_DRAW_GRAY.push(new DebugCircle(endPointState.pos, this.player.radius, 5));
  }
  if (nextSurfaceEvent) {
    //throw "lol";
  }

  return nextSurfaceEvent;
}



/**
 * adds the new events to the eventHeap
 */
PhysEng.prototype.addNewEventsToEventHeap = function (newEvents) {
  var renderEventCount = 0;
  for (var i = 0; i < newEvents.length; i++) {			//Put newEvents into eventHeap.
    if ((newEvents[i].mask & E_BROWSER_TIME_MASK) && !newEvents[i].validTime) {
      if ((newEvents[i].mask & E_RENDER_MASK)) {
        renderEventCount++;
        if (renderEventCount > 1) {
          throw "recieved 2 render events in 1 update, cannot continue.";
        }
        //console.log("convertEventBrowserTime for a renderEvent");
        this.convertEventBrowserTime(newEvents[i]);
      } else {
        this.convertEventBrowserTime(newEvents[i]);
        this.player.replayData.push(newEvents[i]);
      }
    } else if ((newEvents[i].mask & E_RENDER_MASK) && !newEvents[i].validTime) {
      renderEventCount++;
      if (renderEventCount > 1) {
        throw "recieved 2 render events in 1 update, cannot continue.";
      }
      //console.log("convertEventBrowserTime for a renderEvent");
      this.convertEventBrowserTime(newEvents[i]);
    } 

    this.primaryEventHeap.push(newEvents[i]);
  }
}




/**
 * pauses the physics engine.
 */
PhysEng.prototype.pause = function () {
  if (this.isPaused) {  // DEBUG TODO REMOVE
    throw "trying to pause when PhysEng is already paused";
  }
  this.timeMgr.referenceGameTime = this.timeMgr.time;
  this.isPaused = true;
  console.log("Pausing in PhysEng. TimeManager after: ", this.timeMgr);
}



/**
 * unpauses the physics engine.
 * need to pass in the browserTime.
 */
PhysEng.prototype.unpause = function (browserTime) {
  if (!this.isPaused) {            //DEBUG TODO REMOVE
    throw "trying to unpause when PhysEng is already unpaused";
  }
  this.timeMgr.referenceBrowserTime = browserTime;
  this.isPaused = false;

  console.log("Unpausing in PhysEng. TimeManager after: ", this.timeMgr);
}



/**
 * Any other code to start the physics enging should go here.
 */
PhysEng.prototype.start = function () {
  this.unpause(performance.now() / 1000);
  //this.printStartState();
}



/**
 * converts an event created with browser time to the proper gameTime.
 */
PhysEng.prototype.convertEventBrowserTime = function (event) {
  "use strict";
  if (this.isPaused) {
    event.time = this.timeMgr.referenceGameTime;
    event.valid = true;
  } else {
    event.time = this.timeMgr.convertBrowserTime(event.browserTime);
   
    event.valid = true;
  }
  if (!(event.time >= 0 && event.time <= 10000000000000000000000)) {
    console.log("bad event time conversion.");
    console.log("event.browserTime: ", event.browserTime);
    console.log("event.time: ", event.time);
    console.log("this.timeMgr: ", this.timeMgr);
    throw "bad event conversion time";
  }     // DEBUG TODO REMOVE
}



/**
 * constructs and returns the doNotCheck terrainList.
 */
PhysEng.prototype.getNewDoNotCheck = function () {
  var doNotCheck = this.player.doNotCheckStepSurfaces;    //
  //var doNotCheck = [];    //

  if (this.player.surface) {
    doNotCheck.push(this.player.surface);
    if (this.player.surface.adjacent0) {
      doNotCheck.push(this.player.surface.adjacent0);
    }
    if (this.player.surface.adjacent1) {
      doNotCheck.push(this.player.surface.adjacent1);
    }
  }

  this.player.doNotCheckStepSurfaces = [];

  return doNotCheck;
}



/**
 * Determines the time of the collisions and then return the earliest, those that tie for the earliest.
 */
PhysEng.prototype.findEventsAndTimesFromCollisions = function (collisionList) {

  var collisionHeap = new MinHeap(null, function (e1, e2) {     //WHAT THE FUCK IS THIS FOR? I DONT REMEMBER CODING THIS I WAS SICK AS HELL RIP IN PIECES
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });

  //console.log("    in findEventsAndTimesFromCollisions =1=1=1=1=1=1=1=1=");
  for (var i = 0; i < collisionList.length; i++) {
    var collision = collisionList[i]; // collisoin: { collision,   collidedLine,  collidedP0,  collidedP1,  surface,  perpendicularIntersect }
    //console.log("      in collisionList loop");
    //console.log("      collision ", i, ": ", collision);
    var testedLine = false;
    var testedP0 = false;
    var testedP1 = false;


    //LINE COLLISION
    if (collision.collidedLine) {
      testedLine = true;
      //function solveTimeToDistFromLine(curPos, curVel, accel, targetLine, distanceGoal) {
      var futureTime = solveTimeToDistFromLine(this.player.pos, this.player.vel, this.player.accel, collision.surface, this.player.radius);
      if (!futureTime && !futureTime === 0) {
        throw "bullshit, the solved time of something we supposedly collided with was null";
      }
      var lineTime = this.getTime() + futureTime;
      var tempState = stepStateToTime(this.player, lineTime);
      
      if (DEBUG_DRAW) {
        DEBUG_DRAW_ORANGE.push(new DebugCircle(tempState.pos, tempState.radius, 5));
      }


      if (collision.surface.isPointWithinPerpBounds(tempState.pos) && lineTime && lineTime > 0 && lineTime < 200) {   // Ensures that the real collision was with the line and not the points.
        var collisionHeapObj = new CollisionHeapObj(tempState, collision.surface);
        collisionHeap.push(collisionHeapObj);

      } else {                // We didnt really collide with the line. Try to add points instead.

        //console.log("We got a line collision but not with points, but time analysis says we didnt collide with line. Testing points?");
        var point0Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p0, this.player.radius);
        var point1Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p1, this.player.radius);

        if (point0Time && point0Time > 0 && point0Time < 200) {
          console.log("      collision ", i, " collided with p0 at time: ", point0Time);
          var tempState0 = stepStateToTime(this.player, point0Time);
          console.log("      at position ", tempState0);
          var collisionHeapObj = new CollisionHeapObj(tempState0, new TerrainPoint(collision.surface.p0, collision.surface, collision.surface.adjacent0));
          collisionHeap.push(collisionHeapObj);
          if (DEBUG_DRAW) {
            DEBUG_DRAW_ORANGE.push(new DebugCircle(tempState0.pos, tempState0.radius, 5));
          }
        }
        testedP0 = true;

        if (point1Time && point1Time > 0 && point1Time < 200) {
          console.log("      collision ", i, " collided with p1 at time: ", point1Time);
          var tempState1 = stepStateToTime(this.player, point1Time);
          console.log("      at position ", tempState1);
          var collisionHeapObj = new CollisionHeapObj(tempState1, new TerrainPoint(collision.surface.p1, collision.surface, collision.surface.adjacent1));
          collisionHeap.push(collisionHeapObj);
          if (DEBUG_DRAW) {
            DEBUG_DRAW_ORANGE.push(new DebugCircle(tempState1.pos, tempState1.radius, 5));
          }
        }
        testedP1 = true;

      }
    }


    //POINT COLLISION
    if (collision.collidedP0 && (!testedP0)) {
      var point0Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p0, this.player.radius);

      if (point0Time && point0Time > 0 && point0Time < 200) {
        console.log("      collision ", i, " collided with p0 at time: ", point0Time);
        var tempState0 = stepStateToTime(this.player, point0Time);
        console.log("      at position ", tempState0);
        //if (collision.surface.isPointWithinPerpBounds(tempState0.pos)) { // DEBUG TODO PLEASE DONT EVER LET THIS BE CALLED                   


               //TODO I COMMENTED THIS OUT ITS PROBABLY AN IMPORTANT CASE TO HANDLE BUT I DONT REMEMBER WHAT IT MEANS D:


        //  throw "fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown";
        //}
        var collisionHeapObj = new CollisionHeapObj(tempState0, new TerrainPoint(collision.surface.p0, collision.surface, collision.surface.adjacent0));
        collisionHeap.push(collisionHeapObj);
        if (DEBUG_DRAW) {
          DEBUG_DRAW_YELLOW.push(new DebugCircle(tempState0.pos, tempState0.radius, 5));
        }
      } else {

      }
    }
    if (collision.collidedP1 && (!testedP1)) {
      var point1Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p1, this.player.radius);

      if (point1Time && point1Time > 0 && point1Time < 200) {
        console.log("      collision ", i, " collided with p1 at time: ", point1Time);
        var tempState1 = stepStateToTime(this.player, point1Time);
        console.log("      at position ", tempState1);
        //if (collision.surface.isPointWithinPerpBounds(tempState1.pos)) { // DEBUG TODO PLEASE DONT EVER LET THIS BE CALLED              


                //TODO I COMMENTED THIS OUT ITS PROBABLY AN IMPORTANT CASE TO HANDLE BUT I DONT REMEMBER WHAT IT MEANS D:


        //  throw "fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown";
        //}
        var collisionHeapObj = new CollisionHeapObj(tempState1, new TerrainPoint(collision.surface.p1, collision.surface, collision.surface.adjacent1));
        collisionHeap.push(collisionHeapObj);
        if (DEBUG_DRAW) {
          DEBUG_DRAW_YELLOW.push(new DebugCircle(tempState1.pos, tempState1.radius, 5));
        }
      }
    }
  }   // end massive fucking for loop. Holy hell. Now we have a minheap hopefully full of the most recent events.

  var earliestCollisions = [collisionHeap.pop()];
  console.log("earliestCollisions", earliestCollisions);
  console.log("collisionHeap.peek()", collisionHeap.peek());
  console.log("earliestCollisions[0].time", earliestCollisions[0].time);
  while (collisionHeap.peek() && collisionHeap.peek().time === earliestCollisions[0].time) {
    //if (collisionHeap.peek().collisionObj instanceof TerrainLine && earliestEvents[0].collisionObj instanceof TerrainLine   //FOR DEBUG, TODO REMOVE.
    //      && collisionHeap.peek().collisionObj.p0.x === earliestCollisions[0].collisionObj.p0.x
    //      && collisionHeap.peek().collisionObj.p0.y === earliestCollisions[0].collisionObj.p0.y
    //      && collisionHeap.peek().collisionObj.p1.x === earliestCollisions[0].collisionObj.p1.x
    //      && collisionHeap.peek().collisionObj.p1.y === earliestCollisions[0].collisionObj.p1.y) 
    //{
    //  throw "Hmm we shouldnt have 2 of the exact same thingy.";
    //} else if (collisionHeap.peek().collisionObj instanceof vec2 && earliestEvents[0].collisionObj instanceof vec2   //FOR DEBUG, TODO REMOVE.
    //      && collisionHeap.peek().collisionObj.x === earliestCollisions[0].collisionObj.x
    //      && collisionHeap.peek().collisionObj.y === earliestCollisions[0].collisionObj.y)
    //{
    //  throw "Hmm we shouldnt have 2 of the exact same thingy.";
    //}
    if (collisionHeap.peek() && (!contains(earliestCollisions, collisionHeap.peek()))) {
      console.log("not dupe, adding ", collisionHeap.peek());

      earliestCollisions.push(collisionHeap.pop());
    } else if (collisionHeap.peek()) {
      console.log("tried adding a dupe, not adding ", collisionHeap.peek());
      collisionHeap.pop();
    }
  } //earliestEvents should now have all the earliest collisions.
  if (earliestCollisions.length > 1) {
    console.log("there might be nothing wrong dunno if I'm handling this but we have more than 1 earliest event.");
  }

  return this.turnCollisionsIntoEvents(earliestCollisions);
}





/**
 * This method takes a list of collisions that occurred at the same time and decides what events need to happen.
 * Collisions are TerrainPoints and TerrainLines.
 * TODO decide how to handle line and point same time collisions. Go with line for now???
 */
PhysEng.prototype.turnCollisionsIntoEvents = function (collisions) {
  var eventList = [];
  var allowLock = true; //TODO CRITICAL NEED TO ACTUALLY CHECK LOCKING SHIT.


  var terrainLineCollisions = [];
  var terrainPointCollisions = [];
  for (var i = 0; i < collisions.length; i++) {
    
    if (collisions[i].collisionObj instanceof TerrainLine) {            //TODO replace with polymorphism that fucking works.
      if (!contains(terrainLineCollisions, collisions[i].collisionObj)) {
        terrainLineCollisions.push(collisions[i]);
      }
    } else if (collisions[i].collisionObj instanceof TerrainPoint) {
      if (!contains(terrainPointCollisions, collisions[i].collisionObj)) {
        terrainPointCollisions.push(collisions[i]);
      }
    } else if (collisions[i].collisionObj instanceof GoalLine) {           //DONE? TODO
      var ge = new GoalEvent(collisions[i].time, collisions[i].collisionObj);
      eventList.push(ge);
    } else if (collisions[i].collisionObj instanceof Collectible) {        //TODO 
      var ce = new CollectibleEvent(collisions[i].time);
      eventList.push(ce);
    }

  }
  console.log("terrainLineCollisions: ", terrainLineCollisions);
  //var collisionHeapObj = { time: point1Time, collisionObj: new TerrainPoint(collision.surface.p1, collision.surface, collision.surface.adjacent1), state: tempState1 };

  if (terrainPointCollisions.length > 0 && terrainLineCollisions.length > 0) {            // TODO DEBUG REMOVE
    console.log("terrainLineCollisions, ", terrainLineCollisions);
    console.log("terrainPointCollisions, ", terrainPointCollisions);
    throw "serious fucking problem here, got collisions with point AND line.";
  }
  if (terrainPointCollisions.length > 1) {            // TODO DEBUG REMOVE
    console.log("terrainPointCollisions, ", terrainPointCollisions);
    throw "serious fucking problem here :| we got stacked points or someshit.";
  }

  if (terrainLineCollisions.length > 0) {         // THEN WE IGNORE TERRAIN POINTS???? TODO
    if (terrainLineCollisions.length > 1) {
      console.log("   we collided with 2 TerrainLines. Just lettin you know. ", terrainLineCollisions);
      var combinedNormal = vec2(0, 0);
      var collisionSurfaces = [];
      for (var i = 0; i < terrainLineCollisions.length; i++) {
        var vecToState = terrainLineCollisions[i].state.pos.subtract(terrainLineCollisions[i].collisionObj.p0);
        combinedNormal = combinedNormal.add(terrainLineCollisions[i].collisionObj.normal.getFacing(vecToState));
        collisionSurfaces.push(terrainLineCollisions[i].collisionObj);
      }
      combinedNormal = combinedNormal.normalize();
      var surfaceVec = combinedNormal.perp();

      if (DEBUG_DRAW) {
        var collisionPoint = terrainLineCollisions[0].state.pos.subtract(combinedNormal.multf(terrainLineCollisions[0].state.radius));
        DEBUG_DRAW_BLUE.push(new DebugLine(collisionPoint, collisionPoint.add(combinedNormal.multf(100))));
      }
      var te = new TerrainLineCollisionEvent(terrainLineCollisions[0].time, collisionSurfaces, terrainLineCollisions[0].state, surfaceVec, combinedNormal, allowLock);
      eventList.push(te);
    } else {    // JUST ONE TerrainLine collision.      TerrainLine(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec)
      var tlc = terrainLineCollisions[0];

      if (DEBUG_DRAW) {
        var collisionPoint = terrainLineCollisions[0].state.pos.subtract(tlc.collisionObj.normal.multf(terrainLineCollisions[0].state.radius));
        DEBUG_DRAW_BLUE.push(new DebugLine(collisionPoint, collisionPoint.add(tlc.collisionObj.normal.multf(100))));
      }
      var te = new TerrainLineCollisionEvent(tlc.time, [tlc.collisionObj], tlc.state, tlc.collisionObj.getSurfaceAt(tlc.state), tlc.collisionObj.normal, allowLock);
      eventList.push(te);
    }
  } else if (terrainPointCollisions.length === 1) {   // no TerrainLines, deal with TerrainPoints
    var tpc = terrainPointCollisions[0];
    var vecToState = tpc.state.pos.subtract(tpc.collisionObj);

    var collisionNormal = vecToState.normalize();
    var surfaceVec = collisionNormal.perp();

    if (DEBUG_DRAW) {
      var collisionPoint = terrainPointCollisions[0].state.pos.subtract(collisionNormal.multf(terrainPointCollisions[0].state.radius));
      DEBUG_DRAW_BLUE.push(new DebugLine(collisionPoint, collisionPoint.add(collisionNormal.multf(100))));
    }

    var te = new TerrainPointCollisionEvent(tpc.time, tpc.collisionObj, tpc.state, surfaceVec, collisionNormal, allowLock);
    eventList.push(te);
  } else { //nothing???
    throw "multiple terrainPointCollisions??? " + terrainPointCollisions;
  }

  return eventList;
}



/**
 * helper function, gets an array of all the event heaps.
 */
PhysEng.prototype.getEventHeapArray = function () {
  var events = [];
  events.push(this.primaryEventHeap);
  events.push(this.predictedEventHeap);
  events.push(this.tweenEventHeap);
  events.push(this.debugEventHeap);
  //events.push(this.stateEventHeap);
  //events.push(this.tweenEventHeap);    // FUTURE HEAPS.

  return events;
}


/**
 * Helper function, gets the index of the heap with the lowest min time.
 */
PhysEng.prototype.getMinIndexInEventList = function (eventHeapList) {
  var min = 10000000000000000;
  var minIndex = -1;
  for (var i = 0; i < eventHeapList.length; i++) {
    if (eventHeapList[i].peek() && min > eventHeapList[i].peek().time) {
      min = eventHeapList[i].peek().time;
      minIndex = i;
    }
  }
  if (minIndex === -1) {
    minIndex = null;
  }
  return minIndex;
}


/**
 * Helper function, gets the minimum time.
 */
PhysEng.prototype.getMinTimeInEventList = function (eventHeapList) {
  var min = 10000000000000000;
  for (var i = 0; i < eventHeapList.length; i++) {
    if (eventHeapList[i].peek() && min > eventHeapList[i].peek().time) {
      min = eventHeapList[i].peek().time;
    }
  }
  if (min === 10000000000000000) {
    min = null;
  }
  return min;
}



/**
 * Function to pop and return the most recent event. Modify when additional event heaps are added to physics engine.
 * //DONE.
 */
PhysEng.prototype.popMostRecentEvent = function () {
  var events = this.getEventHeapArray();
  var minIndex = this.getMinIndexInEventList(events);
  return events[minIndex].pop();
}



/**
 * Function to peek and return the most recent event. Modify when additional event heaps are added to physics engine.
 * //DONE.
 */
PhysEng.prototype.peekMostRecentEvent = function () {
  var events = this.getEventHeapArray();
  var minIndex = this.getMinIndexInEventList(events);
  return events[minIndex].peek();
}



/**
 * Gets the current time from physics.
 */
PhysEng.prototype.getTime = function () {
  return this.timeMgr.time;
  //return 12.000;
}





PhysEng.prototype.loadReplay = function(inputEventList) {
  this.eventHeap = new MinHeap(inputEventList, function(e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });
  this.inReplay = true;
}
	



/**
 * draws some debug stuff in physEng.
 */
PhysEng.prototype.drawDebug = function (ctx) {
  if (DEBUG_DRAW) {
    ctx.save();
    var oldStroke = ctx.strokeStyle;
    var oldLineWidth = ctx.lineWidth;
    ctx.miterLimit = 3;

    if (this.player.surface) {
      ctx.strokeStyle = "maroon";
      ctx.lineWidth = 6;
      ctx.beginPath();
      var surface = this.player.surface;
      ctx.moveTo(surface.p0.x, surface.p0.y);
      ctx.lineTo(surface.p1.x, surface.p1.y)
      ctx.stroke();
    }

    ctx.strokeStyle = "pink";
    ctx.lineWidth = 6;
    ctx.beginPath();


    for (var i = 0; i < this.predictedEventHeap.size() ; i++) {
      //throw "balls";
      var event = this.predictedEventHeap.heap[i];
      var tempState = stepStateToTime(this.player, event.time);

      ctx.moveTo(tempState.pos.x + tempState.radius, tempState.pos.y);
      ctx.arc(tempState.pos.x, tempState.pos.y, tempState.radius, 0, 2 * Math.PI, false);
    }

    ctx.stroke();

    //DEBUG_DRAW_BLUE = [];
    //DEBUG_DRAW_GREEN = [];
    //DEBUG_DRAW_RED = [];
    ctx.restore();
    ctx.strokeStyle = oldStroke;
    ctx.lineWidth = oldLineWidth;
  }
}



	
	
	
// __________MATH SHIT_________




// Universal method to step a state forward to a time, no logic involved.
// COMPLETELY AND UTTERLY DONE. I THINK.
function stepStateToTime(state, targetGameTime) {
  var startTime = state.time;
  //console.log("in stepStateToTime. targetGameTime: ", targetGameTime);
  //console.log("startTime: ", state.time);
  //console.log("state: ", state);
  var deltaTime = targetGameTime - startTime;
  var multVel = state.vel.multf(deltaTime);
  var multAcc = state.accel.multf(deltaTime * deltaTime / 2);

  var newPos = state.pos.add(multVel.add(multAcc));

  var newVel = state.vel.add(state.accel.multf(deltaTime));

  return new State(targetGameTime, state.radius, newPos, newVel, state.accel);
}





//GET REFLECTION VECTOR. velVec = vector to get the reflection of. normalVec, the normal of the surface that you're reflecting off of. TODO possibly a bug if velVec isnt normalized for the function and then length remultiplied at the end? P sure this is right but if bounces are buggy start here.
function getReflectionVector(velVec, normalVec) {
  //     v' = 2 * (v . n) * n - v;

  // SINGLE LINE OPTIMIZED
  return (velVec).subtract(normalVec.multf(2.0 * velVec.dot(normalVec)));
  //return normalVec.multf(2.0 * velVec.dot(normalVec)).subtract(velVec);                OLD
}





/**
 * gets the time that it takes a ball with the given velocity to go from the given angle to the targetAngle.
 */
function getTimeToAngle(radius, velocity, startAngle, targetAngle) {
  //var 2 * Math.PI
}


//TEST REFLECTION
//var toReflect = new vec2(19, 31);   //moving down and right
//var theNormal = new vec2(-1, .5).normalize();    //normal facing straight up
//console.log("reflection ", getReflectionVector(toReflect, theNormal));




// finds the roots of a quadratic function ax^2 + bx + c
function solveQuadratic(a, b, c) {
  console.log("          in solveQuadratic: a ", a, ",  b ", b, ",  c ", c);
  var roots = [];
  //calculate

  if (a === 0) {
    var root = -c / b;
    return [root, root];

  } else {
    var x = (b * b) - (4 * a * c);

    if (x < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("            roots are imaginary.... a ", a, ", b ", b, ", c ", c);
      return null;
    } else {
      //calculate roots
      var bNeg = -b;
      var aDoubled = 2 * a;
      var t = Math.sqrt(x);
      var y = (bNeg + t) / (aDoubled);
      var z = (bNeg - t) / (aDoubled);
      //console.log("roots are ", y, ", ", z);
      roots.push(y);
      roots.push(z);
    }
    return roots;
  }
}



/**
 * Solves the time that it will take the provided state to reach either end of the surface.
 * returns { pointNumber: 0 or 1, time }
 */
function solveEarliestSurfaceEndpoint(state, surface) {
  if (!state || !surface) {
    throw "missing params " + state + surface;
  }

  //console.log("      solving earliest surface endpoint, ");
  //console.log("        state ", state);
  //console.log("        surface ", surface);

  //return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
  //getStateAndDistancesAlignedWithLine(state, targetLine)
  var results = getStateAndDistancesAlignedWithLine(state, surface);
  //console.log("        getStateAndDistancesAlignedWithLine results ", results);

  //var distance0 = rotateResults.rotP0.y - rotated.pos.y;
  //var distance1 = rotateResults.rotP1.y - rotated.pos.y;
  var time0 = solveTimeToDist1D(results.distanceP0, results.parallelVel, results.parallelAccel);
  var time1 = solveTimeToDist1D(results.distanceP1, results.parallelVel, results.parallelAccel);
  //console.log("curPos: ", curPos);
  //console.log("curVel: ", curVel);
  //console.log("accel: ", accel);
  //console.log("targetLine: ", targetLine);
  //console.log("distanceGoal: ", distanceGoal);

  //console.log("rotated: ", rotated);
  //console.log("distance: ", distance);
  //console.log("Solved time, time at: ", time);
  var closestPos = closestPositive(time0, time1);
  var data = null;

  if (closestPos === undefined || closestPos === null) {
    //throw "yay null this might be okay but have an exception anyway!";
  } else if (closestPos === time0) {
    data = { pointNumber: 0, time: state.time + time0 };
  } else if (closestPos === time1) {
    data = { pointNumber: 1, time: state.time + time1 };
  } else {
    throw "what the balls man, closest positive isnt time0, time1, or null???";
  }

  //console.log("        solved earliest surface endpoint. results:  ", data);

  return data;
}





  















/**
 * Solves the time that it will take the provided state to reach the next surface, if it will.
 * returns { adjNumber: 0 or 1, time, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
 * null if none in positive time or both not concave.
 */
function getNextSurfaceData(state, surface) {
  var data = null;
  var time0 = null;
  var time1 = null;

  // concave result { concave: t / f, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
  var concRes0 = surface.getAdj0Angle();
  var concRes1 = surface.getAdj1Angle();

  if (concRes0 && concRes0.concave) {
    
    time0 = solveTimeToDistFromLine(state.pos, state.vel, state.accel, surface.adjacent0, state.radius);
  }
  if (concRes1 && concRes1.concave) {

    time1 = solveTimeToDistFromLine(state.pos, state.vel, state.accel, surface.adjacent1, state.radius);
  }

  var closestPos = closestPositive(time0, time1);
  if (closestPos === undefined || closestPos === null) {
    //throw "yay null this might be okay but have an exception anyway!";
  } else if (closestPos === time0) {
    //console.log("closestPos: ", closestPos);
    //console.log("concRes0: ", concRes0);
    //console.log("time0: ", time0);
    data = { adjNumber: 0, time: state.time + time0, angle: concRes0.angle };
  } else if (closestPos === time1) {
    //console.log("closestPos: ", closestPos);
    //console.log("concRes1: ", concRes1);
    //console.log("time1: ", time1);
    data = { adjNumber: 1, time: state.time + time1, angle: concRes1.angle };
  } else {
    throw "what the balls man, closest positive isnt time0, time1, or null???";
  }

  return data;
}



/*
 * Gets the amount of time taken to travel the specified distance at the current velocity and acceleration. 1 dimensional.
 * assumes the starting position is at 0.
 */
function solveTimeToDist1D(targetDist, currentVelocity, acceleration) {
  //console.log("        solving time to dist 1D, targetDist ", targetDist, ", currentVelocity ", currentVelocity, ", acceleration ", acceleration);
  //throw "lol";
  //console.log("        solved. Time at:  ", time);

  targetDist = -targetDist;
  //var a = acceleration / 2;
  //var b = currentVelocity;
  //var c = distanceToSurfaceEnd;

  var time = null;

  if (acceleration === 0) {

    time = -targetDist / currentVelocity;
    if (time <= 0) {
      time = null;
    }

  } else {
    var x = (currentVelocity * currentVelocity) - (2 * acceleration * targetDist);
    var y;
    var z;
    if (x < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("          roots are imaginary, not gonna exit surface.");
      console.log("          x ", x, ", acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);
    } else {
      //calculate roots
      //console.log("x: ", x);
      var velNeg = -currentVelocity;
      //console.log("velNeg: ", velNeg);
      var t = Math.sqrt(x);
      //console.log("t: ", t);
      y = (velNeg + t) / (acceleration);  //root 1
      z = (velNeg - t) / (acceleration);  //root 2
      //console.log("solveTimeToDist1D.  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);
      //console.log("   possible time distances are ", y, ", ", z);

      time = closestPositive(y, z);
    }
  }

  //console.log("        solved time to dist 1D. Time at:  ", time);
  return time;
}



//Generally, targetPos is the point and distanceGoal is radius (we want to find the time when balls center point is exactly radius away from the targetPos)
//Returns the nearest positive point in time when this will occur, or null if it wont occur.
function solveTimeToDistFromPoint(curPos, curVel, accel, targetPos, distanceGoal) {
  /* (p1-(p2+vt + (1/2 * a*t^2))) = r
     -(p2+vt + (1/2 * a*t^2)) = r - p1
     -p2-vt - (1/2 * a*t^2) = r - p1
     -vt - (1/2 * a*t^2) = r - p1 + p2
     vt + (1/2 * a*t^2) = (p1 - p2) - r
        Now since ||d|| = ||b||+||c|| when d = b+c, we know that
  
     ||v||t + 1/2 * ||a||t^2 = ||p1-p2|| - r
     ||v||t + 1/2 * ||a||t^2	- ||p1-p2|| + r = 0										//NEW,	roots are when this = 0. Yields solution????
   */  

  //console.log("      solving time to dist from point, ");
  //console.log("        curPos ", curPos);
  //console.log("        curVel ", curVel);
  //console.log("        accel ", accel);
  //console.log("        targetPos ", targetPos);
  //console.log("        distanceGoal ", distanceGoal);


  var c = -(curPos.subtract(targetPos).length()) + distanceGoal;
  var rootsArray = solveQuadratic(accel.length(), curVel.length(), c); //TODO DEBUG PRINT STATEMENTS AND VERIFY THIS IS CORRECT, PROBABLY WRONG. DOES THIS ACTUALLY WORK? WAS IT REALLY THIS EASYYYY????????

  //console.log("solveTimeToDistFromPoint.   accel.length() ", accel.length(), ", curVel.length() ", curVel.length(), ", curPos ", curPos, ", targetPos ", targetPos, ", distanceGoal ", distanceGoal);
  //console.log("   possible time distances are ", rootsArray[0], ", ", rootsArray[1]);
  var time = (rootsArray === null ? null : closestPositive(rootsArray[0], rootsArray[1]));
    
  //console.log("      solved time to dist from point. Time at:  ", time);
  return time;
}



////CODE TO TEST solveTimeToDistFromLine
//console.log("DOING THE THING");
//console.log("DOING THE THING");
//console.log("DOING THE THING");
//console.log("DOING THE THING");
//var pos = new vec2(15, 10);
//var vel =  new vec2(-13, -5);
//var accel = new vec2(4, -10.0000);
//var rad = 5;

//var t0 = new vec2(-50, 0);
//var t1 = new vec2(50, -120);
//var n = t1.subtract(t0).perp().normalize();
//var ter = new TerrainLine(t0, t1, null, null, null, n);

//var test = solveTimeToDistFromLine(pos, vel, accel, ter, rad);
//console.log(test);
//throw "nothing else run fgt";




/**
 * Solves the time it will take a ball from curPos to reach the specified distance from the line.
 */
function solveTimeToDistFromLine(curPos, curVel, accel, targetLine, distanceGoal) {
  //console.log("      solving time to dist from line, ");
  //console.log("        curPos {", curPos.x, curPos.y, "}   curVel {", curVel.x, curVel.y, "}   accel {", accel.x, accel.y, "}");
  //console.log("        targetLine p0 {", targetLine.p0.x, targetLine.p0.y, "}  p1 {", targetLine.p1.x, targetLine.p1.y, (targetLine.normal.y > 0 ? "}  down" : "}  up"));
  //console.log("        distanceGoal ", distanceGoal);

  var tempState = new State(0.0, distanceGoal, curPos, curVel, accel);

  //return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
  //getStateAndDistancesAlignedWithLine(state, targetLine)
  var results = getStateAndDistancesAlignedWithLine(tempState, targetLine);
  //DEBUG_DRAW_LIGHTBLUE.push(new DebugLine(targetLine.p0, targetLine.p1, 5));
  //console.log("        results: ", results);
  var distance = (results.distancePerp > 0 ? results.distancePerp - distanceGoal : results.distancePerp + distanceGoal);
  var time = solveTimeToDist1D(distance, results.perpVel, results.perpAccel);



  //console.log("      solved time to dist from line. Time at:  ", time);
  return time;
}








///**
// * helper function that returns a bunch of bullshit.
// * returns returns { rotState, rotP0, rotP1 };
// */
//function getRotatedToXAroundState(state, targetLine) {
//  var v01 = targetLine.p1.subtract(targetLine.p0);
//  console.log(v01);
//  console.log(targetLine);
//  console.log(origin);
//  var radiansToHorizontal = getRadiansToHorizontal(v01);

//  //console.log("radiansToHorizontal: ", radiansToHorizontal);
//  //console.log("to degrees: ", radiansToHorizontal * 180 / Math.PI);

//  var rMat = getRotationMatRad(radiansToHorizontal);

//  var newPos = (curPos.subtract(targetLine.p0).multm(rMat));
//  //console.log("oldPos: ", curPos);
//  //console.log("rotated newPos: ", newPos);


//  //console.log("rotated newP1: ", v01);

//  var newVel = curVel.multm(rMat);
//  //console.log("rotated newVel: ", newVel);

//  var newAccel = accel.multm(rMat);
//  //console.log("rotated newAccel: ", newAccel);
//  var results = { pos: newPos, vel: newVel, accel: newAccel };

//  return results;
//}









////unit testing for getRotatedToYAroundState
//var testPos = new vec2(50, 50);
//var testVel = new vec2(1, 1);
//var testAccel = new vec2(-3, 0);
//var testState = new State(0.0, 1, testPos, testVel, testAccel);
//var testLine = new TerrainLine


//var aP0 = new vec2(-50, -100);
//var aP1 = new vec2(150, 100);
//var aNorm = aP1.subtract(aP0).perp().normalize();
//if (aNorm.y >= 0) {
//  aNorm = aNorm.negate();
//}
//var testLine = new TerrainLine(aP0, aP1, "wahtever", null, null, aNorm);

//var data = getStateAndDistancesAlignedWithLine(testState, testLine);
//console.log(data);

////var bP0 = new vec2(100, 100);
////var bP1 = new vec2(300, -100);
////var bNorm = bP1.subtract(bP0).perp().normalize();
////if (bNorm.y >= 0) {
////  bNorm = bNorm.negate();
////}
////var lineB = new TerrainLine(bP0, bP1, "wahtever", lineA, null, bNorm);
////lineA.adjacent1 = lineB;

//throw "testing";






/**
 * helper function that returns a bunch of bullshit. Rotates so that the targetLine is horizontal, so that distance is measureable by the y value.
 * returns relative values.
 * @return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
 */
function getStateAndDistancesAlignedWithLine(state, targetLine) {
  var v01 = targetLine.p1.subtract(targetLine.p0);
  var radiansToHorizontal = getRadiansToHorizontal(v01);
  //console.log("               getStateAndDistancesAlignedWithLine of surface = ", radiansToHorizontal);


  var rMat = getRotationMatRad(radiansToHorizontal);

  var newP0 = (targetLine.p0.subtract(state.pos).multm(rMat));
  var newP1 = (targetLine.p1.subtract(state.pos).multm(rMat));
  //console.log("oldPos: ", curPos);
  //console.log("rotated newPos: ", newPos);


  //console.log("rotated newP1: ", v01);

  var newVel = state.vel.multm(rMat);
  //console.log("rotated newVel: ", newVel);

  var newAccel = state.accel.multm(rMat);
  //console.log("rotated newAccel: ", newAccel);
  var results = { parallelVel: newVel.x, perpVel: newVel.y, parallelAccel: newAccel.x, perpAccel: newAccel.y, distancePerp: newP0.y,  distanceP0: newP0.x, distanceP1: newP1.x };

  return results;
}



/**
 * helper function to be more simple and useable than getRotatedToX/YAroundState.
 * returns 
 */
function getRelative1DLineData(state, targetLine) {
  var results = getRotatedToYAroundState(state, targetLine); // results { rotState, rotP0, rotP1 };
  var distance = results.rotP0.x;
  var velocity = results.rotState.vel;
  var accel = results.rotState.accel;
}


 
/*
 * finds the time at which the states velocity will reach velTarget.
 */
function getTimeToVelocity(state, velTarget) {
  if (!(state.time && state.vel && state.accel && velTarget)) {
    console.log("Missing fields in state.");
    console.log("time: ", state.time);
    console.log("vel: ", state.vel);
    console.log("accel: ", state.accel);
    console.log("velTarget: ", velTarget);
    throw "Missing fields in state.";
  }
  var ax = state.accel.x;
  var ay = state.accel.y;
  var vx = state.vel.x;
  var vy = state.vel.y;
  var s = velTarget;
	
  var postRad = 2 * ax * vx + 2 * ay * vy;
	
  var radical = sqrt(postRad * postRad - 4 * (ax * ax + ay * ay) * ((-(s * s)) + vx * vx + vy * vy));
  var denominator = 2 * (ax * ax + ay * ay);
	
  var t0 = (-radical - postRad) / denominator; //root 0
  var t1 = (radical - postRad) / denominator;  //root 1
	
  return closestPositive(t0, t1) + state.time;				// null if no valid roots.
}




function closestPositive(value1, value2) {
  var toReturn = null;

  //console.log("            Closest positive, ", "value1:  ", value1, "value2:  ", value2);
  if (value1 === null && value2 >= TIME_EPSILON) {      //handle nulls.
    return value2;
  } else if (value2 === null && value1 >= TIME_EPSILON) {
    return value1;
  }



  if (value1 <= TIME_EPSILON) {            // is value1 negative?     //hackey bullshit to stop infinite looping???? TODO ????
    if (value2 <= TIME_EPSILON) {
      toReturn = null;        // NO VALID ROOT, BOTH ARE BACKWARDS IN TIME
      console.log("         NO VALID ROOT, BOTH ARE BACKWARDS IN TIME, v1: ", value1, ", v2: ", value2);
    } else {
      toReturn = value2;           // value1 < 0 and value2 > 0 return value2
      //console.log("   value1 < 0 and value2 > 0 return value2, v1: ", value1, ", v2: ", value2);
    }
  } else if (value2 <= TIME_EPSILON) {     // is value2 negative? we know value1 is positive.
    toReturn = value1;             // value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1
    //console.log("   value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1, v1: ", value1, ", v2: ", value2);
  } else if (value1 > value2) {     // value1 and value2 are both positive, return the smaller one
    toReturn = value2;             // value2 occurs earlier
    //console.log("   value1 and value2 are both positive, return the smaller one. value2 occurs earlier, v1: ", value1, ", v2: ", value2);
  } else {
    toReturn = value1;             // value1 occurs earlier
    //console.log("   value1 and value2 are both positive, return the smaller one. value1 occurs earlier, v1: ", value1, ", v2: ", value2);
  }
  //console.log("   returning closest: ", toReturn);
  return toReturn;                          //TODO DEBUG could be totally wrong with this, may require a different test.
}










//ANIMATION STUFF



//this.animationFacing = "left";          // "left" or "right" or "neutral"
//this.animationWalking = false;         // is the player in the walking state?
//this.animationRunning = false;         // is the player in the running state?
//this.animationBoosting = false;         // is the player in the boost state?
//this.animationDownBoosting = false;         // is the player in the Down boost state?
//this.animationGroundJumping = false;    // is the player jumping from the ground?
//this.animationDoubleJumping = false;    // is the player air jumping?
//this.animationColliding = false;        // is the player in the collision animation?
//this.animationFreefall = false;         // is the player in the Freefall animation?

//this.animationTimeInCurrentAnimation = 0.0;   // what amount of time in seconds have we been in this animation state?
//this.animationStartTime = 0.0;
//this.animationAngleOfAnimation = 0.0;         // DO WE WANT THIS IN DEGREES OR RADIANS?
//this.animationSpeed = 0.0;                    // The player speed. Used for walking / running animations.



function animationSetPlayerDoubleJumping(p, time) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationDoubleJumping = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
  p.animationSpeed = 1.0;
}

function animationSetPlayerJumping(p, time, surfaceVec) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationGroundJumping = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
  p.animationSpeed = 1.0;
  console.log(surfaceVec);
  p.animationAngle = getRadiansToHorizontal(surfaceVec);
}

function animationSetPlayerWalking(p, time) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationWalking = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
  p.animationSpeed = p.vel.length();
}

function animationSetPlayerRunning(p, time) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationRunning = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
  p.animationSpeed = p.vel.length();
}

function animationSetPlayerBoosting(p, time) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationBoosting = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
}

function animationSetPlayerDownBoosting(p, time) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationDownBoosting = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
}

function animationSetPlayerColliding(p, time, surfaceVec) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationColliding = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
  p.animationAngle = getRadiansToHorizontal(surfaceVec);
}


function animationSetPlayerFreefall(p, time) {
  animationReset(p);
  p.animationFacing = (p.vel.x < 0 ? "left" : "right");
  p.animationFreefall = true;
  p.animationTimeInCurrentAnimation = 0.0;
  p.animationStartTime = time;
}




function animationReset(p) {
  p.animationWalking = false;         // is the player in the walking state?
  p.animationRunning = false;         // is the player in the running state?
  p.animationBoosting = false;         // is the player in the boost state?
  p.animationDownBoosting = false;         // is the player in the boost state?
  p.animationGroundJumping = false;    // is the player jumping from the ground?
  p.animationDoubleJumping = false;    // is the player air jumping?
  p.animationColliding = false;        // is the player in the collision animation?
  p.animationFreefall = false;         // is the player in the Freefall animation?
  p.animationAngle = 0.0;

  p.animationSpeed = null;
}







// Self explanatory. For debug purposes.
PhysEng.prototype.printState = function (printExtraPlayerDebug, printExtraControlsDebug, printExtraPhysDebug) {
  //if (FRAMECOUNTER === PRINTEVERY) {

  //  console.log("Player: ");
  //  console.log("  pos: %.2f, %.2f", this.player.pos.x, this.player.pos.y);
  //  console.log("  vel: %.2f, %.2f", this.player.vel.x, this.player.vel.y);
  //  if (printExtraPlayerDebug) {
  //    //console.log("  radius: %.2f", this.player.radius);
  //    console.log("  onGround: %s", this.player.onGround);
  //    console.log("  gLocked: %s", this.player.gLocked);
  //    console.log("  surfaceOn: %s", this.player.surfaceOn);
  //  }
  //  console.log("");

  //  if (printExtraControlsDebug) {
  //    console.log("Controls: ");

  //    console.log("  gLRaccel: %.2f", this.player.controlParams.gLRaccel);
  //    console.log("  aLRaccel: %.2f", this.player.controlParams.aLRaccel);
  //    console.log("  gUaccel: %.2f", this.player.controlParams.gUaccel);
  //    console.log("  gDaccel: %.2f", this.player.controlParams.gDaccel);
  //    console.log("  aUaccel: %.2f", this.player.controlParams.aUaccel);
  //    console.log("  aDaccel: %.2f", this.player.controlParams.aDaccel);
  //    console.log("  gBoostLRvel: %.2f", this.player.controlParams.gBoostLRvel);
  //    console.log("  aBoostLRvel: %.2f", this.player.controlParams.aBoostLRvel);
  //    console.log("  aBoostDownVel: %.2f", this.player.controlParams.aBoostDownVel);
  //    console.log("  jumpVelNormPulse: %.2f", this.player.controlParams.jumpVelNormPulse);
  //    console.log("  doubleJumpVelYPulse: %.2f", this.player.controlParams.doubleJumpVelYPulse);
  //    console.log("  doubleJumpVelYMin: %.2f", this.player.controlParams.doubleJumpVelYMin);
  //    console.log("  numAirCharges: %.2f", this.player.controlParams.numAirCharges);
  //    console.log("  dragBase: %.2f", this.player.controlParams.dragBase);
  //    console.log("  dragTerminalVel: %.2f", this.player.controlParams.dragTerminalVel);
  //    console.log("  dragExponent: %.2f", this.player.controlParams.dragExponent);
  //    console.log("");
  //  }


  //  if (printExtraPhysDebug) {

  //    console.log("PhysParams: ");
  //    console.log("  gravity: %.2f", this.phys.gravity);
  //    console.log("");
  //  }
  //  console.log("");
  //}
  console.log(this);
}

// Self explanatory. For debug purposes.
PhysEng.prototype.printStartState = function () {
  //console.log("Created PhysEng");
  //console.log("Controls: ");
  //console.log("  gLRaccel: %.2f", this.player.controlParams.gLRaccel);
  //console.log("  aLRaccel: %.2f", this.player.controlParams.aLRaccel);
  //console.log("  gUaccel: %.2f", this.player.controlParams.gUaccel);
  //console.log("  gDaccel: %.2f", this.player.controlParams.gDaccel);
  //console.log("  aUaccel: %.2f", this.player.controlParams.aUaccel);
  //console.log("  aDaccel: %.2f", this.player.controlParams.aDaccel);
  //console.log("  gBoostLRvel: %.2f", this.player.controlParams.gBoostLRvel);
  //console.log("  aBoostLRvel: %.2f", this.player.controlParams.aBoostLRvel);
  //console.log("  aBoostDownVel: %.2f", this.player.controlParams.aBoostDownVel);
  //console.log("  jumpVelNormPulse: %.2f", this.player.controlParams.jumpVelNormPulse);
  //console.log("  doubleJumpVelYPulse: %.2f", this.player.controlParams.doubleJumpVelYPulse);
  //console.log("  doubleJumpVelYMin: %.2f", this.player.controlParams.doubleJumpVelYMin);
  //console.log("  numAirCharges: %.2f", this.player.controlParams.numAirCharges);
  //console.log("  dragBase: %.2f", this.player.controlParams.dragBase);
  //console.log("  dragTerminalVel: %.2f", this.player.controlParams.dragTerminalVel);
  //console.log("  dragExponent: %.2f", this.player.controlParams.dragExponent);
  //console.log("");

  //console.log("PhysParams: ");
  //console.log("  gravity: %.2f", this.phys.gravity);
  //console.log("");

  //console.log("Player: ");
  //console.log("  radius: %.2f", this.player.radius);
  //console.log("  starting pos: %.2f, %.2f", this.player.pos.x, this.player.pos.y);
  //console.log("  starting vel: %.2f, %.2f", this.player.vel.x, this.player.vel.y);
  //console.log("  onGround: %s", this.player.onGround);
  //console.log("  gLocked: %s", this.player.gLocked);
  //console.log("  surfaceOn: %s", this.player.surfaceOn);
  //console.log("");
  //console.log("");
  console.log(this);
}


//STATIC HELPERS





/**
 * gets a new predicted heap. Helper method to prevent dupe code and clear up constructor.
 */
function getNewPredictedHeap() {
  return new MinHeap(null, function (e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });
}




/**
 * gets a new tween heap. Helper method to prevent dupe code and clear up constructor.
 */
function getNewTweenHeap() {
  return new MinHeap(null, function (e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });
}




/**
 * gets a new debug heap. Helper method to prevent dupe code and clear up constructor.
 */
function getNewDebugHeap() {
  return new MinHeap(null, function (e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });
}



/**
 * gets a new primary heap. Helper method to prevent dupe code and clear up constructor.
 */
function getNewPrimaryHeap() {
  return new MinHeap(null, function (e1, e2) {
    if (!e1) throw "event1 null " + e1;         //DEBUG TODO REMOVE ALL THESE IFS.
    if (!e2) throw "event2 null " + e2;
    if (!(e1.time || e1.time === 0)) throw "e1 time null";         //DEBUG TODO REMOVE ALL THESE IFS.
    if (!(e2.time || e2.time === 0)) throw "e2 time null";
    if (!((e1.mask & E_INPUT_MASK) || (e1.mask & E_RENDER_MASK) || (e1.mask & E_SYNC_MASK) || (e1.mask & E_PAUSE_MASK))) throw "e1 not an InputEvent, renderevent, pauseEvent, or sync event.";
    if (!((e2.mask & E_INPUT_MASK) || (e2.mask & E_RENDER_MASK) || (e2.mask & E_SYNC_MASK) || (e2.mask & E_PAUSE_MASK))) throw "e2 not an InputEvent, renderevent, pauseEvent, or sync event.";

    return e1.time == e2.time ? (e1.mask === e2.mask ? 0 : e1.mask > e2.mask ? -1 : 1) : e1.time < e2.time ? -1 : 1;
  });
}







// ARRAY SHIT


// Checks to see if array a contains Object obj.
function contains(a, obj) {
  if (!(obj.id)) {
    console.log("obj w/ no ID: ", obj);
    console.log("array: ", a);
    throw "!obj.id, ^";
  }
  var i = a.length;
  while (i--) {
    //console.log("obj contained: ", obj);
    //console.log("array: ", a);
    if (a[i].id === obj.id) {
      return true;
    } else {

    }
  }
  return null;
}




function pushAllAIntoB(a, b) {
  for (var i = 0; i < a.length; i++) {
    b.push(a[i]);
  }
}






/* EXAMPLE INHERITANCE
function CHILD(param1, param2, ....etc) {
  PARENT.apply(this, [PARENTparam1, PARENTparam2, ....etc])
}

CHILD.prototype = new PARENT();
CHILD.prototype.constructor = CHILD;
CHILD.prototype.method = function () {
}
*/





//var DEBUG_STEP = true;
//var DEBUG_EVENT_AT_A_TIME = true && DEBUG_STEP; //only true if debug step is also true. Saves me the time of changing 2 variables to switch between normal state and debug state.
//var DEBUG_MAX_TIMESTEP = 0.1;


////var aP0 = new vec2(-100, 100);
////var aP1 = new vec2(100, 100);
////var aNorm = aP1.subtract(aP0).perp().normalize();
////if (aNorm.y >= 0) {
////  aNorm = aNorm.negate();
////}

////var bP0 = aP1;
////var bP1 = new vec2(300, -100);
////var bNorm = bP1.subtract(bP0).perp().normalize();
////if (bNorm.y >= 0) {
////  bNorm = bNorm.negate();
////}
////var lineA = new TerrainLine(aP0, aP1, "wahtever", null, null, aNorm);
////var lineB = new TerrainLine(bP0, bP1, "wahtever", lineA, null, bNorm);
////DEBUG_DRAW_GRAY.push(new DebugLine(aP0, aP1, 5));
////DEBUG_DRAW_GRAY.push(new DebugLine(bP0, bP1, 5));

////lineA.adjacent1 = lineB;



//var aP0 = new vec2(-100, 100);
//var aP1 = new vec2(100, 200);
//var aNorm = aP1.subtract(aP0).perp().normalize();
//if (aNorm.y >= 0) {
//  aNorm = aNorm.negate();
//}

//var bP0 = aP1;
//var bP1 = new vec2(300, 0);
//var bNorm = bP1.subtract(bP0).perp().normalize();
//if (bNorm.y >= 0) {
//  bNorm = bNorm.negate();
//}
//var lineA = new TerrainLine(aP0, aP1, "wahtever", null, null, aNorm);
//var lineB = new TerrainLine(bP0, bP1, "wahtever", lineA, null, bNorm);
//DEBUG_DRAW_GRAY.push(new DebugLine(aP0, aP1, 5));
//DEBUG_DRAW_GRAY.push(new DebugLine(bP0, bP1, 5));

//lineA.adjacent1 = lineB;

//var currentLevel = new TerrainManager();
//currentLevel.terrainList.push(lineA);
//currentLevel.terrainList.push(lineB);


//var physParams = new PhysParams(400, DFLT_lockThreshold, DFLT_autoLockThreshold, DFLT_surfaceSnapAngle);
//var controlParams = new ControlParams(DFLT_gLRaccel, DFLT_aLRaccel, DFLT_aUaccel, DFLT_aDaccel, DFLT_gUaccel, DFLT_gDaccel, DFLT_gBoostLRvel, DFLT_aBoostLRvel, DFLT_aBoostDownVel, DFLT_jumpVelNormPulse, DFLT_doubleJumpVelYPulse, DFLT_doubleJumpVelYMin, DFLT_numAirCharges, 0.0, 100000000, 2, DFLT_jumpSurfaceSpeedLossRatio, DFLT_reverseAirJumpSpeed);
//var playerModel = new PlayerModel(controlParams, physParams, 0.0, DFLT_radius, new vec2(0, 0), new vec2(0, 0), new vec2(0, 0), null);       //NEW
//var physEng = new PhysEng("fuck you", playerModel);



//var i = 0;
//physEng.start();


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.debugEventHeap.push(new InputEventDown(20, true, physEng.getTime()));


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");


//physEng.stepDebug();
//i++;
//console.log("update ", i);
//console.log("playerModel, ", playerModel);
//console.log("predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
//console.log(" ");
//console.log(" ");
//console.log(" ");













// how2accessNewTerrain
//function TerrainCircular(circular, closedTerrain) {
//  //Entity.call();
//  this.circular = circular;
//  for (var item in this.circular) {
//    this.circular[item].circularID = this.id;
//  }
//  closedTerrain.push(this);
//}


//iterator
//  var itr = this.prev;
//  itr.normal = findNormalByMouse(e, itr);

//  while (itr.adjacent1 !== this.prev) {
//    var selected = itr;
//    var selectedVec = selected.p0.subtract(selected.p1).normalize();
//    itr = itr.adjacent1;



//    var nextVec = selected.adjacent1.p1.subtract(selected.adjacent1.p0).normalize();

//    var potentialNormal = nextVec.perp();
//    var negPotentialNormal = potentialNormal.negate();
//    var h = Math.acos(selectedVec.dot(nextVec));
//    if (h > HALF_PI) {
//      itr.normal = (selected.normal.dot(potentialNormal) < selected.normal.dot(negPotentialNormal) ? negPotentialNormal : potentialNormal);
//    } else {
//      itr.normal = (selected.normal.dot(potentialNormal) < selected.normal.dot(negPotentialNormal) ? potentialNormal : negPotentialNormal);
//    }





//  }
