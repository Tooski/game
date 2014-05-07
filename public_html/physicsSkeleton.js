Physics.js
// DO A THING WITH A DRAG LOOKUP TABLE
		


// this thing is just useful for storing potential states in an object.
function State(time, radius, pos, vel, accel, eventList,  
		//accelPrime, accelDPrime									// DO WE INCLUDE SUB ACCEL DERIVS?
		) {
	this.time = time;
	this.radius = radius;
	this.pos = pos;
	this.vel = vel;
	this.accel = accel;
	this.eventList = eventList;
	//this.accelPrime = accelPrime;
	//this.accelDPrime = accelDPrime;
}
function State(time, radius, pos, vel, accel, 
		//accelPrime, accelDPrime									// DO WE INCLUDE SUB ACCEL DERIVS?
		) { // overloaded constructor
	this.time = time;
	this.radius = radius;
	this.pos = pos;
	this.vel = vel;
	this.accel = accel;
	this.eventList = [];
	//this.accelPrime = accelPrime;
	//this.accelDPrime = accelDPrime;
}






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
  this.aBoostDownVel = aBoostDownVel;         //-y velocity that a downboost sets in the air.
  this.jumpVelNormPulse = jumpVelNormPulse;             //velocity that a surface jump sets from the normal.
  this.doubleJumpVelYPulse = doubleJumpVelYPulse;       //y velocity that a double jump adds.
  this.doubleJumpVelYMin = doubleJumpVelYMin;           //min y velocity that a double jump must result in.
  this.jumpSurfaceSpeedLossRatio = jumpSurfaceSpeedLossRatio;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 

  this.numAirCharges = numAirCharges;       //number of boost / double jumps left in the air.

  this.dragBase = dragBaseAmt;              //base drag exerted
  this.dragTerminalVel = dragTerminalVel;   //the velocity at which drag and gravity will be equal with no other factors present.
  this.dragExponent = dragExponent;         //the exponent used to create the drag curve.

}



// The input state object. May replace later on with however we handle input, but this is how I'm visualizing it for now.
function InputState() {
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.lock = false;
  this.additionalVecs = null;
}

function PlayerModel(controlParams, physParams, time, radius, pos, vel, accel,       //NEW
		//accelPrime, accelDPrime
		) {
	State.apply(this, [time, radius, pos, vel, accel, 
			//accelPrime, accelDPrime
			]);
	this.controlParameters = controlParams;
	this.physParams = physParams;
	//this.inputState = inputState;
	
	// PLAYER STATE
	this.surfaceOn = surfaceOrNull;   // what surface is the player on?
	this.onGround = true;     // is the player on a surface?
	this.gLocked = false;     // is the player locked to the ground?
	
	if (!surfaceOrNull) {
	this.onGround = false;
	}
	
	this.gBoosting = false;   // is the player in the ground boost state?
	this.aBoosting = false;   // is the player in the air boost state?
	this.gJumping = false;    // is the player jumping from the ground?
	this.aJumping = false;    // is the player air jumping?

	this.airChargeCount = controlParams.numAirCharges; //number of boosts / double jumps left.
	
	
	this.updateToState = function (state) { //TODO
		if (!(state.time && state.radius && state.pos && state.vel && state.accel)) {
			console.log("Missing fields in state.");
			console.log("time: ", state.time);
			console.log("radius: ", state.radius);
			console.log("pos: ", state.pos);
			console.log("vel: ", state.vel);
			console.log("accel: ", state.accel);
			console.log("time: ", state.time);
			console.log("time: ", state.time);
			throw "Missing fields in state.";
		}
		this.time = state.time;
		this.radius = state.radius;
		this.pos = state.pos;
		this.vel = state.vel;
		this.accel = state.accel;
		this.eventList = state.eventList;
		//this.accelPrime = state.accelPrime;
		//this.accelDPrime = state.accelDPrime;
	}
	
	this.leaveGround = function () { // TODO write code to handle leaving the ground here.
		this.surfaceOn = null;
		this.onGround = false;
		this.gLocked = false;
	}
	
	
  this.updateVectors = function (inputState) {
    //console.log(" in AccelState update function. inputState ", inputState);
    if (!this.player.surfaceOn) {
      //console.log("    Calling updateAir, player.surfaceOn === null.");
      this.updateAir(inputState);
    } else {
      //console.log("    Calling updateGround, player.surfaceOn !== null.");
      this.updateGround(inputState);
    }
  }

  // UPDATES THE ACCELVEC BASED ON THE CURRENT INPUT STATE AND ITS EFFECTS ON THE GROUND.
  this.updateGround = function (inputState) {  // DONE? TEST
    //console.log("  in AccelState.updateGround(), setting accelVec. ");
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
    if (inputState.additionalVecs) {                          // if theres an additional vector of force to consider
      for (var i = 0; i < additionalVecs.length; i++) {
		baseForceVec = baseForceVec.add(inputState.additionalVecs[i]);
	  }
    }

    var surface = this.surfaceOn;
    var baseForceNormalized = baseForceVec.normalize();
    var angleToNormal = Math.acos(surface.getNormalAt(this.pos).dot(baseForceNormalized));

    if (inputState.lock) {                                                     // If we are locked to the surface we are on.
      //console.log("   we are being locked to the surface we are on.");
      var surfaceDir = this.vel;
      this.accel = projectVec2(baseForceVec, surfaceDir);
    } else if (angleToNormal > HALF_PI || angleToNormal < -HALF_PI) {          // If the baseForceVec is pushing us towards the surface we're on:
      //console.log("   we are being pushed towards the surface we are on.");
      // WE ASSUME PLAYER'S VELOCITY VECTOR IS ALREADY ALIGNED WITH THE SURFACE.
      // ___+____+____+___ magnitude acceleration along a sloped surface = magnitude of force * sin(angle between force and surface normal)
      var surfaceDir = this.vel;
      this.accel = projectVec2(baseForceVec, surfaceDir);
      //var angleToSurface = Math.acos(surfaceVec.normalize().dot(baseForceNormalized));
    } else {                                                                    // we are being pushed away from teh surface we are on. Updating states to have left the ground, and then calling updateAirStates.
      console.log("   we are being pushed AWAY from the surface we are on. Simply calling updateAirStates.");
      this.leaveGround();
      this.updateAirStates(inputState);
    }
  }
  

  // updates the accel vector based in the provided inputs based on the character being in the air state.
  this.updateAir = function (inputState) {  // DONE? TEST
    console.log("in AccelState.updateAir(), setting accelVec. ");
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
    this.accel = baseForceVec;
    //console.log(this.accel);
  }

}
PlayerModel.prototype = new State();
//PlayerModel.prototype.constructor = PlayerModel;












function StepResult () {		//TODO

}
		



PhysEng
	
	eventHeap
	predictedEventHeap
	
	
	update(targetTime, newEvents) {
		add newEvents to eventHeap
		
		do
			tempState := attemptStep(goalDeltaTime);
			
			if tempState has new events
				add tempStates events to eventHeap
			
			alter current state to reflect tempState
			
			pop currentEvent(s?) and run its handler.	//case testing verify from the popped events time that this is the time gamestate resulted in.
		while currentEvent isnt a renderEvent
		
	}
		
		
		
	attemptStep(goalDeltaTime) {
		tempState = stepAt(goalDeltaTime);
		var stepCount = 1;
		while player.velocity.multf(goalDeltaTime / stepCount) > MAX_MOVE_DISTANCE
			stepCount *= 2;
		
		
		return endstate at goalDeltaTime, OR state when new event(s) were discovered
	}
	
	
	stepAt(deltaTime) {				// the universal step-to function. returns the position if 
		doshit
	}
	
	
	
	
	
        // __________MATH SHIT_________




//GET REFLECTION VECTOR. velVec = vector to get the reflection of. normalVec, the normal of the surface that you're reflecting off of. TODO possibly a bug if velVec isnt normalized for the function and then length remultiplied at the end? P sure this is right but if bounces are buggy start here.
getReflectionVector = function (velVec, normalVec) {
  //     v' = 2 * (v . n) * n - v;

     // SINGLE LINE OPTIMIZED
  return (velVec).subtract(normalVec.multf(2.0 * velVec.dot(normalVec)));
  //return normalVec.multf(2.0 * velVec.dot(normalVec)).subtract(velVec);                OLD
}



//TEST REFLECTION
//var toReflect = new vec2(19, 31);   //moving down and right
//var theNormal = new vec2(-1, .5).normalize();    //normal facing straight up
//console.log(getReflectionVector(toReflect, theNormal));




// finds the roots of a quadratic function ax^2 + bx + c
function solveQuadratic(a, b, c) {

  var roots = [];
  //calculate
  var x = (b * b) - (4 * a * c);

  if (x < 0) {
    // ROOTS ARE IMAGINARY!
    console.log("roots are imaginary.... a ", a, ", b ", b, ", c ", c);
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

/*
 * Gets the amount of time taken to travel the specified distance at the current velocity and acceleration. 1 dimensional.
 */
function solveTimeToPoint1D(distanceToSurfaceEnd, currentVelocity, acceleration) {
  //var a = acceleration / 2;
  //var b = currentVelocity;
  //var c = distanceToSurfaceEnd;

  //calculate
  var x = (currentVelocity * currentVelocity) - (2 * acceleration * distanceToSurfaceEnd);
  var y;
  var z;
  if (x < 0) {
    // ROOTS ARE IMAGINARY!
    console.log("roots are imaginary, not gonna exit surface.");
    console.log("  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", distanceToSurfaceEnd);
    return null;
  } else {
    //calculate roots
    var velNeg = -currentVelocity;
    var t = Math.sqrt(x);
    y = (velNeg + t) / (acceleration);  //root 1
    z = (velNeg - t) / (acceleration);  //root 2
    console.log("solveTimeToPoint1D.  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", distanceToSurfaceEnd);
    console.log("   possible time distances are ", y, ", ", z);

	return closestPositive(y, z);
  }
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
  var c = -(curPos.subtract(targetPos).length()) + distanceGoal;
  var rootsArray = solveQuadratic(accel.length(), curVel.length(), c); //TODO DEBUG PRINT STATEMENTS AND VERIFY THIS IS CORRECT, PROBABLY WRONG. DOES THIS ACTUALLY WORK? WAS IT REALLY THIS EASYYYY????????

  console.log("solveTimeToDistFromPoint.   accel.length() ", accel.length(), ", curVel.length() ", curVel.length(), ", curPos ", curPos, ", targetPos ", targetPos, ", distanceGoal ", distanceGoal);
  console.log("   possible time distances are ", rootsArray[0], ", ", rootsArray[1]);

return closestPositive(rootsArray[0], rootsArray[1]);
}




 
/*
 * finds the time at which the states velocity will reach velTarget.
 */
getTimeToVelocity(state, velTarget) {
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



closestPositive = function (value1, value2) {
	    var toReturn;
    if (value1 < 0) {            // is value1 negative?
      if (value2 < 0) {
        toReturn = null;        // NO VALID ROOT, BOTH ARE BACKWARDS IN TIME
      } else {
        toReturn = value2;           // value1 < 0 and value2 > 0 return value2
      }
    } else if (value2 < 0) {     // value1 is positive, is value2?
      toReturn = value1;             // value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1
    } else if (value1 < value2) {     // value1 and value2 are both positive, return the smaller one
      toReturn = value2;             // value2 occurs earlier
    } else {
      toReturn = value1;             // value1 occurs earlier
    }
    console.log("   returning closest: ", toReturn);
    return toReturn;                          //TODO DEBUG could be totally wrong with this, may require a different test.
}





               // ARRAY SHIT


// Checks to see if array a contains Object obj.
function contains(a, obj) {
  var i = a.length;
  while (i--) {
    if (a[i] === obj) {
      return i;
    }
  }
  return null;
}





















OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  








var COLLISION_PRECISION_ITERATIONS = 10;
//DEFAULT PHYSICS VALS, TWEAK HERE
// WIDTH  = 1920 UNITS
// HEIGHT = 1080 UNITS
var DFLT_gravity = 0;        // FORCE EXERTED BY GRAVITY IS 400 ADDITIONAL UNITS OF VELOCITY DOWNWARD PER SECOND. 

var DFLT_JUMP_HOLD_TIME = 0.15; // To jump full height, jump must be held for this long. Anything less creates a fraction of the jump height based on the fraction of the full time the button was held. TODO implement.

// CONST ACCEL INPUTS
var DFLT_gLRaccel = 800;
var DFLT_aLRaccel = 600;
var DFLT_aUaccel = 500;
var DFLT_aDaccel = 500;
var DFLT_gUaccel = 300;
var DFLT_gDaccel = 300;
var DFLT_gBoostLRvel = 1500;
var DFLT_aBoostLRvel = 1500;
var DFLT_aBoostDownVel = 1500;

// CONST PULSE INPUTS
var DFLT_jumpVelNormPulse = 400;
var DFLT_doubleJumpVelYPulse = 400;
var DFLT_doubleJumpVelYMin = 400;

// OTHER CHAR DEFAULTS
var DFLT_numAirCharges = 1;
var DFLT_radius = 1920 / 32;

// CONST RATIOS
var DFLT_jumpSurfaceSpeedLossRatio = 0.7;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 
var DFLT_bounceSpeedLossRatio = 0.9;





// Physics Engine constructor.
function PhysEng(physParams, playerModel) {
  this.player = playerModel;                        // the players character model
  this.ctrl = playerModel.controlParameters;        // control parameters.
  this.phys = physParams;                           // physics parameters
  this.inputState = new InputState();
  //this.activeEvents = [];                           // array of active events. ???? DONT NEED THIS, REFACTORED INTO EVENT HANDLING???? ???? 
  this.accelState = new AccelState(this.phys, this.ctrl, this.player);
  this.accelState.updateAir(this.inputState);
  //this.checkedThisUpdate = [];
  if (PHYS_DEBUG) {
    this.printStartState();
  }
}


// CHECKS FOR COLLISIONS, HANDLES THEIR TIME STEPS, AND THEN CALLS airStep AND / OR surfaceStep WHERE APPLICABLE
// eventList is a list of event objects that occurred since last update, sorted by the order in which they occurred.
PhysEng.prototype.update = function (timeDelta, eventList) { // ______timeDelta IS ALWAYS A FLOAT REPRESENTING THE FRACTION OF A SECOND ELAPSED, WHERE 1.0 IS ONE FULL SECOND. _____________                           
  FRAMECOUNTER++;
  if (PHYS_DEBUG) {
    //console.log("\nEntered update(timeDelta), timeDelta = ", timeDelta);
    this.printState(true, false, false);
  }

  var state = new TempState(this.player.pos, this.player.vel, this.player.radius, 0.0);   //creates the initial state of the TempPlayer.
  eventList.push(new RenderEvent(timeDelta)); //Set up the last event in the array to be our render event, so that the loop completes up to the render time.

  var timeCompleted = 0.0;
  for (i = 0; i < eventList.length; i++) { //Handle all the events that have happened since last frame at their respective times.
    var event = eventList[i];
    if (!eventList[i] instanceof RenderEvent) {
      //console.log("about to stepToEndOfEvent. Event: ", event);
    }
    var terrainNotToCheck = [];
    this.stepToEndOfEvent(state, event, terrainNotToCheck); // Guarantees time has completed up to the event and the event has been handled.
    state = new TempState(this.player.pos, this.player.vel, this.player.radius, 0.0);
  }                                                       // PHYSICS ARE UP TO DATE. GO AHEAD AND RENDER.

  this.player.timeDelta = 0.0;
                                                          // WE ARE NOW DONE WITH THE ENTIRE UPDATE. HOPEFULLY NOTHING WENT WRONG.

  if (FRAMECOUNTER === PRINTEVERY) {
    FRAMECOUNTER = 0;
  }
}




// Step normally until the end of the event and then handles any intermediate events recursively before handling the event.
PhysEng.prototype.stepToEndOfEvent = function (state, event, doNotCheck) {
  //while (!eventDone) {                   //The physics step loop. Checks for collisions / lockbreaks and discovers the time they occur at. Continues stepping physics until it is caught up to "timeDelta".
  //console.log("START stepToEndOfEvent");
  var newEvents = [];
  var stepState; var indexContained
  if (this.player.surfaceOn === null) {               //In the air, call airStep
    //console.log("player airborne, event.time: ", event.time);
    stepState = this.airStep(state, event.time, doNotCheck); // TODO STATE SHOULD HAVE EVENTS NOT TerrainSurfaces.
    for (var k = 0; k < stepState.eventList.length; k++) {
      //console.log("new events added in stepToEndOfEvent, ", stepState.eventList.length);

        newEvents.push(stepState.eventList[k]);              

    }

  } else {                             //On surface, call surfaceStep 
    console.log("player NOT airborne, event.time: ", event.time);
    stepState = this.surfaceStep(state, event.time, doNotCheck);
    for (var k = 0; k < stepState.eventList.length; k++) {

        newEvents.push(stepState.eventList[k]);            

    }
  }

  var newTerrainEvents = [];
  var newCollectibleEvents = [];
  var goal = false;
  var collectibles = false;
  if (newEvents.length > 0) { // WE DIDNT FINISH, A NEW EVENT HAPPENED. ALT state.timeDelta < event.time
    //console.log("newEvents.length > 0");
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
      //console.log("newTerrainEvents.length > 0");
      for (var k = 0; k < newTerrainEvents.length; k++) {
        doNotCheck.push(newTerrainEvents[k].id);
      }
      console.log("stepstate: ", stepState);
      this.handleTerrainAirCollision(stepState, newTerrainEvents); // TODO REFACTOR TO PASS COLLISION OBJECT WITH ADDITIONAL DATA. SEE handleTerrainAirCollision COMMENTS FOR MORE INFO.
    }
    stepState = new TempState(this.player.pos, this.player.vel, this.player.radius, this.player.timeDelta);
    this.stepToEndOfEvent(stepState, event, doNotCheck);
  } else {                           // newEvents.length = 0, and WE DID FINISH
    this.player.pos = stepState.pos;
    this.player.vel = stepState.vel;
    this.player.timeDelta = stepState.timeDelta;
    //console.log("CALLING EVENTS HANDLER!!!!!!!", event);
    event.handler(this);              // LET THE EVENTS HANDLER DO WHAT IT NEEDS TO TO UPDATE THE PHYSICS STATE, AND CONTINUE ON IN TIME TO THE NEXT EVENT.
  }

  //}                                 //COMPLETED TIMESTEP UP TO WHEN EVENT HAPPENED.


}


// Returns the players new position and velocity (in a TempState object) after an airStep of this length. Does not modify values.
PhysEng.prototype.airStep = function (state, timeGoal, doNotCheck) {
  var startTime = state.timeDelta;
  //console.log("in airStep. timeGoal: ", timeGoal);
  //console.log("startTime: ", startTime);
  //this.accelState.update(this.inputState);
  var accelVec = this.accelState.accelVec;
  //console.log("accelVec before adding: ", accelVec);
  var deltaTime = timeGoal - startTime;
  var lastVel = state.vel;
  var lastPos = state.pos;
  var multVel = lastVel.multf(deltaTime);
  var multAcc = accelVec.multf(deltaTime * deltaTime / 2);
  //console.log("lastVel: ", lastVel);
  //console.log("this.inputState: ", this.inputState);
  var newVel = lastVel.add(accelVec.multf(deltaTime));
  var newPos = lastPos.add(multVel.add(multAcc));

  var tempState = new TempState(newPos, newVel, this.player.radius, timeGoal);
  var collisionData = getCollisionData(tempState, currentLevel.terrainList, doNotCheck);
  var returnState;
  if (!collisionData.collided) {  //IF WE DIDNT COLLIDE, THIS SHOULD BE GOOD? TODO CHECK TO MAKE SURE WE DIDNT MOVE MORE THAN RADIUS IN THIS STEP.
    returnState = tempState;
  } else {                        //WE COLLIDED WITH SHIT, HANDLE RECURSIVELY, TODO DONE?
    var minCollisionTime = startTime;
    var maxCollisionTime = timeGoal;
    var newTime = (maxCollisionTime + minCollisionTime) / 2.0;
    var collisions = collisionData.collidedWith;
    //newVel = lastVel.add(accelVec.multf(newTime - startTime));
    //newPos = lastPos.add(lastVel.add(newVel).divf(2.0));

    tempState = new TempState(newPos, newVel, this.player.radius, newTime);
    for (var i = 1; i < COLLISION_PRECISION_ITERATIONS || (collisionData.collided && i < 20); i++) { //find collision point
      if (i >= COLLISION_PRECISION_ITERATIONS) {
        console.log("Extra collision test ", i, ", startTime ", startTime, " timeGoal ", timeGoal, " newTime ", newTime);
      }

      if (!collisionData.collided) {  // NO COLLISION
        minCollisionTime = newTime;
      } else {                        // COLLIDED
        maxCollisionTime = newTime;
        collisions = collisionData.collidedWith;
      }

      newTime = (maxCollisionTime + minCollisionTime) / 2.0;
      deltaTime = newTime - startTime;
      multVel = lastVel.multf(deltaTime);
      multAcc = accelVec.multf(deltaTime * deltaTime / 2);
      newVel = lastVel.add(accelVec.multf(deltaTime));
      newPos = lastPos.add(multVel.add(multAcc));

      tempState = new TempState(newPos, newVel, this.player.radius, newTime);
      collisionData = getCollisionDataInList(tempState, collisions, doNotCheck);
    }   // tempstate is collision point.                                              //Optimize by passing directly later, storing in named var for clarities sake for now.

    if (!collisionData.collided) {  // NO COLLISION
      minCollisionTime = newTime;
    } else {                        // COLLIDED
      maxCollisionTime = newTime;
      collisions = collisionData.collidedWith;
    }


    newTime = (maxCollisionTime + minCollisionTime) / 2.0;
    deltaTime = newTime - startTime;
    multVel = lastVel.multf(deltaTime);
    multAcc = accelVec.multf(deltaTime * deltaTime / 2);
    newVel = lastVel.add(accelVec.multf(deltaTime));
    newPos = lastPos.add(multVel.add(multAcc));

    tempState = new TempState(newPos, newVel, this.player.radius, newTime);


    returnState = tempState;
    returnState.eventList = collisions; // TODO IMPLEMENT EVENT TYPE TO BE RETURNED IN THE CASE OF A COLLISION.
    if (PHYS_DEBUG && collisions.length > 1) {                                            //DEBUG CASE CHECKING, REMOVE WHEN PHYSICS IS BUG FREE.
      //console.log("collisions.length() shouldnt be > 1 if we didnt collide with a corner");
    }

  } // done with stepping
  //console.log("airStep returnState: ", returnState);
  return returnState;

}



// A step while the player is in the surface. Returns the players new position and velocity and time and any events that happened (in a TempState object) after attempting surfaceStep of this length. Does not modify values.
PhysEng.prototype.surfaceStep = function (state, timeGoal, doNotCheck) {
  console.log("in unimplemented surfaceStep.");
  var collisionData = getCollisionData(state, terrainList, [this.player.surfaceOn.id]);
  
  if (!collisionData.collided) {
                                 // WE ARE NOW IN THE AIR. RECURSIVELY FIND WHERE WE LEFT THE SURFACE, HANDLE THAT, THEN STEP ACCORDINGLY DEPENDING ON WHAT WE'RE ON AFTERWARDS.
  } else if (collisionData.collidedWith.length === 1 && collisionData.collidedWith[0] === this.player.surfaceOn) {
                                 // WE ARE STILL ON THE SURFACE WE WERE ON LAST FRAME, NO OTHER COLLISIONS, HANDLE NORMALLY, TODO
  } else {     
                                 // WE COLLIDED With SOMEthING NEW, HANDLE COLLISIONS RECURSIVELY OR SOMESHIT, TODO

  }
  return state;
  // REMEMBER TO UPDATE this.player.timeDelta to the state where the surfaceStep ended.
}


//This code handles a terrain collision. TODO REFACTOR TO TAKE A COLLISION OBJECT THAT HAS A NORMAL OF COLLISION, AND A SINGLE SURFACE THAT MAY BE LOCKED TO, IF ANY. THIS WILL COVER MULTICOLLISIONS AND CORNERS / ENDPOINT CASES.
// RETURNS NOTHING, SIMPLY SETS STATES.
PhysEng.prototype.handleTerrainAirCollision = function (ballState, stuffWeCollidedWith) {
  //console.log("START handleTerrainAirCollision");
  var normalBallVel = ballState.vel.normalize();
  var angleToNormal;
  var collisionVec;
  //if (stuffWeCollidedWith.length > 1) {
  console.log("radius = ", ballState.radius);
  collisionVec = stuffWeCollidedWith[0].getNormalAt(ballState.pos, ballState.radius);
  //console.log(collisionVec);
    for (var i = 1; i < stuffWeCollidedWith.length; i++) {
      collisionVec = collisionVec.add(stuffWeCollidedWith[i].getNormalAt(ballState.pos, ballState.radius));
      //console.log("dealing with a multiple thing collision...");
    }
    angleToNormal = Math.acos(collisionVec.normalize().dot(normalBallVel));
    var collisionVecNorm = collisionVec.normalize();
    console.log("collisionVecNorm = ", collisionVecNorm);
  //} else {
    //angleToNormal = Math.acos(collisionVec.getNormalAt(ballState.pos).dot(normalBallVel));
  //}


  var COLLISION_GLANCING_ENOUGH_TO_AUTO_LOCK = false; //TODO do some math
  if (COLLISION_GLANCING_ENOUGH_TO_AUTO_LOCK) {
    console.log("auto locked!?!?");
    throw "AUTO LOCKED";
    var surfaceVecNorm = collisionVecNorm.perp();      //TODO OHGOD REFACTOR TO THIS METHOD TAKING A COLLISION OBJECT THAT STORES NORMALS AND THE SINGLE SURFACE TO LOCK TO
    var surfaceAngle = surfaceVecNorm.dot(normalBallVel);

    //var velocityMag = ballState.vel.length();                     // DISABLED FOR REALISTIC PHYSICS
    //var surfaceInvertAngle = surfaceVec.negate().dot(normalBallVel);

    //if (surfaceAngle > surfaceInvertAngle) {
    //  surfaceVec = surfaceVec.negate();
    //}
    //this.player.vel = surfaceVec.multf(velocityMag);              // END DISABLED FOR REALISTIC PHYSICS

    this.player.pos = ballState.pos;
    this.player.vel = projectVec2(ballState.vel, surfaceVecNorm);
    this.player.airBorne = false;
    this.player.surfaceLocked = inputState.lock;


    // IF PLAYER IS HOLDING LOCK, ATTEMP TO LOCK IF WITHIN BOUNDARIES! TODO IS THE NEGATIVE LOCK_MIN_ANGLE CHECK NEEDED!!!?
  } else if (this.inputState.lock && (angleToNormal > LOCK_MIN_ANGLE || angleToNormal < -LOCK_MIN_ANGLE)) {
    console.log("locked!?!?");
    throw "LOCKED";
    //var velocityMag = ballState.vel.length();                 // COMMENTED OUT FOR REALISTIC PHYSICS
    //var surfaceVecNorm = stuffWeCollidedWith[0].getSurfaceAt(ballState.pos); // REFACTOR TO USE NEW COLLISION OBJECT
    //var surfaceAngle = surfaceVecNorm.dot(normalBallVel);
    //var surfaceInvertAngle = (surfaceVec.negate()).dot(normalBallVel);

    //if (surfaceAngle > surfaceInvertAngle) {
    //  surfaceVec = surfaceVec.negate();
    //}
    //this.player.vel = surfaceVec.multf(velocityMag);          // END COMMENTED OUT FOR REALISTIC PHYSICS


    var surfaceVecNorm = collisionVecNorm.perp();       // REALISTIC ADDITIONS START
    this.player.vel = projectVec2(ballState.vel, surfaceVecNorm);                                             // TODO DOES NOT TAKE INTO ACCOUNT TOUCHING THE END OF A LINE.
                                                                // REALISTIC ADDITIONS END
    this.player.pos = ballState.pos;
    this.player.airBorne = false;
    this.player.surfaceLocked = inputState.lock;
    this.player.surfaceOn = stuffWeCollidedWith[0]; // TODO REFACTOR TO USE NEW COLLISION OBJECT


    // BOUNCE. TODO implement addition of normalVector * jumpVel to allow jump being held to bounce him higher?   perhaps just buffer jump events.      
  } else {
    //throw "BOUNCE";
    //console.log(collisionVec.normalize());
    this.player.vel = getReflectionVector(normalBallVel, stuffWeCollidedWith[0].getNormalAt(ballState.pos, ballState.radius)).multf(ballState.vel.length() * DFLT_bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT
    //this.player.vel = getReflectionVector(ballState.vel, collisionVec.normalize()).multf(DFLT_bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT          // COLLISIONVEC AVERAGE VERSION
    this.player.pos = ballState.pos;
    this.player.airBorne = true;
    //this.player.surfaceOn = null;      //TODO remove. This shouldnt be necessary as should be set when a player leaves a surface.
  }
  this.player.timeDelta = ballState.timeDelta;
}

  // Self explanatory. For debug purposes.
PhysEng.prototype.printState = function (printExtraPlayerDebug, printExtraControlsDebug, printExtraPhysDebug) {
  if (FRAMECOUNTER === PRINTEVERY)
  {

    console.log("Player: ");
    console.log("  pos: %.2f, %.2f", this.player.pos.x, this.player.pos.y);
    console.log("  vel: %.2f, %.2f", this.player.vel.x, this.player.vel.y);
    if (printExtraPlayerDebug) {
      //console.log("  radius: %.2f", this.player.radius);
      console.log("  onGround: %s", this.player.onGround);
      console.log("  gLocked: %s", this.player.gLocked);
      console.log("  surfaceOn: %s", this.player.surfaceOn);
    }
    console.log("");

    if (printExtraControlsDebug) {
      console.log("Controls: ");

      console.log("  gLRaccel: %.2f", this.player.controlParameters.gLRaccel);
      console.log("  aLRaccel: %.2f", this.player.controlParameters.aLRaccel);
      console.log("  gUaccel: %.2f", this.player.controlParameters.gUaccel);
      console.log("  gDaccel: %.2f", this.player.controlParameters.gDaccel);
      console.log("  aUaccel: %.2f", this.player.controlParameters.aUaccel);
      console.log("  aDaccel: %.2f", this.player.controlParameters.aDaccel);
      console.log("  gBoostLRvel: %.2f", this.player.controlParameters.gBoostLRvel);
      console.log("  aBoostLRvel: %.2f", this.player.controlParameters.aBoostLRvel);
      console.log("  aBoostDownVel: %.2f", this.player.controlParameters.aBoostDownVel);
      console.log("  jumpVelNormPulse: %.2f", this.player.controlParameters.jumpVelNormPulse);
      console.log("  doubleJumpVelYPulse: %.2f", this.player.controlParameters.doubleJumpVelYPulse);
      console.log("  doubleJumpVelYMin: %.2f", this.player.controlParameters.doubleJumpVelYMin);
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
}

// Self explanatory. For debug purposes.
PhysEng.prototype.printStartState = function () {
  console.log("Created PhysEng");
  console.log("Controls: ");
  console.log("  gLRaccel: %.2f", this.player.controlParameters.gLRaccel);
  console.log("  aLRaccel: %.2f", this.player.controlParameters.aLRaccel);
  console.log("  gUaccel: %.2f", this.player.controlParameters.gUaccel);
  console.log("  gDaccel: %.2f", this.player.controlParameters.gDaccel);
  console.log("  aUaccel: %.2f", this.player.controlParameters.aUaccel);
  console.log("  aDaccel: %.2f", this.player.controlParameters.aDaccel);
  console.log("  gBoostLRvel: %.2f", this.player.controlParameters.gBoostLRvel);
  console.log("  aBoostLRvel: %.2f", this.player.controlParameters.aBoostLRvel);
  console.log("  aBoostDownVel: %.2f", this.player.controlParameters.aBoostDownVel);
  console.log("  jumpVelNormPulse: %.2f", this.player.controlParameters.jumpVelNormPulse);
  console.log("  doubleJumpVelYPulse: %.2f", this.player.controlParameters.doubleJumpVelYPulse);
  console.log("  doubleJumpVelYMin: %.2f", this.player.controlParameters.doubleJumpVelYMin);
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
  console.log("  onGround: %s", this.player.onGround);
  console.log("  gLocked: %s", this.player.gLocked);
  console.log("  surfaceOn: %s", this.player.surfaceOn);
  console.log("");
  console.log("");
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




// MAIN CODE TESTING BS HERE
//var physParams = new PhysParams(DFLT_gravity);
//var controlParams = new ControlParams(DFLT_gLRaccel, DFLT_aLRaccel, DFLT_aUaccel, DFLT_aDaccel, DFLT_gUaccel, DFLT_gDaccel, DFLT_gBoostLRvel, DFLT_aBoostLRvel, DFLT_aBoostDownVel, DFLT_jumpVelNormPulse, DFLT_doubleJumpVelYPulse, DFLT_doubleJumpVelYMin, DFLT_numAirCharges, 0.0, 100000000, 2, DFLT_jumpSurfaceSpeedLossRatio);
//var playerModel = new PlayerModel(controlParams, DFLT_radius, new vec2(800, -400), null);
//var physeng = new PhysEng(physParams, playerModel);
//physeng.update(0.001, []);
//physeng.update(0.002, []);
//physeng.update(0.005, []);
//physeng.update(0.010, [new InputEventRight(0.005, true)]);
//physeng.update(0.050, [new InputEventRight(0.005, false), new InputEventLeft(0.010, true)]);
//physeng.update(0.200, [new InputEventUp(0.084, true)]);
//physeng.update(0.010, [new InputEventLeft(0.0005, false)]);
//physeng.update(0.035, [new InputEventUp(0.03, false)]);






// PHYS EFFICIENCY PROFILE STUFF

var time_in_update = 0.0;
var time_in_other = 0.0; //etc






/* SHIT THAT PRINTS TO THE SCREEN, USE PER FRAME FOR TESTING PERHAPS.
  this.ctx.font = "30px Arial";
    this.ctx.fillText("Hello World",200 + player.model.pos.x - (initWidth/ctx.canvas.width) * (ctx.canvas.width/ initScale / 2),100 + player.model.pos.y - (initWidth/ctx.canvas.width) * (ctx.canvas.height/ initScale / 2) );
*/



TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ 

/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 * Author Travis Drake
 */
var PHYS_DEBUG = true;

var HALF_PI = Math.PI / 2.0;

var LOCK_MIN_ANGLE = 45.0 / 180 * Math.PI;  //ANGLE OF COLLISION BELOW WHICH NOT TO BOUNCE.
var PRINTEVERY = 240;
var FRAMECOUNTER = 0;

var printFor = 5;
var printed = 0;

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