/*
 * Physics.js
 * terrainManager gets passed
 */
// DO A THING WITH A DRAG LOOKUP TABLE TODO PLZ


/*
 * The fraction of player radius that our max movement distance will be.
*/
var MAX_MOVE_FRACTION_OF_RADIUS = 1.0;


// this thing is just useful for storing potential states in an object.
function State(time, radius, pos, vel, accel
  //, accelPrime, accelDPrime									// DO WE INCLUDE SUB ACCEL DERIVS?
		) {

  this.time = time;
  this.radius = radius;
  this.pos = pos;
  this.vel = vel;
  this.accel = accel;
  //this.accelPrime = accelPrime;
  //this.accelDPrime = accelDPrime;
}
function State(time, radius, pos, vel, accel 
  //, accelPrime, accelDPrime									// DO WE INCLUDE SUB ACCEL DERIVS?
		) { // overloaded constructor

  this.time = time;
  this.radius = radius;
  this.pos = pos;
  this.vel = vel;
  this.accel = accel;
  //this.accelPrime = accelPrime;
  //this.accelDPrime = accelDPrime;
}






/**PhysParams object contains all the physics values. These will not change between characters. 
 * This exists because it will be used later on to implement other terrain types, whose static
 * effect values will be passed in here.
 */
function PhysParams(gravity) {
  this.gravity = gravity;
}


/**This object contains all the values that are relative to the PLAYER. 
 * IE, anything that would be specific to different selectable characters.
 */
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



/**
 * The input state object. May replace later on with however we handle input, but this is how I'm visualizing it for now.
 */
function InputState() {
  this.left = false;
  this.right = false;
  this.up = false;
  this.down = false;
  this.lock = false;
  this.additionalVecs = null;
}



function PlayerModel(controlParams, physParams, time, radius, pos, vel, accel       //NEW
  //, accelPrime, accelDPrime
		) {
  State.apply(this, [time, radius, pos, vel, accel 
			//, accelPrime, accelDPrime
  ]);


  /**
   * ANIMATION FIELDS FOR MIKE!
   */
  this.animationFacing = "left";          // "left" or "right" or "neutral"
  this.animationBoosting = false;         // is the player in the boost state?
  this.animationgroundJumping = false;    // is the player jumping from the ground?
  this.animationDoubleJumping = false;    // is the player air jumping?
  this.animationColliding = false;        // is the player in the collision animation?
  this.animationFreefall = false;         // is the player in the Freefall animation?
	
  this.animationTimeInCurrentAnimation = 0.0;   // what amount of time in seconds have we been in this animation state?
  this.animationAngleOfAnimation = 0.0;         // DO WE WANT THIS IN DEGREES OR RADIANS?
  
  //END ANIMATION FIELDS




  this.controlParameters = controlParams;
  this.physParams = physParams;
  //this.inputState = inputState;
	
  // PLAYER STATE
  this.surfaceOn = surfaceOrNull;   // what surface is the player on?
  this.onGround = true;     // is the player on a surface?
  this.gLocked = false;     // is the player locked to the ground?


  this.roundingPoint = false;
  this.pointBeingRounded = null;
  this.angleAroundPoint = 0.0;   //RADIANS OR DEGREES I HAVE NO IDEA
  this.rotationDirection = false; // TRUE IF CLOCKWISE, FALSE IF COUNTER-CLOCKWISE.
	
  if (!surfaceOrNull) {
    this.onGround = false;
  }

  this.airChargeCount = controlParams.numAirCharges; //number of boosts / double jumps left.
	
	



  /**
   * updates the playerModel to the provided state.
   */
  this.updateToState = function (state) {
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
    //this.accelPrime = state.accelPrime;
    //this.accelDPrime = state.accelDPrime;
  }
	

  this.leaveGround = function () { // TODO write code to handle leaving the ground here.
    this.surfaceOn = null;
    this.onGround = false;
    this.gLocked = false;
  }
	
	// Figures out which vector update call to use and then updates vectors.
  this.updateDerivVectors = function (inputState) {
    //console.log(" in AccelState update function. inputState ", inputState);
    if (!this.player.surfaceOn) {
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
  this.updateVecsAir = function (inputState) {  // DONE? TEST
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
		



// Physics Engine constructor.
function PhysEng(playerModel, terrainManager) {
  this.player = playerModel;                        // the players character model

  // Self explanitory
  this.MAX_MOVE_DIST = this.player.radius * MAX_MOVE_FRACTION_OF_RADIUS; 

  // The above but squared. Useful
  this.MAX_MOVE_DIST_SQ = this.MAX_MOVE_DIST * this.MAX_MOVE_DIST;

  // The level terrainManager.
  this.tm = terrainManager;
  this.player.pos = tm.playerStartPos;


  //this.ctrl = playerModel.controlParameters;        // control parameters.
  this.inputState = new InputState();

  //The events that will need to be handled.
  this.eventHeap = new MinHeap(null, function(e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });

  //The predicted events. This is cleared and re-predicted every time the inputs to PhysEng are modified.
  this.predictedEventHeap = new MinHeap(null, function(e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });


  this.inReplay = false;
  this.ReplayData = [];
	
	
  if (PHYS_DEBUG) {
    this.printStartState();
  }
		
		
  /**
   * attempts to step playerModel to the provided time.
   */
  this.attemptNextStep = function(goalGameTime) {
    var stepCount = 1;
    while (player.velocity.multf(goalGameTime / stepCount).lengthsq() > this.MAX_MOVE_DISTANCE_SQ)   // Figure out how many steps to divide this step into.
    {
      stepCount *= 2;
    }

    var startGameTime = this.player.time;
    var deltaTime = goalGameTime - startGameTime;

    var fraction = 0.0;
    var collisionList = [];
    var tweenTime;
    for (var i = 1; i < stepCount + 1 && collisionList.length === 0; i++) {     // Take steps.
      fraction = i / stepCount;
      tweenTime = startGameTime + fraction * deltaTime;

      var tempState = this.stepStateByTime(this.player, tweenTime);

      collisionList = getCollisionsInList(tempState, this.tm.terrain, []);    //TODO MINIMIZE THIS LIST SIZE, THIS IS IDIOTIC
    }

    var events = [];
    if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF AND EXITED THE LOOP EARLY, handle.
      events = findEventsFromCollisions(collisionList);
    } else if (tweenTime !== goalGameTime) {
      console.log("tweenTime: ", tweenTime, " goalGameTime: ", goalGameTime);
      throw "yeah I'm gonna need to manually update to goalTime cuz this isnt working";
    } else {                                                        // NO COLLISIONS.
      console.log("attemptNextStep, no collisions and resulting times matched:");
      console.log("tweenTime: ", tweenTime, " goalGameTime: ", goalGameTime);
    }
    //else {                // TRY FINAL STEP
    //  tweenTime = goalGameTime;
    //  var tempState = this.stepStateByTime(this.player, tweenTime);
    //  collisionList = getCollisionsInList(tempState, this.tm.terrain, []);    //TODO MINIMIZE THIS LIST SIZE, THIS IS IDIOTIC
      
    //  if (collisionList.length > 0) {   // WE COLLIDED WITH STUFF AND EXITED THE LOOP EARLY
    //    events = findEventsFromCollisions(collisionList);
    //  }
    //}
    var results = new StepResult(endState, eventArray);
    //TODO UPDATE PLAYER HERE???
    return results;
  }

	
  // Universal method to step a state forward to a time, no logic involved.
  // COMPLETELY AND UTTERLY DONE. I THINK.
  this.stepStateByTime = function(state, targetGameTime) {				
    var startTime = state.time;
    //console.log("in airStep. timeGoal: ", timeGoal);
    //console.log("startTime: ", startTime);
    //this.accelState.update(this.inputState);
    //console.log("accelVec before adding: ", accelVec);
    var deltaTime = targetGameTime - startTime;
    var multVel = state.vel.multf(deltaTime);
    var multAcc = state.accel.multf(deltaTime * deltaTime / 2);
    //console.log("lastVel: ", lastVel);
    //console.log("this.inputState: ", this.inputState);
    var newVel = state.vel.add(state.accel.multf(deltaTime));
    var newPos = state.pos.add(multVel.add(multAcc));
    return new State(targetGameTime, state.radius, newPos, newVel, state.accel);
  }




  /**
   * Determines the time of the collisions and then return the earliest, those that tie for the earliest.
   * data = { collision: false, collidedLine: false, collidedP0: false, collidedP1: false, surface: this, perpendicularIntersect: pD }
   */
  this.findEventsFromCollisions = function (collisionList) {

    var collisionHeap = new MinHeap(null, function (e1, e2) {
      return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
    });

    for (var i = 0; i < collisionList.length; i++) {
      var collision = collisionList[i];
      var testedLine = false;
      var testedP0 = false;
      var testedP1 = false;
      
      if (collision.collidedLine) {
        testedLine = true;
        var lineTime = solveTimeToDistFromLine(this.player.pos, this.player.vel, this.player.accel, collision.surface, this.player.radius);

        console.log("collision ", i, " collided with line at time: ", lineTime);
        var tempState = this.stepStateByTime(this.player, lineTime);
        console.log("at position ", tempState);

        if (collision.surface.isPointWithinPerpBounds(tempState.pos) && lineTime && lineTime > 0 && lineTime < 200) {   // Ensures that the real collision was with the line and not the points.
          var collisionHeapObj = { time: lineTime, collisionObj: collision.surface, state: tempState };
          collisionHeap.push(collisionHeapObj);

        } else {                // We didnt really collide with the line. Try to add points instead.

          console.log("We got a line collision but not with points, but time analysis says we didnt collide with line. Testing points?");
          testedP0 = true;
          testedP1 = true;
          var point0Time = solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p0, this.player.radius);
          var point1Time = solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p1, this.player.radius);

          if (point0Time && point0Time > 0 && point0Time < 200) {
            console.log("collision ", i, " collided with p0 at time: ", lineTime);
            var tempState0 = this.stepStateByTime(this.player, point0Time);
            console.log("at position ", tempState0);
            var collisionHeapObj = { time: point0Time, collisionObj:  new TerrainPoint(collision.surface.p0, collision.surface), state: tempState0 };
            collisionHeap.push(collisionHeapObj);
          }

          if (point1Time && point1Time > 0 && point1Time < 200) {
            console.log("collision ", i, " collided with p1 at time: ", lineTime);
            var tempState1 = this.stepStateByTime(this.player, point1Time);
            console.log("at position ", tempState1);
            var collisionHeapObj = { time: point1Time, collisionObj: new TerrainPoint(collision.surface.p1, collision.surface), state: tempState1 };
            collisionHeap.push(collisionHeapObj);
          }
        }
      }
      if (collision.collidedP0 && (!testedP0)) {
        var point0Time = solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p0, this.player.radius);

        if (point0Time && point0Time > 0 && point0Time < 200) {
          console.log("collision ", i, " collided with p0 at time: ", lineTime);
          var tempState0 = this.stepStateByTime(this.player, point0Time);
          console.log("at position ", tempState0);
          if (collision.surface.isPointWithinPerpBounds(tempState0.pos)) { // DEBUG TODO PLEASE DONT EVER LET THIS BE CALLED
            throw "fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown";
          }
          var collisionHeapObj = { time: point0Time, collisionObj: new TerrainPoint(collision.surface.p0, collision.surface), state: tempState0 };
          collisionHeap.push(collisionHeapObj);
        } else {

        }
      }
      if (collision.collidedP1 && (!testedP1)) {
        var point1Time = solveTimeToDistFromPoint(this.player.pos, this.player.vel, this.player.accel, collision.surface.p1, this.player.radius);

        if (point1Time && point1Time > 0 && point1Time < 200) {
          console.log("collision ", i, " collided with p1 at time: ", lineTime);
          var tempState1 = this.stepStateByTime(this.player, point1Time);
          console.log("at position ", tempState1);
          if (collision.surface.isPointWithinPerpBounds(tempState1.pos)) { // DEBUG TODO PLEASE DONT EVER LET THIS BE CALLED
            throw "fuck you fuck everything I dont want to write a special case handler here please for the love of God dont ever let this exception get thrown";
          }
          var collisionHeapObj = { time: point1Time, collisionObj: new TerrainPoint(collision.surface.p1, collision.surface), state: tempState1 };
          collisionHeap.push(collisionHeapObj);
        }
      }
    }   // end massive fucking for loop. Holy hell. Now we have a minheap hopefully full of the most recent events.
    
    var earliestCollisions = [collisionHeap.pop()];
    while (collisionHeap.peek().time === earliestCollisions[0].time) {
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
      if (!(contains(earliestCollisions, collisionHeap.peek()))) {
        console.log("not dupe, adding ", collisionHeap.peek());

        earliestCollisions.push(collisionHeap.pop());
      } else {
        console.log("tried adding a dupe, ", collisionHeap.peek());
        collisionHeap.pop();
      }
    } //earliestEvents should now have all the earliest collisions.
    if (earliestCollisions.length > 1) {
      console.log("there might be nothing wrong dunno if I'm handling this but we have more than 1 earliest event.");
    }

    var eventList = this.turnCollisionsIntoEvents(earliestCollisions);
  }





  /**
   * This method takes a list of collisions that occurred at the same time and decides what events need to happen.
   * TODO decide how to handle line and point same time collisions. Go with line for now???
   */
  this.turnCollisionsIntoEvents = function (collisions) {
    var eventList = [];
    
    var terrainLineCollisions = [];
    var terrainPointCollisions = [];
    for (var i = 0; i < collisions.length; i++) {
      if (collisions[i].collisionObj instanceof TerrainLine) {
        terrainLineCollisions.push(collisions[i]);
      } else if (collisions[i].collisionObj instanceof TerrainPoint) {
        terrainPointCollisions.push(collisions[i]);
      } else if (collisions[i].collisionObj instanceof GoalLine) {           //DONE? TODO
        var ge = new GoalEvent(collisions[i].time, collisions[i].collisionObj);
        eventList.push(ge);
      } else if (collisions[i].collisionObj instanceof Collectible) {        //TODO 
        var ce = new CollectibleEvent(collisions[i].time);
        eventList.push(ce);
      }
    }

    //var collisionHeapObj = { time: point1Time, collisionObj: new TerrainPoint(collision.surface.p1, collision.surface), state: tempState1 };
    if (terrainPointCollisions.length > 1) {            // TODO DEBUG REMOVE
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

        var te = new TerrainCollisionEvent(terrainLineCollisions[0].time, collisionSurfaces, terrainLineCollisions[0].state, surfaceVec, combinedNormal);
        eventList.push(te);
      } else {    // JUST ONE TerrainLine collision.      TerrainLine(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec)
        var tlc = terrainLineCollisions[0];
        var te = new TerrainCollisionEvent(tlc.time, [tlc.collisionObj], tlc.state, tlc.collisionObj.getSurfaceAt(tlc.state), tlc.normal);
        eventList.push(te);
      }
    } else if (terrainPointCollisions.length === 1) {   // no TerrainLines, deal with TerrainPoints
      var tpc = terrainPointCollisions[0];
      var vecToState = tpc.state.pos.subtract(tpc.collisionObj);
      console.log("TESTING WHETHER YOU CAN SUBTRACT A THING THAT HAS .x and .y FROM A VEC2");
      console.log("tpc.state.pos: ", tpc.state.pos);
      console.log("tpc.collisionObj: ", tpc.collisionObj);
      console.log("vecToState: ", vecToState);

      var collisionNormal = vecToState.normalize();
      var surfaceVec = collisionNormal.perp();

      var te = new TerrainCollisionEvent(tpc.time, [tpc.collisionObj], tpc.state, surfaceVec, collisionNormal);
      eventList.push(te);
    } else { //nothing???

    }

    return eventList;
  }





  /**
   * Function to pop and return the most recent event. Modify when additional event heaps are added to physics engine.
   * //DONE.
   */
  this.popMostRecentEvent = function () {
    var events = [];
    events.push(eventHeap);
    events.push(predictedEventHeap);
    // events.push (eventHeap.peek());    // FUTURE HEAPS.

    var min = events[0].peek().time;
    var minIndex = 0;
    for (var i = 1; i < events.length; i++) {
      if (min > events[i].peek().time) {
        min = events[i].peek().time;
        minIndex = i;
      }
    }
    return events[minIndex].pop();
  }






}



PhysEng.prototype.update = function(targetTime, newEvents) {
  if (this.eventHeap.size() > 0 && !this.inReplay) {
    throw "why the hell are we starting update with events still in event thing? *grumbles* better ways to implement replays....";	
  }
	
  for(var i = 0; newEvents && i < newEvents.length; i++) {			//Put newEvents into eventHeap.
    this.eventHeap.push(newEvents[i]);
    this.replayData.push(newEvents[i]);
  }
		
  //do {
  //  tempState := attemptStep(goalDeltaTime);
			
  //  if tempState has new events
  //  add tempStates events to eventHeap
			
  //  alter current state to reflect tempState
			
  //  var currentEvent = eventHeap.peek().time;
  //  currentEvent.handle(this);		//case testing verify from the popped events time that this is the time gamestate resulted in.
			
  //} while (!(currentEvent instanceof RenderEvent));
}


PhysEng.prototype.loadReplay = function(inputEventList) {
  this.eventHeap = new MinHeap(inputEventList, function(e1, e2) {
    return e1.time == e2.time ? 0 : e1.time < e2.time ? -1 : 1;
  });
  this.inReplay = true;
}
	
	
	
	
// __________MATH SHIT_________




//GET REFLECTION VECTOR. velVec = vector to get the reflection of. normalVec, the normal of the surface that you're reflecting off of. TODO possibly a bug if velVec isnt normalized for the function and then length remultiplied at the end? P sure this is right but if bounces are buggy start here.
function getReflectionVector(velVec, normalVec) {
  //     v' = 2 * (v . n) * n - v;

  // SINGLE LINE OPTIMIZED
  return (velVec).subtract(normalVec.multf(2.0 * velVec.dot(normalVec)));
  //return normalVec.multf(2.0 * velVec.dot(normalVec)).subtract(velVec);                OLD
}





//TEST REFLECTION
//var toReflect = new vec2(19, 31);   //moving down and right
//var theNormal = new vec2(-1, .5).normalize();    //normal facing straight up
//console.log("reflection ", getReflectionVector(toReflect, theNormal));




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
 * assumes the starting position is at 0.
 */
function solveTimeToPoint1D(targetDist, currentVelocity, acceleration) {
  //var a = acceleration / 2;
  //var b = currentVelocity;
  //var c = distanceToSurfaceEnd;
  if (acceleration === 0) {

    return -targetDist / currentVelocity;

  } else {
    var x = (currentVelocity * currentVelocity) - (2 * acceleration * targetDist);
    var y;
    var z;
    if (x < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("roots are imaginary, not gonna exit surface.");
      console.log("  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);
      return null;
    } else {
      //calculate roots
      //console.log("x: ", x);
      var velNeg = -currentVelocity;
      //console.log("velNeg: ", velNeg);
      var t = Math.sqrt(x);
      //console.log("t: ", t);
      y = (velNeg + t) / (acceleration);  //root 1
      z = (velNeg - t) / (acceleration);  //root 2
      console.log("solveTimeToPoint1D.  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);
      console.log("   possible time distances are ", y, ", ", z);

      return closestPositive(y, z);
    }
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



//CODE TO TEST solveTimeToDistFromLine
console.log("DOING THE THING");
console.log("DOING THE THING");
console.log("DOING THE THING");
console.log("DOING THE THING");
var pos = new vec2(15, 10);
var vel =  new vec2(-13, -5);
var accel = new vec2(4, -10.0000);
var rad = 5;

var t0 = new vec2(-50, 0);
var t1 = new vec2(50, -120);
var n = t1.subtract(t0).perp().normalize();
var ter = new TerrainLine(t0, t1, null, null, null, n);

var test = solveTimeToDistFromLine(pos, vel, accel, ter, rad);




/**
 * Solves the time it will take a ball from curPos to reach the specified distance from the line.
 */
function solveTimeToDistFromLine(curPos, curVel, accel, targetLine, distanceGoal) {
  var rotated = getRotatedToXAround(targetLine.p0, curPos, curVel, accel, targetLine);
  var distance = (rotated.pos.y > 0 ? rotated.pos.y - distanceGoal : rotated.pos.y + distanceGoal);
  var time = solveTimeToPoint1D(distance, rotated.vel.y, rotated.accel.y);
  console.log("Solved time, time at: ", time);
}



function getRotatedToXAround(origin, curPos, curVel, accel, targetLine) {  
  var v01 = targetLine.p1.subtract(targetLine.p0);
  var horiz = new vec2(1, 0);
  var radiansToHorizontal = Math.acos(v01.normalize().dot(horiz));

  radiansToHorizontal *= (v01.y > 0 ? -1.0 : 1.0);
  console.log("radiansToHorizontal: ", radiansToHorizontal);
  console.log("to degrees: ", radiansToHorizontal * 180 / Math.PI);

  var rMat = getRotationMatRad(radiansToHorizontal);

  var newPos = (curPos.subtract(targetLine.p0).multm(rMat));
  console.log("oldPos: ", curPos);
  console.log("newPos: ", newPos);

  
  console.log("newP1: ", v01);

  var newVel = curVel.multm(rMat);
  console.log("newVel: ", newVel);

  var newAccel = accel.multm(rMat);
  console.log("newAccel: ", newAccel);
  var results = { pos: newPos, vel: newVel, accel: newAccel };
  return results;
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
  var toReturn;
  if (value1 < 0) {            // is value1 negative?
    if (value2 < 0) {
      toReturn = null;        // NO VALID ROOT, BOTH ARE BACKWARDS IN TIME
      //console.log("   NO VALID ROOT, BOTH ARE BACKWARDS IN TIME, v1: ", value1, ", v2: ", value2);
    } else {
      toReturn = value2;           // value1 < 0 and value2 > 0 return value2
      //console.log("   value1 < 0 and value2 > 0 return value2, v1: ", value1, ", v2: ", value2);
    }
  } else if (value2 < 0) {     // is value2 negative? we know value1 is positive.
    toReturn = value1;             // value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1
    //console.log("   value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1, v1: ", value1, ", v2: ", value2);
  } else if (value1 > value2) {     // value1 and value2 are both positive, return the smaller one
    toReturn = value2;             // value2 occurs earlier
    //console.log("   value1 and value2 are both positive, return the smaller one. value2 occurs earlier, v1: ", value1, ", v2: ", value2);
  } else {
    toReturn = value1;             // value1 occurs earlier
    //console.log("   value1 and value2 are both positive, return the smaller one. value1 occurs earlier, v1: ", value1, ", v2: ", value2);
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




















/*
OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  OLD.  __  
*/







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
var DFLT_jumpVelNormPulse = 2000;
var DFLT_doubleJumpVelYPulse = 2000;
var DFLT_doubleJumpVelYMin = 2000;

// OTHER CHAR DEFAULTS
var DFLT_numAirCharges = 1;
var DFLT_radius = 1920 / 32;

// CONST RATIOS
var DFLT_jumpSurfaceSpeedLossRatio = 0.7;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 
var DFLT_bounceSpeedLossRatio = 0.9;



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


/*
TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ TO TOP _____ 
*/
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