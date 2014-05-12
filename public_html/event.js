

//this.surface = surfaceOrNull;   // what surface is the player on?
//this.locked = false;     // is the player locked to the ground?


//this.roundingPoint = false;
//this.pointBeingRounded = null;
//this.angleAroundPoint = 0.0;   //RADIANS OR DEGREES I HAVE NO IDEA
//this.rotationDirection = false; // TRUE IF CLOCKWISE, FALSE IF COUNTER-CLOCKWISE.



//this.animationFacing = "left";          // "left" or "right" or "neutral"
//this.animationWalking = false;         // is the player in the walking state?
//this.animationRunning = false;         // is the player in the running state?
//this.animationBoosting = false;         // is the player in the boost state?
//this.animationBoosting = false;         // is the player in the boost state?
//this.animationgroundJumping = false;    // is the player jumping from the ground?
//this.animationDoubleJumping = false;    // is the player air jumping?
//this.animationColliding = false;        // is the player in the collision animation?
//this.animationFreefall = false;         // is the player in the Freefall animation?

//this.animationTimeInCurrentAnimation = 0.0;   // what amount of time in seconds have we been in this animation state?
//this.animationStartTime = 0.0;
//this.animationAngleOfAnimation = 0.0;         // DO WE WANT THIS IN DEGREES OR RADIANS?
//this.animationSpeed = 0.0;                    // The player speed. Used for walking / running animations.

////END ANIMATION FIELDS

//this.controlParameters = controlParams;
//this.physParameters = physParameters;
//this.inputState = new InputState();

//// PLAYER STATE
//this.surfaceOn = surfaceOrNull;   // what surface is the player on?
//this.onGround = true;     // is the player on a surface?
//this.gLocked = false;     // is the player locked to the ground?


//this.roundingPoint = false;
//this.pointBeingRounded = null;
//this.angleAroundPoint = 0.0;   //RADIANS OR DEGREES I HAVE NO IDEA
//this.rotationDirection = false; // TRUE IF CLOCKWISE, FALSE IF COUNTER-CLOCKWISE.

//this.airChargeCount = controlParams.numAirCharges; //number of boosts / double jumps left.

//this.updateToState = function (state) 
//this.leaveGround = function () { // TODO write code to handle leaving the ground here.
//this.updateVecs = function (inputState) {
//this.updateVecsGround = function (inputState) {  // DONE? TEST
//this.updateVecsAir = function (inputState) 



// Event class. All events interpreted by the physics engine must extend this, as seen below. 
// Currently input and render events exist. Physics events will probably follow shortly (for example, when the player passes from one terrain line to another, etc).
function Event(eventTime) {    //eventTime is the gameTime that the event occurs at.
  this.time = eventTime;
}

Event.prototype.handler = function (physEng) {   // NEEDS TO BE OVERRIDDEN IN CHILDREN CLASSES
  throw "this abstract function should never call.";
};



// InputEvent class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEvent(browserTime, pressed, eventTime) {   //
  Event.apply(this, [eventTime])
  this.pressed = pressed;       // PRESSED DOWN OR RELEASED
  this.browserTime = browserTime;
}

InputEvent.prototype = new Event();
InputEvent.prototype.constructor = InputEvent;
InputEvent.prototype.handler = function (physEng) {          //THIS IS THE PARENT CLASS FOR INPUT CHANGE CODE.
  throw "this abstract function should never call.";
}



// InputEventRight class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventRight(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES. SHOULD BE DONE.
    //console.log("Handling input right event. pressed = ", this.pressed);
    var curInputState = physEng.player.inputState;
    if (this.pressed && (!curInputState.right)) {  // Input was just pressed down.
      curInputState.right = true;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      }
    } else if ((!this.pressed) && (curInputState.right)) {            // Input was just released.
      curInputState.right = false;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      } 
    } else {
      console.log("we reached a state where a right input was illogically pressed or released.");
    }
  }
}
InputEventRight.prototype = new InputEvent();
//InputEventRight.prototype.constructor = InputEventRight;




// InputEventLeft class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventLeft(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  SHOULD BE DONE.
    //console.log("Handling input left event. pressed = ", this.pressed);
    var curInputState = physEng.player.inputState;
    if (this.pressed && (!curInputState.left)) {  // Input was just pressed down.
      curInputState.left = true;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      }
    } else if (!this.pressed && (curInputState.left)) {            // Input was just released.
      curInputState.left = false;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      } 
    } else {
      console.log("we reached a state where a left input was illogically pressed or released.");
    }
  }
}
InputEventLeft.prototype = new InputEvent();
//InputEventLeft.prototype.constructor = InputEventLeft;



// InputEventUp class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventUp(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.    SHOULD BE DONE.
    //console.log("Handling input up event. pressed = ", this.pressed);
    var curInputState = physEng.player.inputState;
    if (this.pressed && (!curInputState.up)) {  // Input was just pressed down.
      curInputState.up = true;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      }
    } else if (!this.pressed && (curInputState.up)) {            // Input was just released.
      curInputState.up = false;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      }
    } else {
      console.log("we reached a state where an up input was illogically pressed or released.");
    }
  }
}
InputEventUp.prototype = new InputEvent();
//InputEventUp.prototype.constructor = InputEventUp;




// InputEventDown class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventDown(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.    SHOULD BE DONE.
    //console.log("Handling input down event. pressed = ", this.pressed);
    var curInputState = physEng.player.inputState;
    if (this.pressed && (!curInputState.down)) {  // Input was just pressed down.
      curInputState.down = true;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      }
    } else if (!this.pressed && (curInputState.down)) {            // Input was just released.
      curInputState.down = false;
      if (!dashing) {
        physEng.player.updateVecs(curInputState);
      }
    } else {
      console.log("we reached a state where a down input was illogically pressed or released.");
    }
  }
}
InputEventDown.prototype = new InputEvent();
//InputEventDown.prototype.constructor = InputEventDown;




// InputEventJump class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventJump(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES. 
    //console.log("Handling input jump event. pressed = ", this.pressed);
    if (pressed) {
      var input = physEng.player.inputState;
      input.jump = true;
      var p = physEng.player;

      if (p.surface) {  //handle jumping from a surface
        p.jump();
        physEng.player.updateVecs(input);
      } else if (p.airchargeCount > 0) {          //handle jumping in the air
        p.doubleJump();
        physEng.player.updateVecs(input);
      } else { //cant jump right now, TODO BUFFER JUMP

      }

    } else {  //BUTTON WAS RELEASED.
      //TODO HANDLE HOW LONG BUTTON WAS HELD FOR. WILL NEED TO HAVE DELAY ON WHEN JUMP STARTS.
      input.jump = false;
    }
  }
}
InputEventJump.prototype = new InputEvent();
//InputEventJump.prototype.constructor = InputEventJump;





// InputEventBoost class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventBoost(browserTime, pressed, eventTime) {   //TODO
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  
    //console.log("Handling input boost event. pressed = ", this.pressed);
    var curInputState = physEng.player.inputState;                       // TODO HANDLE BOOST
    //if (this.pressed && (!curInputState.boost)) {  // Input was just pressed down.
    //  curInputState.boost = true;
    //  physEng.accelState.update();
    //} else if (!this.pressed && (curInputState.boost)) {            // Input was just released.
    //  curInputState.boost = false;
    //  physEng.accelState.update();
    //}
    physEng.player.updateVecs(curInputState);
  }
}
InputEventBoost.prototype = new InputEvent();
//InputEventBoost.prototype.constructor = InputEventBoost;






// InputEventLock class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventLock(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES LOCK CHANGES.  TODO DONE????
    //console.log("Handling input lock event. pressed = ", this.pressed);
    var curInputState = physEng.player.inputState;
    if (this.pressed && (!curInputState.lock)) {  // Input was just pressed down.
      curInputState.lock = true;
      if (physEng.player.surface) {
        physEng.player.locked = true;
      }
      //physEng.accelState.update();                              // TODO MOST LIKELY UNNECESSARY BUT MAY BE NEEDED LATER???
    } else if (!this.pressed && (curInputState.lock)) { // Input was just released.
      if (physEng.player.locked) {
        curInputState.lock = false;
        physEng.player.locked = false;
        physEng.player.updateVecs(curInputState);
      }
    } else {
      console.log("we reached a state where a lock input was illogically pressed or released.");
    }
  }
}
InputEventLock.prototype = new InputEvent();
//InputEventLock.prototype.constructor = InputEventLock;







// PauseEvent class for pausing the physics engine.
function PauseEvent(eventTime) {   //takes browser time.
  Event.apply(this, [eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  TODO handle later, who needs pausing anyway?
    if (physEng.isPaused) {  // DEBUG TODO REMOVE
      throw "already paused";
    }
    physEng.pause();

    //CODE TO ORIGINALLY HANDLE WHEN IT WAS AN INPUT EVENT.
    //var curInputState = physEng.inputState;

    //if (!physEng.isPaused) {
    //  //not paused
    //  if (this.pressed) {// pause
    //    curInputState.pauseIgnoreRelease = true;
    //      physEng.pause(true);
    //  } else { // 
    //    throw "should never get here";
    //  }
    //} else {
    //  //paused
    //  if (this.pressed) {// do nothing
    //    curInputState.pauseIgnoreRelease = false;
    //  } else if (!curInputState.pauseIgnoreRelease) { // unpause
    //    physEng.pause(false);
    //  } else {                                      // released after a pause.

    //  }
    //}
  }
}
PauseEvent.prototype = new Event();
//PauseEvent.prototype.constructor = PauseEvent;




// UnpauseEvent class for unpausing the physics engine. 
function UnpauseEvent(eventTime) {   //takes browser time.
  Event.apply(this, [eventTime]);

  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  TODO handle later, who needs pausing anyway?
    if (!physEng.isPaused) {//DEBUG TODO REMOVE
      throw "trying to unpause when physEng is already unpaused";
    }
    physEng.unpause(this.time);
  }
}
UnpauseEvent.prototype = new Event();
//UnpauseEvent.prototype.constructor = UnpauseEvent;







// Event class for the Collectible Event when the player runs into a collectible. 
function CollectibleEvent(eventTime) { // eventTime is gameTime at which the event occurs.
  Event.apply(this, [eventTime])

  this.handler = function (physEng) {
    return;     //TODO IMPLEMENT
  }
}
CollectibleEvent.prototype = new Event();
//CollectibleEvent.prototype.constructor = CollectibleEvent;






// Abstract event class for the Collision Event when the player runs into a Level element. 
function CollisionEvent(gameTimeOfCollision, collidedWithList, stateAtCollision) {
  Event.apply(this, [gameTimeOfCollision])
  
  this.collidedWithList = collidedWithList;
  this.state = stateAtCollision;
}
CollisionEvent.prototype = new Event();
CollisionEvent.handler = function (physEng) {
  throw "Abstract function should never be called.";
}
//CollisionEvent.prototype.constructor = CollisionEvent;






// Event class for the TerrainCollision Event when the player runs into a TerrainLine. 
function TerrainCollisionEvent(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec, allowAuto) {
  CollisionEvent.apply(this, [gameTimeOfCollision, collidedWithList, stateAtCollision]);
  //this.time
  //this.collidedWithList = collidedWithList;
  //this.state = stateAtCollision;
  this.surfaceVec = surfaceVec;
  this.normalVec = normalVec;
  this.allowAuto = allowAuto;



  this.handler = function (physEng) {
    var p = physEng.player;
    var input = p.inputState;

    var normalBallVel = p.vel.normalize();
    var angleToNormal;
    var collisionVec;
    //if (stuffWeCollidedWith.length > 1) {
    console.log("radius = ", p.radius);
    collisionVec = this.normalVec;


    var COLLISION_GLANCING_ENOUGH_TO_AUTO_LOCK = allowAuto;
    if (projectVec2(p.vel, this.normalVec).length() < p.physParameters.autoLockThreshold) {

    }
    if (COLLISION_GLANCING_ENOUGH_TO_AUTO_LOCK) {
      console.log("auto locked!?!?");
      var surfaceVecNorm = collisionVecNorm.perp();      //TODO OHGOD REFACTOR TO THIS METHOD TAKING A COLLISION OBJECT THAT STORES NORMALS AND THE SINGLE SURFACE TO LOCK TO
      var surfaceAngle = surfaceVecNorm.dot(normalBallVel);

      //var velocityMag = ballState.vel.length();                     // DISABLED FOR REALISTIC PHYSICS
      //var surfaceInvertAngle = surfaceVec.negate().dot(normalBallVel);

      //if (surfaceAngle > surfaceInvertAngle) {
      //  surfaceVec = surfaceVec.negate();
      //}
      //this.player.vel = surfaceVec.multf(velocityMag);              // END DISABLED FOR REALISTIC PHYSICS

      this.player.pos = this.state.pos;
      this.player.vel = projectVec2(this.state.vel, surfaceVecNorm);
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
      this.player.vel = projectVec2(this.state.vel, surfaceVecNorm);                                             // TODO DOES NOT TAKE INTO ACCOUNT TOUCHING THE END OF A LINE.
      // REALISTIC ADDITIONS END
      this.player.pos = this.state.pos;
      this.player.airBorne = false;
      this.player.surfaceLocked = inputState.lock;
      this.player.surfaceOn = this.collidedWithList[0]; // TODO REFACTOR TO USE NEW COLLISION OBJECT


      // BOUNCE. TODO implement addition of normalVector * jumpVel to allow jump being held to bounce him higher?   perhaps just buffer jump events.      
    } else {
      //console.log(collisionVec.normalize());
      this.player.vel = getReflectionVector(normalBallVel, this.collidedWithList[0].getNormalAt(this.state.pos, this.state.radius)).multf(this.state.vel.length() * DFLT_bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT
      //this.player.vel = getReflectionVector(ballState.vel, collisionVec.normalize()).multf(DFLT_bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT          // COLLISIONVEC AVERAGE VERSION
      this.player.pos = this.state.pos;
      this.player.airBorne = true;
      //this.player.surfaceOn = null;      //TODO remove. This shouldnt be necessary as should be set when a player leaves a surface.
    }
    this.player.timeDelta = this.state.timeDelta;
  }
}
TerrainCollisionEvent.prototype = new CollisionEvent();
//TerrainCollisionEvent.prototype.constructor = TerrainCollisionEvent;









// Event class for the Goal Event. TODO IMPLEMENT, NEEDS TO STORE WHICH GOAL AND ANY OTHER RELEVENT VICTORY INFORMATION.
function GoalEvent(eventTime, goalObject) { // eventTime is gameTime at which the event occurs.
  Event.apply(this, [eventTime])

  this.goalObject = goalObject;

  this.handler = function (physEng) {
    var p = physEng.player;
    p.completionState = new CompletionState(p, this.time, new State(p.time, p.radius, p.pos, p.vel, p.accel), goalObject.goalNumber, p.replay);
  }
}
GoalEvent.prototype = new Event();
//GoalEvent.prototype.constructor = GoalEvent;





// Event class for the render event. One of these should be the last event in the eventList array passed to update. NOT STORED IN REPLAYS.
function RenderEvent(browserTime, pressed, eventTime) {   //
  Event.apply(this, [eventTime])

  this.handler = function (physEng) {
    return;
  }
}
RenderEvent.prototype = new Event();
//RenderEvent.prototype.constructor = RenderEvent;





// Event class for the ReplaySync event. STORED IN REPLAYS, used to ensure float rounding differences from same calcs at different times doesnt desync replays.
function ReplaySyncEvent(eventTime, state) {  // eventTime is gameTime at which the render occurs.  TODO IMPLEMENT SO THAT THIS WILL OVERRIDE ANYTHING AT THE SAME TIME IN THE LIST.
  Event.apply(this, [eventTime])
  if (eventTime !== state.time) {
    throw "ReplaySyncEvent time and its states time dont match";
  }
  this.state = new State(eventTime, state.radius, state.pos, state.vel, state.accel);

  this.handler = function (physEng, playerModel) {
    playerModel.updateToState(this.state);
    //TODO UPDATE PHYSENG TO THE RIGHT HEAP VALUES.
  }
}
RenderEvent.prototype = new Event();
//RenderEvent.prototype.constructor = RenderEvent;







/* Predicted Events class. Not stored in replays. These are calculated by physics engine automatically.
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function PredictedEvent(predictedTime, dependencyMask) {  
  Event.apply(this, [predictedTime])
  this.dependencyMask = dependencyMask;    
}
PredictedEvent.prototype = new Event();
PredictedEvent.prototype.constructor = PredictedEvent;
PredictedEvent.prototype.handler = function (physEng) {          //THIS IS THE PARENT CLASS FOR INPUT CHANGE CODE.
  throw "this abstract function should never call.";
}




/* Event class for the predicted time the player will roll to the end of a line and reach its corner. 
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function SurfaceEndEvent(predictedTime, dependencyMask) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask])

  this.handler = function (physEng) {

    //PLAYER FIELDS TO USE
    //player.roundingPoint = false;
    //player.pointBeingRounded = null;
    //player.angleAroundPoint = 0.0;   //RADIANS OR DEGREES I HAVE NO IDEA
    //player.rotationDirection = false; // TRUE IF CLOCKWISE, FALSE IF COUNTER-CLOCKWISE.
    return;
  }
}
SurfaceEndEvent.prototype = new PredictedEvent();
//SurfaceEndEvent.prototype.constructor = SurfaceEndEvent;




/* Event class for the EndCornerArcEvent predicted when a locked ball completes a corner and continues locked on the next surface.
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function EndCornerArcEvent(nextSurface, predictedTime, dependencyMask) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask])
  this.nextSurface = nextSurface;
  this.handler = function (physEng) {
    return;                               //TODO
  }
}
EndCornerArcEvent.prototype = new PredictedEvent();
//EndCornerArcEvent.prototype.constructor = EndCornerArcEvent;




/* Event class for the DragTableEvent
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function DragTableEvent(predictedTime, dependencyMask, upOrDown) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask])

  this.handler = function (physEng) {
    return;                               //TODO
  }
}
DragTableEvent.prototype = new PredictedEvent();
//DragTableEvent.prototype.constructor = DragTableEvent;




///* Event class for the   PREDICTED EVENT TEMPLATE
// * @param predictedTime     the gametime at which the event will occur.
// * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
// */
//function xEvent(predictedTime, dependencyMask) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
//  PredictedEvent.apply(this, [predictedTime, dependencyMask])

//  this.handler = function (physEng) {
//    return;                               //TODO
//  }
//}
//xEvent.prototype = new PredictedEvent();
////xEvent.prototype.constructor = xEvent;











/* EXAMPLE INHERITANCE
function AbstractChildClass(abstractChildParam1, abstractChildParam2, ....etc) {           //EXTENDS ParentClass
  ParentClass.apply(this, [parentParam1, parentParam2, ....etc]);
}
AbstractChildClass.prototype = new ParentClass();
AbstractChildClass.prototype.constructor = AbstractChild;
AbstractChildClass.prototype.method1 = function () {};


function ChildClass(childParam1, childParam2, ....etc) {            //EXTENDS AbstractChildClass
  AbstractChildClass.apply(this, [abstractChildParam1, abstractChildParam2, ....etc]);

  ChildClass.prototype.method1 = function () {            //OVERRIDES THE METHOD THATS IN AbstractChildClass's PROTOTYPE.
  };
}
ChildClass.prototype = new AbstractChildClass();
ChildClass.prototype.constructor = ChildClass;
*/