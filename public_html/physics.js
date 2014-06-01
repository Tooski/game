
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

console.log('%c Oh my heavens! ', 'background: #222; color: #bada55');


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



/*
 * The fraction of player radius that our max movement distance will be.
*/
var MAX_MOVE_FRACTION_OF_RADIUS = 0.2;


var REPLAY_SYNC_INTERVAL = 1.0;


// this thing is just useful for storing potential states in an object.
function State(time, radius, pos, vel, accel) {
  this.PRINT_LENGTH = 8;
  if (!((time || time === 0) &&
  (radius || radius === 0) &&
  (pos && (pos.x || pos.x === 0)) &&
  (vel && (vel.x || vel.x === 0)) &&
  (accel && (accel.x || accel.x === 0)))) {
    console.log("time", time);
    console.log("radius", radius);
    console.log("pos", pos.toString());
    console.log("vel", vel.toString());
    console.log("acc", accel.toString());
    throw "missing params in AngularState";
  }

  this.time = time;
  this.radius = radius;
  this.pos = pos;
  this.vel = vel;
  this.accel = accel;
}
State.prototype.print = function (prefix) {
  if (!prefix && prefix !== "") {
    throw "missing prefix";
  }
  var pl = this.PRINT_LENGTH;
  console.log(prefix + "time     " + rl(this.time, pl) + "    --   radius " + this.radius);
  console.log(prefix + "pos      " + rl(this.pos.x, pl) + "  " + rl(this.pos.y, pl));
  console.log(prefix + "vel      " + rl(this.vel.x, pl) + "  " + rl(this.vel.y, pl));
  console.log(prefix + "acc      " + rl(this.accel.x, pl) + "  " + rl(this.accel.y, pl));
}


// this thing is just useful for storing potential angular movement states of an object.
function AngularState(time, radius, pointCircling, angle, angularVel, angularAccel) {
  this.PRINT_LENGTH = 8;
  if (!((time || time === 0) &&
    (radius || radius === 0) &&
    (angle || angle === 0) &&
    (angularVel || angularVel === 0) &&
    (angularAccel || angularAccel === 0) &&
    (pointCircling)))
  {
    console.log("time", time); 
    console.log("radius", radius); 
    console.log("angle", angle); 
    console.log("angularVel", angularVel); 
    console.log("angularAccel", angularAccel); 
    console.log("pointCircling", pointCircling);
    throw "missing params in AngularState";
  }

  this.time = time;
  this.radius = radius;
  this.point = pointCircling;
  this.a = angle;
  this.aVel = angularVel;
  this.aAccel = angularAccel;
}
AngularState.prototype.print = function (prefix) {
  if (!prefix && prefix !== "") {
    throw "missing prefix";
  }
  var pl = this.PRINT_LENGTH;
  console.log(prefix + "time     " + rl(this.time, pl) + "    --   radius" + this.radius);
  console.log(prefix + "point    " + rl(this.point.x, pl) + "  " + rl(this.point.y, pl));
  console.log(prefix + "a(ngle)  " + rl(this.a, pl));
  console.log(prefix + "aVel     " + rl(this.aVel, pl));
  console.log(prefix + "aAcc     " + rl(this.aAcc, pl));
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
function PhysParams(gravity, lockThreshold, autoLockThreshold, surfaceSnapAngle, pointLockRoundMinAngle, bounceSpeedLossRatio) {
  if (!((gravity || gravity === 0) && (lockThreshold || lockThreshold === 0) && (autoLockThreshold || autoLockThreshold === 0) && (pointLockRoundMinAngle || pointLockRoundMinAngle === 0) && (bounceSpeedLossRatio || bounceSpeedLossRatio === 0))) {
    console.log("");
    console.log("");
    console.log("gravity: ", gravity);
    console.log("lockThreshold: ", lockThreshold);
    console.log("autoLockThreshold: ", autoLockThreshold);
    console.log("pointLockRoundMinAngle: ", pointLockRoundMinAngle);
    console.log("bounceSpeedLossRatio: ", bounceSpeedLossRatio);
    throw "missing PhysParams";
  }
  this.gravity = gravity;                           // Force of gravity. Hopefully you knew that.
  this.lockThreshold = lockThreshold;               // Force of a collision after which locking is disallowed.
  this.autoLockThreshold = autoLockThreshold;       // Force of a collision after which autoLocking is disallowed.
  this.surfaceSnapAngle = surfaceSnapAngle;
  this.pointLockRoundMinAngle = pointLockRoundMinAngle;
  this.bounceSpeedLossRatio = bounceSpeedLossRatio;
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

  this.pos = pos;
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
  this.animationAngle = 0.0;         // DO WE WANT THIS IN DEGREES OR RADIANS?
  this.animationSpeed = 0.0;                    // The player speed. Used for walking / running animations.
  
  //END ANIMATION FIELDS


  this.controlParams = controlParams;
  this.physParams = physParams;
  this.inputState = new InputState();
  this.completionState = null;
	
  // PLAYER STATE
  this.surface = surfaceOrNull;   // what surface is the player on?
  this.onSurface = true;          // is the player on a surface?

  if (!surfaceOrNull) {
    this.onSurface = false;
  }

  this.locked = false;     // is the player locked to the ground?




  
  this.point = null;   // point being rounded
  this.onPoint = false;
  this.a = null;               // angle around point.
  this.aVel = null;       // signed angular velocity.
  this.aAccel = null;   // signed angular accel.
  this.nextSurface = null;
	
  //console.log("controlParams.numAirCharges, ", controlParams.numAirCharges);
  this.airChargeCount = controlParams.numAirCharges; //number of boosts / double jumps left.
	
	



  /**
   * updates the playerModel to the provided state.
   */
  this.updateToState = function (state) {
    if (!state) {
      console.log("state: ", state);
      throw "fuck you, bad state";
    }

    if (state instanceof AngularState) {
      //console.log("instanceof AngularState");
      if (!(
        (state.time || state.time === 0) &&
        (state.radius || state.radius === 0) &&
        (state.a || state.a === 0) &&
       (state.aVel || state.aVel === 0) &&
        (state.aAccel || state.aAccel === 0) &&
        (state.point))) {
        console.log("Missing fields in AngularState.");
        console.log("time: ", state.time);
        console.log("radius: ", state.radius);
        console.log("point: " + state.point.x + ", " + state.point.y);
        console.log("a: ", state.a);
        console.log("aVel: ", state.aVel);
        console.log("aAccel: ", state.aAccel);
        throw "Missing fields in AngularState. ^";
      }

      this.time = state.time;
      //this.radius = state.radius;

      this.point = state.point;
      this.onPoint = true;
      this.a = state.a;
      this.aVel = state.aVel;
      this.aAccel = state.aAccel;

      //console.log("~ ~ ~ ~ ~ ~ ~ ~ ~   angstate before conversion: ", state.toString());
      state = convertAngularToNormalState(state);
    }

    if (state instanceof State) {
      if (!(
        (state.time || state.time === 0) &&
        (state.radius || state.radius === 0) &&
        (state.pos) &&
       (state.vel) &&
        (state.accel))) {
        console.log("Missing fields in State.");
        console.log("time: ", state.time);
        console.log("radius: ", state.radius);
        console.log("pos: ", state.pos);
        console.log("vel: ", state.vel);
        console.log("accel: ", state.accel);
        throw "Missing fields in State. ^";
      }

      this.time = state.time;
      //this.radius = state.radius;
      this.pos = state.pos;
      this.vel = state.vel;
      this.accel = state.accel;
    }

  }
	

  this.leaveGround = function () { // TODO write code to handle leaving the ground here.
    this.surface = null;
    this.onSurface = false;
    this.locked = false;
    this.leaveArc();
    this.predictedDirty = true;
    this.airChargeCount = this.controlParams.numAirCharges;
    this.updateVecs(this.inputState);
    animationSetPlayerFreefall(this, this.time);
  }



  // Figures out which vector update call to use and then updates vectors.
  this.updateVecs = function (inputState) {
    //console.log(" in AccelState update function. inputState ", inputState);
    if (this.onPoint) {
      //console.log("    Doing nothing, player.onPoint is true");

    } else if (!this.onSurface) {
      //console.log("    Calling updateAir, not onPoint or onSurface.");
      this.updateVecsAir(inputState);
    } else {
      //console.log("    Calling updateGround, player..");
      this.updateVecsGround(inputState);
    }
  }


  // UPDATES THE ACCEL VECTOR AND LOWER TIER VECS BASED ON THE CURRENT INPUT STATE AND ITS EFFECTS ON THE GROUND.
  this.updateVecsGround = function (inputState) {  // DONE? TEST
    //console.log("  in AccelState.updateGround(), setting accelVec. ");

    var baseForceVec = this.getBaseForceVecGround(inputState);
    if (!this.onSurface && !this.on) {
      console.log("surface ", this.surface);
      throw "why are we updating vecs for ground when we're not on a surface?";
    }

    var surface = this.surface;
    var baseForceNormalized = baseForceVec.normalize();
    var angleToNormal = Math.acos(surface.getNormalAt(this.pos, this.radius).dot(baseForceNormalized));



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

      this.accel = projectVec2(baseForceVec, surfaceDir);
      this.predictedDirty = true;

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
    if (this.onSurface || this.onPoint) {
      console.log("surface", this.surface);
      console.log("point", this.point);
      throw "why are we updating vecs for air when onSurface or onPoint is true?";
    }

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


  /**
   * gets the base force vector.
   */
  this.getBaseForceVecGround = function (inputState) {
    var baseForceX = 0.0;
    var baseForceY = this.physParams.gravity;

    if (inputState.up) {
      //console.log("   inputState.up true");
      baseForceY -= this.controlParams.gUaccel;
    } else if (inputState.down) {
      //console.log("   inputState.down true");
      baseForceY += this.controlParams.gDaccel;
    }

    if (inputState.left) {
      //console.log("   inputState.left true");
      baseForceX -= this.controlParams.gLRaccel;
    } else if (inputState.right) {
      //console.log("   inputState.right true");
      baseForceX += this.controlParams.gLRaccel;
    }


    var baseForceVec = new vec2(baseForceX, baseForceY);
    if (inputState.additionalVecs) {                          // if theres an additional vector of force to consider
      for (var i = 0; i < additionalVecs.length; i++) {
        baseForceVec = baseForceVec.add(inputState.additionalVecs[i]);
      }
    }
    return baseForceVec;
  }

}
//PlayerModel.prototype = new State();
//PlayerModel.prototype.constructor = PlayerModel;
PlayerModel.prototype.doubleJump = function () {
  var input = this.inputState;
  var velx;
  var vely;
  this.airChargeCount--;

  if (this.onSurface) {
    throw "on surface, shouldnt be double jumping.";
  }
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
  if ((!this.onSurface && !this.onPoint) || (this.onSurface && this.onPoint)) {    //DEBUG TODO REMOVE
    console.log("this.onSurface", this.onSurface);
    console.log("this.onPoint", this.onPoint);
    throw "no surface or point (or surface AND point) and jump was called.";
  }

  if (this.onPoint) {   // jump from point
    var input = this.inputState;

    var curState = convertAngularToNormalState(this);

    this.updateToState(curState);

    var angleVecNorm = this.pos.subtract(this.point).normalize();
    console.log(this);

    animationSetPlayerJumping(this, this.time, angleVecNorm.perp());

    var jumpVec = angleVecNorm.multf(this.controlParams.jumpVelNormPulse);
    this.vel = this.vel.add(jumpVec);

    //console.log("this.surface", this.surface);
    //add end animation event for double jump. TODO

    this.predictedDirty = true;
    this.leaveGround();
  } else if (this.onSurface) {   //jump from surface
    var input = this.inputState;
    //console.log("this.surface", this.surface);
    animationSetPlayerJumping(this, this.time, this.surface.getSurfaceAt(this.pos));
    //add end animation event for double jump. TODO

    var jumpVec = this.surface.getNormalAt(this.pos, this.radius);
    jumpVec = jumpVec.multf(this.controlParams.jumpVelNormPulse);
    this.vel = this.vel.add(jumpVec);
    this.predictedDirty = true;
    this.leaveGround();
  }
}



/**
 * Function that locks the playerModel to a surface. TerrainSurface or TerrainPoint.
 */
PlayerModel.prototype.lockTo = function (surface, surfaceVecNorm) {
  if (!surface) {
    console.log("surface", surface);
    throw "no surface passed into lockTo";
  }
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


PlayerModel.prototype.getSurfaceVec = function () {
  if (this.onPoint) {
    return vecFromAngleLength(this.a, 1).perp();
  } else if (this.onSurface) {
    return this.surface.p1.subtract(this.surface.p0).normalize();
  } else {
    throw "not on surface or point, why are you getting surface vec?";
  }
}




/**
 * Helper method to cut down on code repetition in lockTo and snapTo.
 */
PlayerModel.prototype.surfaceLock = function (surface) {
  if (!surface) {
    console.log("surface", surface);
    throw "no surface passed into surfaceLock";
  }

  var ejectDist = this.radius - getDistFromLine(this.pos, surface);

  var ejectVec = surface.normal.multf(ejectDist);
  var ejectedPos = this.pos.add(ejectVec);
  this.pos = ejectedPos;

  this.airChargeCount = this.controlParams.numAirCharges;
  this.surface = surface;
  this.onSurface = true;
  this.airBorne = false;
  this.locked = this.inputState.lock;
  this.updateVecs(this.inputState);
}




/**
 * starts the player arcing.
 */
PlayerModel.prototype.startArc = function (point, arcAngle, pointToPosVec) {
  var ptpNorm = pointToPosVec.normalize();



  var ang = getSignedAngleFromAToB(HORIZ_NORM, ptpNorm);

  var angVel = (arcAngle < 0 ? -this.vel.length() : this.vel.length());
  var angAccel = (arcAngle < 0 ? -this.accel.length() : this.accel.length());


  var angState = new AngularState(this.time, this.radius, point, ang, angVel, angAccel);


  console.log("|-|-|-|-|-|  this.point ", "" + point.x, ", " + point.y);
  console.log("|-|-|-|-|-|  ang ", ang);
  console.log("|-|-|-|-|-|  angVel ", angVel);
  console.log("|-|-|-|-|-|  angAccel ", angAccel);
  console.log("|-|-|-|-|-|  angState ", angState);

  this.updateToState(angState);
  this.onSurface = false;
  this.onPoint = true;
}



/**
 * Function that deals with arking the player to a surface.
 */
PlayerModel.prototype.arcTo = function (surface) {
  console.log(" ");
  console.log(" ");

  var isAccelerating = ((this.onSurface && this.vel.length() > 0) || (this.onPoint && this.aVel !== 0));
  console.log("-=-=-=-=-=-=  ACCELERATING???", isAccelerating);
  console.log(" / / / /        player ang", this.a, "   ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ");
  console.log(" / / / /  surface norm ang", surface.normal.sangle(), "   ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ");
  console.log(" / / / /        difference", this.a - surface.normal.sangle(), "   ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ");
  //console.log(" / / / /        difference", this.a - surface.normal.sangle(), "   ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ! _ ");
  console.log(" ");
  //var cartesianState = convertAngularToNormalState(this);
  //var accel = this.accel;
  //this.updateToState(cartesianState);
  //this.accel = accel;             // TODO better way to keep from changing accel to the angular accel???? Do we even care?
  if (surface) {
    // didnt end arc early
    console.log(" +++++++++ arcTo: didnt end arc early. surface ", surface);
    var surfaceVecNorm = surface.p1.subtract(surface.p0).normalize();
    this.lockTo(surface, surfaceVecNorm);
    this.leaveArc();
  } else {
    // ended arc early, in the air.
    console.log(" +++++++++ arcTo: ended arc early, in the air.");
    this.leaveArc();
    this.leaveGround();
  }
  this.updateVecs(this.inputState);   // TODO remove?
}





/**
 * Function that sets the player state to no longer be in the arking state.
 */
PlayerModel.prototype.leaveArc = function () {
  this.point = null;
  this.onPoint = false;
  this.a = null;
  this.aVel = null;
  this.aAccel = null;
  this.nextSurface = null;
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
 * Prints the state of the player with a prefix
 */
PlayerModel.prototype.print = function (prefix) {
  if (!prefix && prefix !== "") {
    throw "missing prefix";
  }
  var pl = this.PRINT_LENGTH;
  console.log(prefix + "PlayerModel print");
  console.log(prefix + "time      " + rl(this.time, pl) + "    --   radius " + this.radius);

  if (this.surface) {
    console.log(prefix + "onSurface " + rl(this.onSurface, pl) + "            surface  " + this.surface.string(pl));
  } else {
    console.log(prefix + "onSurface " + rl(this.onSurface, pl) + "            surface  " + this.surface);
  }

  console.log(prefix + "pos       " + rl(this.pos.x, pl) + "  " + rl(this.pos.y, pl));
  console.log(prefix + "vel       " + rl(this.vel.x, pl) + "  " + rl(this.vel.y, pl));
  console.log(prefix + "acc       " + rl(this.accel.x, pl) + "  " + rl(this.accel.y, pl));

  
  if (this.point) {
    console.log(prefix + "onPoint   " + rl(this.onPoint, pl) + "            point    " + rl(this.point.x, pl) + "  " + rl(this.point.y, pl));
  } else {
    console.log(prefix + "onPoint   " + rl(this.onPoint, pl) + "            point    " + rl(this.point, pl));
  }
  console.log(prefix + "a(ng)     " + rl(this.a, pl));
  console.log(prefix + "aVel      " + rl(this.aVel, pl));
  console.log(prefix + "aAcc      " + rl(this.aAccel, pl));
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
  this.player.pos = this.tm.startPoint;    //sets player position to the level starting position.

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
    //if (!this.isPaused) {
      newEvents.push(new RenderEvent(time));
    //}
    

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

    
    if (!this.isPaused) {
      var stepResult = this.attemptNextStep(targetTime); //stepResult .state .success .events


      //if stepResult has new events
      for (var i = 0; stepResult.events && i < stepResult.events.length; i++) {
        //add new events events to eventHeap
        if (i > 1) {                                        //DEBUG CASE TESTING TODO REMOVE
          console.log("added more than one new event??? event #", i, "event list: ", stepResult.events);
          throw "uh oh????";
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
        console.log("=-=-=-=-=-=    WARNING, TIMES DONT MATCH BETWEEN CURRENTEVENT AND STEPRESULT! THIS IS BAD!");
        console.log(" -=-=-=-=-");
        console.log(" -=-=-=-=- currentEvent: ", currentEvent);
        console.log(" -=-=-=-=- stepResult: ", stepResult);
        console.log(" -=-=-=-=- timeDifference squared, ", timeDifference * timeDifference);
        console.log(" -=-=-=-=- TIME_EPSILON_SQ, ", TIME_EPSILON_SQ);
        console.log(" -=-=-=-=- times dont match between the event and the stepResult.state");
        var eventState = stepStateToTime(this.player, currentEvent.time);
        if (stepResult.events[0].tp) {

        } else {
          var collidedSurface = stepResult.events[0].collidedWithList[0];
          console.log(" -=-=-=-=- state at closest event ", eventState);
          if (!this.isPaused && collidedSurface.collidesWith(eventState.pos, eventState.radius)) {
            console.log(" -=-=-=-=- despite nearest collision time happening later,");
            console.log(" -=-=-=-=- the state at the closest event collides with terrain ", collidedSurface);
            //throw "times dont match between the event and the stepResult.state";
          }
        }



        this.tweenEventHeap = getNewTweenHeap();
        var tempState = null;
        if (this.player.onPoint) {
          tempState = stepAngularStateToTime(this.player, targetTime);
        } else {
          tempState = stepNormalStateToTime(this.player, targetTime);
        }
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
    } else {
      currentEvent = this.popMostRecentEvent();
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

 
  } while ((stepToRender && (!(currentEvent.mask & E_RENDER_MASK))) || (this.isPaused && this.peekMostRecentEvent()));
  //console.log(currentEvent);
  //console.log("(!(currentEvent.mask & E_RENDER_MASK))", (!(currentEvent.mask & E_RENDER_MASK)));
  if (currentEvent.time != this.timeMgr.time && !this.isPaused) {
    console.log("  times dont match. Current events time: ", currentEvent.time);
    console.log("  this.timeMgr.time: ", this.timeMgr.time);
    throw "see above";
  }
  //console.log("after while: ", this.primaryEventHeap);
  //console.log("finished do while loop in update, currentEvent = ", currentEvent);
  //console.log(this.player.pos);
  //console.log("");
  //console.log(stepResult.state.pos);

  
  animationUpdateAnimation(this.player, this.getTime());

  return this.player.completionState;
}





/**
 * attempts to step playerModel to the provided time.
 */
PhysEng.prototype.attemptNextStep = function (goalGameTime) {
  //console.log("");
  //console.log("");
  //console.log("new attemptNextStep, goalGameTime: ", goalGameTime);

  if (this.player.onPoint) {
    return this.attemptAngularStep(goalGameTime);
  } else {
    return this.attemptNormalStep(goalGameTime);
  }
}





/**
 * attempts the next angular step.
 */
PhysEng.prototype.attemptAngularStep = function (goalGameTime) {

  var stepCount = 1;
  var startGameTime = this.player.time;
  var deltaTime = goalGameTime - startGameTime;

  //console.log("  start of an attemptAngularStep. ");
  //console.log("    attempting to step to goalGameTime: ", goalGameTime);
  //console.log("    playerState: ", this.player);

  var velStep = this.player.aVel;
  velStep = velStep * deltaTime;

  while (velStep * velStep > this.MAX_MOVE_DIST_SQ)   // Figure out how many steps to divide this step into.
  {
    velStep = velStep / 2;
    stepCount *= 2;
  }



  var stepFraction = 0.0;
  var collisionList = [];
  var tweenTime = null;
  var tempState = null;

  var normalState = null;

  //console.log("   CollisionList.length: ", collisionList.length, " stepCount: ", stepCount);
  for (var i = 1; i < stepCount && collisionList.length === 0; i++) {     // DO check steps.
    var doNotCheck = this.getNewDoNotCheck();
    stepFraction = i / stepCount;
    tweenTime = startGameTime + stepFraction * deltaTime;

    tempState = stepAngularStateToTime(this.player, tweenTime);

    normalState = convertAngularToNormalState(tempState);


    collisionList = this.tm.getTerrainCollisions(normalState, doNotCheck);

    //console.log("      tweenStepping, i: ", i, " tweenTime: ", tweenTime);
  }

  var events = [];
  if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF AND EXITED THE LOOP EARLY, handle.
    throw "collided in angular step, no handler yet. Dont build levels like this for now.";
    events = this.findEventsAndTimesFromCollisions(collisionList);         // a bunch of TerrainCollisionEvent's hopefully?
    tempState = events[0].state;
    //this.resetPredicted();
    //console.log("    ended tweenStepping loop early");
    //console.log("    collisions: ", collisionList);
    //console.log("    tempState: ", tempState);
    //DEBUG_DRAW_BLUE.push(new DebugCircle(debugState.pos, debugState.radius, 5));

    //TODO HANDLE PREDICTING EVENTS HERE.
  } else {                // TRY FINAL STEP
    var doNotCheck = this.getNewDoNotCheck();
    //console.log("doNotCheck, ", doNotCheck);
    tweenTime = goalGameTime;
    //console.log("  finalStepping, i: ", stepCount, " tweenTime: ", tweenTime);
    tempState = stepAngularStateToTime(this.player, tweenTime);

    normalState = convertAngularToNormalState(tempState);

    collisionList = this.tm.getTerrainCollisions(normalState, doNotCheck);

    if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF ON FINAL STEP.
      throw "collided in angular step, no handler yet. Dont build levels like this for now.";
      events = this.findEventsAndTimesFromCollisions(collisionList);
      tempState = events[0].state;
      //this.resetPredicted();
      //console.log("    collided on last step.");
      //console.log("    collisions: ", collisionList);
      //console.log("    tempState: ", tempState);
      //DEBUG_DRAW_BLUE.push(new DebugCircle(debugState.pos, debugState.radius, 5));
    }
  }


  var results = new StepResult(tempState, events);                                                                                                        // INSTEAD SET RESULTS FIELDS IN PHYSENG, ONE FOR EACH TYPE.
  //console.log("  End attemptAngularStep, results", results);
  return results;
}





/**
 * attempts the next normal step.
 */
PhysEng.prototype.attemptNormalStep = function (goalGameTime) {

  var stepCount = 1;
  var startGameTime = this.player.time;
  var deltaTime = goalGameTime - startGameTime;

  //console.log("  start of an attemptNormalStep. ");
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
    collisionList = this.tm.getTerrainCollisions(tempState, doNotCheck);

    //console.log("      tweenStepping, i: ", i, " tweenTime: ", tweenTime);
  }

  var events = [];
  if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF AND EXITED THE LOOP EARLY, handle.
    events = this.findEventsAndTimesFromCollisions(collisionList);         // a bunch of TerrainCollisionEvent's hopefully?
    tempState = events[0].state;
    //this.resetPredicted();
    //console.log("    ended tweenStepping loop early");
    //console.log("    collisions: ", collisionList);
    //console.log("    tempState: ", tempState);
    //DEBUG_DRAW_BLUE.push(new DebugCircle(debugState.pos, debugState.radius, 5));

    //TODO HANDLE PREDICTING EVENTS HERE.
  } else {                // TRY FINAL STEP
    var doNotCheck = this.getNewDoNotCheck();
    //console.log("doNotCheck, ", doNotCheck);
    tweenTime = goalGameTime;
    //console.log("  finalStepping, i: ", stepCount, " tweenTime: ", tweenTime);
    tempState = stepStateToTime(this.player, tweenTime);
    collisionList = this.tm.getTerrainCollisions(tempState, doNotCheck);

    //console.log(this.tm);
    if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF ON FINAL STEP.
      events = this.findEventsAndTimesFromCollisions(collisionList);
      tempState = events[0].state;
      //this.resetPredicted();
      //console.log("    collided on last step.");
      //console.log("    collisions: ", collisionList);
      //console.log("    tempState: ", tempState);
      //DEBUG_DRAW_BLUE.push(new DebugCircle(debugState.pos, debugState.radius, 5));
    }
  }


  var results = new StepResult(tempState, events);
  //console.log("  End attemptNormalStep, results", results);
  //console.log("  End attemptNormalStep, isPaused", this.isPaused);
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
  if (this.player.onPoint) {
    // we know player is currently rounding point.
    //console.log("!i!i!i!i!i!i    this.player.onPoint evaluates true, this.player: ", this.player);
    console.log("!i!i!i!i!i!i    this.player.onPoint evaluates true, this.player.point: ", this.player.point);
    var endArcEvent = this.getArcEndEvent();    //EndArcEvent(predictedTime, dependencyMask, nextSurface). nextSurface null for early arc ends.
    console.log("pushing new endArcEvent: ", endArcEvent);

    this.predictedEventHeap.push(endArcEvent);
  } else if (this.player.onSurface) {
    var surfaceEndEvent = this.getSurfaceEndEvent();
    if (surfaceEndEvent) {
      console.log("adding surfaceEndEvent to predictedEvents. Event: ", surfaceEndEvent);
      this.predictedEventHeap.push(surfaceEndEvent);
    }
  }
  



}



PhysEng.prototype.willContinueLocking = function () {
  console.log("checking willContinueLocking");
  var baseForceVec = this.player.getBaseForceVecGround(this.player.inputState);


  var surface = this.player.nextSurface;
  var baseForceNormalized = baseForceVec.normalize();
  //console.log("");
  //console.log("");
  //console.log("in updateVecsGround(),  surface: ", surface);
  //console.log("surface.getNormalAt(this.pos, this.radius), ", surface.getNormalAt(this.pos, this.radius));
  //console.log("baseForceVec.lengthsq(), ", baseForceVec.lengthsq());
  var angleToNormal = Math.acos(surface.normal.dot(baseForceNormalized));



  if (baseForceVec.lengthsq() === 0) {
    ////console.log("   we are not being pushed, just chill");
    //this.accel = new vec2(0, 0);
    //this.predictedDirty = true;
  } else if (this.player.inputState.lock) {                                                // If we are locked to the surface we are on.
    ////console.log("   we are being locked to the surface we are on.");
    //var surfaceDir = this.vel;
    //this.accel = projectVec2(baseForceVec, surfaceDir);
    //this.predictedDirty = true;

  } else if (angleToNormal >= HALF_PI || angleToNormal <= -HALF_PI) {          // If the baseForceVec is pushing us towards the surface we're on:
    ////console.log("   we are being pushed TOWARDS the surface we are on.");
    //// WE ASSUME PLAYER'S VELOCITY VECTOR IS ALREADY ALIGNED WITH THE SURFACE.
    //// ___+____+____+___ magnitude acceleration along a sloped surface = magnitude of force * sin(angle between force and surface normal)
    //var surfaceDir = surface.getSurfaceAt(this.pos, this.radius);
    ////console.log("surfaceDir: ", surfaceDir);
    //this.accel = projectVec2(baseForceVec, surfaceDir);
    //this.predictedDirty = true;
    ////console.log("this.accel: ", this.accel);
    ////var angleToSurface = Math.acos(surfaceVec.normalize().dot(baseForceNormalized));
  } else {  // we are being pushed away from the surface we are on. Updating states to have left the ground, and then calling updateAirStates.
    ////console.log("   we are being pushed AWAY from the surface we are on. Simply calling updateAirStates.");
    //this.doNotCheckStepSurfaces.push(this.surface);
    //this.leaveGround();
    //this.updateVecsAir(inputState);
    //this.predictedDirty = true;
    return false;
  }
  return true;
}




/**
 * Resets the predictedEventHeap.
 */
PhysEng.prototype.resetPredicted = function () {
  this.predictedEventHeap = getNewPredictedHeap();
}




PhysEng.prototype.getArcEndEvent = function () {
  //var startAngle = this.player.a;
  //var endAngle1 = this.player.nextSurface.normal.angle();
  //var endAngle2 = this.player.surface.normal.angle();

        //returns { surface, nextSurface, state };
        //getSurfacesAtSoonestAngleTime(aState, surface1, surface2) {

  var results = getSurfacesAtSoonestAngleTime(this.player, this.player.nextSurface, this.player.surface);
  var endArcEvent = null;
  var arcDependencyMask = 0;

  console.log("        results: ", results);
  if (results) {
    var endState = results.state;

    endArcEvent = new EndArcEvent(endState.time, arcDependencyMask, results.nextSurface);    //EndArcEvent(predictedTime, dependencyMask, nextSurface). nextSurface null for early arc ends.
  }

  return endArcEvent;
}



/**
 * Gets the SurfaceEndEvent for a particular surface, if it exists.
 */
PhysEng.prototype.getSurfaceEndEvent = function () {

  if (this.player.onPoint) {
    throw "shouldnt be in getSurfaceEndEvent when locked to a point.";
  }
  /* returns { adjNumber: 0 or 1, time, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
   * null if none in positive time or both not concave.*/
  var adjData = getNextSurfaceData(this.player, this.player.surface);
  var adjDependencyMask = 0;


  //second, find the time that we will reach the end of the surface.
  //returns { pointNumber: 0 or 1, time }
  var endPointData = solveEarliestSurfaceEndpoint(this.player, this.player.surface);
  var endPointDependencyMask = 0;
  var surface = this.player.surface;
  var endPointAngle = (endPointData.pointNumber !== 0 ? getSignedAngleFromAToB(surface.normal, surface.adjacent1.normal) : getSignedAngleFromAToB(surface.normal, surface.adjacent0.normal));


  console.log("");
  console.log("");

  var nextSurfaceEvent = null;  //SurfaceAdjacentEvent(predictedTime, dependencyMask, surface, nextSurface, angle, allowLock)

  if (adjData && (adjData.time || adjData.time === 0)) {
    if (endPointData && (endPointData.time || endPointData.time === 0)) {
      console.log("-=-=-=-=-=-=  endpointData AND adjData. Should be adjData, but testing shit below to ensure nothing is wrong. ");

      var endPointState = stepStateToTime(this.player, endPointData.time);
      var adjDataState = stepStateToTime(this.player, adjData.time);

      this.player.print("- =-= - =-= - =-=  ");

      console.log("");
      console.log("-=-=-=-=-=-=  endPointData ", endPointData);
      console.log("-=-=-=-=-=-=  endPointAngle ", endPointAngle);
      console.log("-=-=-=-=-=-=  adjData ", adjData);


      console.log("");
      console.log("- =-= - =-= - =-=  adjDataState");
      adjDataState.print("- =-= - =-= - =-=  ");
      console.log("- =-= - =-= - =-=  endPointState");
      endPointState.print("- =-= - =-= - =-=  ");

      console.log("");
      var isAccelerating = ((this.player.onSurface && this.player.vel.length() > 0) || (this.player.onPoint && this.player.aVel !== 0));
      console.log("-=-=-=-=-=-=  ACCELERATING???", isAccelerating);
      console.log("distance from current surface when collision happens with adjacent line: " + getDistFromLine(adjDataState.pos, this.player.surface));
      console.log("distance from adj line when collision happens with adjacent line: " + getDistFromLine(adjDataState.pos, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1)));
      console.log("distance from current surface when collision happens with point: " + getDistFromLine(endPointState.pos, this.player.surface));
      console.log("distance from adj line when collision happens with point: " + getDistFromLine(endPointState.pos, (endPointData.pointNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1)));

      console.log("");


      if (adjData.adjNumber === endPointData.pointNumber) {
        // use the adjacent surface for the event. It was concave, doesnt matter what time it supposedly comes at.
        if (adjData.time > endPointData.time) {
          //console.log("adjData.time, ", adjData.time, "endPointData.time, ", endPointData.time);
          //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));

          console.log("- =-= - =-= - =-=  gray thing");
          if (this.player.onPoint) {
            throw "bullshit"
          }
          //DEBUG_DRAW_GRAY.push(new DebugCircle(endPointState.pos, this.player.radius, 5));
          //throw "Debug, but this technically shouldnt happen where endpoint was hit before the adjacent line was.";
        }
        //handle me.
        nextSurfaceEvent = new SurfaceAdjacentEvent(adjData.time, adjDependencyMask, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
        //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));
      } else {
        console.log("");
        console.log("");
        console.log("");
        console.log(" ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ");
        console.log("-=-=-=-=-=-=   endpoint and adjSurface are on opposite ends. Event whichever is soonest. ");
        // endpoint and adjSurface are on opposite ends. Event whichever is soonest.
        if (adjData.time < endPointData.time) {
          // use adjacent.
          console.log("-=-=-=-=-=-=-=   using adjacent");
          nextSurfaceEvent = new SurfaceAdjacentEvent(adjData.time, adjDependencyMask, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
          //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));
        } else {
          // use endpoint.
          console.log("-=-=-=-=-=-=-=   using endpoint");
          if (this.player.onPoint) {
            throw "bullshit"
          }                         //(adjData.time, adjDependencyMask, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
          nextSurfaceEvent = new SurfaceEndEvent(endPointData.time, endPointDependencyMask, this.player.surface, (endPointData.pointNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), (endPointData.pointNumber === 0 ? this.player.surface.p0 : this.player.surface.p1), endPointAngle, true)
          //DEBUG_DRAW_GRAY.push(new DebugCircle(endPointState.pos, this.player.radius, 5));
        }

        console.log("");
        console.log("");
        console.log("");
        console.log("");
      }

      console.log("");
      console.log("");
      console.log("");
    } else {
      // no endPointData, use adjacent.
      throw "did we ever get here?";
      console.log("  ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??  ");
      console.log("  ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??   ??  ");
      console.log("-=-=-=-=-=-=  no endpoint data, using adjacent ");

      var adjDataState = stepStateToTime(this.player, adjData.time);

      this.player.print("- =-= - =-= - =-=  ");

      console.log("");
      console.log("-=-=-=-=-=-=  adjData ", adjData);


      console.log("");
      console.log("- =-= - =-= - =-=  adjDataState");
      adjDataState.print("- =-= - =-= - =-=  ");

      console.log("");
      var isAccelerating = ((this.player.onSurface && this.player.vel.length() > 0) || (this.player.onPoint && this.player.aVel !== 0));
      console.log("-=-=-=-=-=-=  ACCELERATING???", isAccelerating);
      console.log("distance from current surface when collision happens with adjacent line: " + getDistFromLine(adjDataState.pos, this.player.surface));
      console.log("distance from adj line when collision happens with adjacent line: " + getDistFromLine(adjDataState.pos, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1)));

      console.log("");

      nextSurfaceEvent = new SurfaceAdjacentEvent(adjData.time, adjDependencyMask, this.player.surface, (adjData.adjNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), adjData.angle, true);
      //DEBUG_DRAW_GREEN.push(new DebugCircle(adjDataState.pos, this.player.radius, 5));
    }
  } else if (endPointData && (endPointData.time || endPointData.time === 0)) {
    // no adjData, use endPointData.

    var endPointState = stepStateToTime(this.player, endPointData.time);
    console.log("-=-=-=-=-=-=  no adjData, using endPoint ");

    this.player.print("- =-= - =-= - =-=  ");

    console.log("");
    console.log("-=-=-=-=-=-=  endPointData ", endPointData);
    console.log("-=-=-=-=-=-=  endPointAngle ", endPointAngle);


    console.log("- =-= - =-= - =-=  endPointState");
    endPointState.print("- =-= - =-= - =-=  ");

    console.log("");
    var isAccelerating = ((this.player.onSurface && this.player.vel.length() > 0) || (this.player.onPoint && this.player.aVel !== 0));
    console.log("-=-=-=-=-=-=  ACCELERATING???", isAccelerating);
    console.log("distance from current surface when collision happens with point: " + getDistFromLine(endPointState.pos, this.player.surface));

    console.log("");

    console.log("- =-= - =-= - =-=  gray thing");
    console.log("- =-= - =-= - =-=  endPointState", endPointState);
    nextSurfaceEvent = new SurfaceEndEvent(endPointData.time, endPointDependencyMask, this.player.surface, (endPointData.pointNumber === 0 ? this.player.surface.adjacent0 : this.player.surface.adjacent1), (endPointData.pointNumber === 0 ? this.player.surface.p0 : this.player.surface.p1), endPointAngle, true)
    //DEBUG_DRAW_GRAY.push(new DebugCircle(endPointState.pos, this.player.radius, 5));
  } else {
    throw "hi, no valid surface event???";
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
  //this.primaryEventHeap = getNewPrimaryHeap();
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

  if (this.player.onSurface || this.player.onPoint) {
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
      console.log("~~~~~~~~~~ collided line :o");
      testedLine = true;
      //function solveTimeToDistFromLine(curPos, curVel, accel, targetLine, distanceGoal) {
      var futureTime = solveTimeToDistFromLine(this.player.pos, this.player.vel, this.player.accel, collision.surface, this.player.radius);
      if (!futureTime && !futureTime === 0) {
        throw "bullshit, the solved time of something we supposedly collided with was null";
      }
      var lineTime = this.player.time + futureTime;
      var lineState = stepStateToTime(this.player, lineTime);
      
      if (DEBUG_DRAW) {
        //DEBUG_DRAW_LIGHTBLUE.push(new DebugCircle(tempState.pos, tempState.radius, 5));
      }

      console.log("~~~~~~~~~~~~ lineTime " + lineTime + ", lineState: ", lineState);
      if (collision.surface.isPointWithinPerpBounds(lineState.pos) && (lineTime || lineTime === 0) && lineTime >= 0 && lineTime < 200000000) {   // Ensures that the real collision was with the line and not the points.

        console.log("~~~~~~~~~~~~~~ and linestate within line perp bounds: ", lineState);
        var collisionHeapObj = new CollisionHeapObj(lineState, collision.surface);
        collisionHeap.push(collisionHeapObj);

      } else {                // We didnt really collide with the line. Try to add points instead.
        console.log("~~~~~~~~~~  We didnt really collide with the line. Try to add points instead.");
        //console.log("We got a line collision but not with points, but time analysis says we didnt collide with line. Testing points?");
        var point0Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p0, this.player.radius);
        var point1Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p1, this.player.radius);

        if (point0Time && point0Time > 0 && point0Time < 20000000) {
          console.log("      collision ", i, " collided with p0 at time: ", point0Time);
          var tempState0 = stepStateToTime(this.player, point0Time);
          console.log("      at position ", tempState0);
          var collisionHeapObj = new CollisionHeapObj(tempState0, new TerrainPoint(collision.surface.p0, collision.surface, collision.surface.adjacent0));
          collisionHeap.push(collisionHeapObj);
          if (DEBUG_DRAW) {
            //DEBUG_DRAW_LIGHTBLUE.push(new DebugCircle(tempState0.pos, tempState0.radius, 5));
          }
        }
        testedP0 = true;

        if (point1Time && point1Time > 0 && point1Time < 2000000000) {
          console.log("      collision ", i, " collided with p1 at time: ", point1Time);
          var tempState1 = stepStateToTime(this.player, point1Time);
          console.log("      at position ", tempState1);
          var collisionHeapObj = new CollisionHeapObj(tempState1, new TerrainPoint(collision.surface.p1, collision.surface, collision.surface.adjacent1));
          collisionHeap.push(collisionHeapObj);
          if (DEBUG_DRAW) {
            //DEBUG_DRAW_LIGHTBLUE.push(new DebugCircle(tempState1.pos, tempState1.radius, 5));
          }
        }
        testedP1 = true;

      }
    } else if (collision.collidedP0 && (!testedP0)) {
      console.log("~~~~~~~~~~ collision.collidedP0 && (!testedP0)");
      var point0Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p0, this.player.radius);

      if (point0Time && point0Time > 0 && point0Time < 2000000000000) {
        console.log("      collision ", i, " collided with p0 at time: ", point0Time);
        var tempState0 = stepStateToTime(this.player, point0Time);
        console.log("      at position ", tempState0);

        if (collision.surface.isPointWithinPerpBounds(tempState0.pos)) { // DEBUG TODO PLEASE DONT EVER LET THIS BE CALLED                   

               //TODO I COMMENTED THIS OUT ITS PROBABLY AN IMPORTANT CASE TO HANDLE BUT I DONT REMEMBER WHAT IT MEANS D:

          console.log("fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown");
          //throw "fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown";
        }

        var collisionHeapObj = new CollisionHeapObj(tempState0, new TerrainPoint(collision.surface.p0, collision.surface, collision.surface.adjacent0));
        collisionHeap.push(collisionHeapObj);
        if (DEBUG_DRAW) {
          //DEBUG_DRAW_YELLOW.push(new DebugCircle(tempState0.pos, tempState0.radius, 5));
        }
      } else {

      }
    }
    if (collision.collidedP1 && (!testedP1)) {
      var point1Time = this.player.time + solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p1, this.player.radius);

      if (point1Time && point1Time > 0 && point1Time < 2000000000000) {
        console.log("      collision ", i, " collided with p1 at time: ", point1Time);
        var tempState1 = stepStateToTime(this.player, point1Time);
        console.log("      at position ", tempState1);

        if (collision.surface.isPointWithinPerpBounds(tempState1.pos)) { // DEBUG TODO PLEASE DONT EVER LET THIS BE CALLED              

                //TODO I COMMENTED THIS OUT ITS PROBABLY AN IMPORTANT CASE TO HANDLE BUT I DONT REMEMBER WHAT IT MEANS D:
          console.log("fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown");
          //throw "fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown";
        }

        var collisionHeapObj = new CollisionHeapObj(tempState1, new TerrainPoint(collision.surface.p1, collision.surface, collision.surface.adjacent1));
        collisionHeap.push(collisionHeapObj);
        if (DEBUG_DRAW) {
          //DEBUG_DRAW_YELLOW.push(new DebugCircle(tempState1.pos, tempState1.radius, 5));
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
        //DEBUG_DRAW_BLUE.push(new DebugLine(collisionPoint, collisionPoint.add(combinedNormal.multf(100))));
      }
      var te = new TerrainLineCollisionEvent(terrainLineCollisions[0].time, collisionSurfaces, terrainLineCollisions[0].state, surfaceVec, combinedNormal, allowLock);
      eventList.push(te);
    } else {    // JUST ONE TerrainLine collision.      TerrainLine(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec)
      var tlc = terrainLineCollisions[0];

      if (DEBUG_DRAW) {
        var collisionPoint = terrainLineCollisions[0].state.pos.subtract(tlc.collisionObj.normal.multf(terrainLineCollisions[0].state.radius));
        //DEBUG_DRAW_BLUE.push(new DebugLine(collisionPoint, collisionPoint.add(tlc.collisionObj.normal.multf(100))));
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
      //DEBUG_DRAW_BLUE.push(new DebugLine(collisionPoint, collisionPoint.add(collisionNormal.multf(100))));
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
    if (eventHeapList[i].peek() && min >= eventHeapList[i].peek().time) {
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
    if (eventHeapList[i].peek() && min >= eventHeapList[i].peek().time) {
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
  if (minIndex || minIndex === 0) {
    return events[minIndex].pop();
  } else {
    return null;
  }
}



/**
 * Function to peek and return the most recent event. Modify when additional event heaps are added to physics engine.
 * //DONE.
 */
PhysEng.prototype.peekMostRecentEvent = function () {
  var events = this.getEventHeapArray();
  var minIndex = this.getMinIndexInEventList(events);
  if (minIndex || minIndex === 0) {
    return events[minIndex].peek();
  } else {
    return null;
  }
}



/**
 * Gets the current time from physics.
 */
PhysEng.prototype.getTime = function () {
  return this.timeMgr.time;
  //return 12.000;
}





PhysEng.prototype.loadReplay = function(inputEventList) {
  this.primaryEventHeap = new MinHeap(inputEventList, function(e1, e2) {
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

    if (this.player.onSurface) {
      //surface
      ctx.strokeStyle = "maroon";
      ctx.lineWidth = 6;
      ctx.beginPath();
      var surface = this.player.surface;
      ctx.moveTo(surface.p0.x, surface.p0.y);
      ctx.lineTo(surface.p1.x, surface.p1.y)
      ctx.stroke();


      //adj0
      ctx.strokeStyle = "white";
      ctx.lineWidth = 6;
      ctx.beginPath();
      var surface = this.player.surface.adjacent0;
      ctx.moveTo(surface.p0.x, surface.p0.y);
      ctx.lineTo(surface.p1.x, surface.p1.y)
      ctx.stroke();

      //adj1
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 6;
      ctx.beginPath();
      var surface = this.player.surface.adjacent1;
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
      if (tempState instanceof AngularState) {
        tempState = convertAngularToNormalState(tempState);
      }

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










// Self explanatory. For debug purposes.
PhysEng.prototype.printStartState = function () {

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
  //if (!(obj.id) || a.length === 0 || !a) {

  if (obj && !(obj.id)) {
    console.log("obj w/ no ID: ", obj);
    console.log("array: ", a);
    throw "!obj.id, ^";
  }

  if (obj) {
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
}




function pushAllAIntoB(a, b) {
  for (var i = 0; i < a.length; i++) {
    if (a[i]) {
      b.push(a[i]);
    } else {
      console.log("a[i]", a[i]);
      throw "bad a[i] ???";
    }
    
  }
}





var DEF_DEC_PRINT_PRECISION = 3;
rd = function (toRound, decPlaces) {
  if (!decPlaces) { decPlaces = DEF_DEC_PRINT_PRECISION }
  var str = "" + toRound;
  return str.substring(0, str.indexOf(".", null) + decPlaces + 1);
}


var DEF_STR_LENGTH = 6;
rl = function (num, desiredLength) {
  if (!desiredLength || desiredLength < 3) { desiredLength = DEF_STR_LENGTH }
  var str = "" + num;
  if (str.length > desiredLength) {              // trim it
    var decIndex = str.indexOf(".", null);
    //console.log("decIndex: " + decIndex);

    if (decIndex && decIndex > 0) {                 //if theres a decimal
      if (decIndex === desiredLength - 1) {           // decimal is the last place, remove and pad with a space  
        str = str.substring(0, desiredLength - 1) + " ";
        //console.log("decimal is the last place, remove and pad with a space: " + str);
      } else if (decIndex < desiredLength - 1) {      //decimal occurs in the part of the string we want.
        str = str.substring(0, desiredLength);
        //console.log("decimal occurs in the part of the string we want: " + str);
      } else {                                        // decimal occurs outside the length, cut at decimal
        str = str.substring(0, decIndex);
        //console.log("decimal occurs outside the length, cut at decimal: " + str);
      }
    } else {                                        // else no decimal, big long number
      str = str;
      //console.log("else no decimal, big long number: " + str);
    }
  } else if (str.length === desiredLength) {    // its fine, return it
    str = str;
    //console.log("its fine, return it: " + str);
  } else {                                      // pad it with starting spaces
    while (str.length < desiredLength) {
      str = str + " ";
    }
    //console.log("pad it with starting spaces: " + str);
  }
  return str;
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







// how2accessNewTerrain
//function Polygon(polygon, closedTerrain) {
//  //Entity.call();
//  this.polygon = polygon;
//  for (var item in this.polygon) {
//    this.polygon[item].polygonID = this.id;
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
//this.animationAngle = 0.0;         // DO WE WANT THIS IN DEGREES OR RADIANS?
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




function animationUpdateAnimation(p, gameTime) {
  p.animationTimeInCurrentAnimation = gameTime - p.animationStartTime;

  if (p.onPoint) {
    p.animationSpeed = (p.aVel > 0 ? p.aVel : -p.aVel);
    //var surfaceAccel = p.getSurfaceVec().multf(p.aAccel);
    p.animationAngle = p.a + HALF_PI;
    if (p.animationAngle > Math.PI) {
      p.animationAngle = p.animationAngle - TWO_PI;
    }

  } else if (p.onSurface) {

    p.animationSpeed = p.vel.length();
    var surfaceVec = p.getSurfaceVec();
    p.animationAngle = surfaceVec.sangle();
  }
}

