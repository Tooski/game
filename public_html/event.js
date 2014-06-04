
/**
 * event.js
 * Contains all of the key physics events that make up the game engine.
 *
 * Author Travis Drake
 * All rights reserved.
 */



//FUCKING EVENT TYPE BITMASK VALUES BECAUSE JAVASCRIPT INHERITANCE DOESNT EXIST GG I GIVE UP NOT FUCKING DEALING WITH THIS SHIT ANYMORE FUCK IT ALLL
//ALSO SERVES TO PRIORITIZE EVENTS RECIEVED AT THE SAME TIME. THE LOWER THE EVENT ON THIS LIST, THE HIGHER THE PRIORITY.
var E_NEXT_BIT = 1;
var E_EVENT_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

//LOWEST PRIORITY, HANDLED LAST.           
var E_RENDER_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_PAUSE_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_COLLISION_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_LINE_COLLISION_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_POINT_COLLISION_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_PREDICTED_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_SYNC_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_BROWSER_TIME_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_REPLAY_EVENT_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;




var E_INPUT_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_COLLECTIBLE_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;

var E_GOAL_MASK = E_NEXT_BIT;
E_NEXT_BIT *= 2;







// Event class. All events interpreted by the physics engine must extend this, as seen below. 
// Currently input and render events exist. Physics events will probably follow shortly (for example, when the player passes from one terrain line to another, etc).
function Event(eventTime) {    //eventTime is the gameTime that the event occurs at.
  this.time = eventTime;
  this.mask = 0;
}

Event.prototype.handler = function (physEng) {   // NEEDS TO BE OVERRIDDEN IN CHILDREN CLASSES
  throw "this abstract function should never call.";
};











// Event class for the Goal Event. TODO IMPLEMENT, NEEDS TO STORE WHICH GOAL AND ANY OTHER RELEVENT VICTORY INFORMATION.
function GoalEvent(eventTime, goalObject) { // eventTime is gameTime at which the event occurs.
  Event.apply(this, [eventTime])
  this.mask += E_GOAL_MASK;

  this.goalObject = goalObject;

  this.handler = function (physEng) {
    var p = physEng.player;
    p.completionState = new CompletionState(p, this.time, new State(p.time, p.radius, p.pos, p.vel, p.accel), this.goalObject.goalNumber, p.replay);
  }
}
GoalEvent.prototype = new Event();
//GoalEvent.prototype.constructor = GoalEvent;





// Event class for the render event. One of these should be the last event in the eventList array passed to update. NOT STORED IN REPLAYS.
function RenderEvent(browserTime, eventTime) {   //
  Event.apply(this, [eventTime])
  this.mask += E_RENDER_MASK;
  this.mask += E_BROWSER_TIME_MASK;

  this.validTime = eventTime >= 0 ? true : false;
  this.browserTime = browserTime;

  this.handler = function (physEng) {
    var p = physEng.player;
    return true;
  }
}
RenderEvent.prototype = new Event();
//RenderEvent.prototype.constructor = RenderEvent;





// Event class for the ReplaySync event. STORED IN REPLAYS, used to ensure float rounding differences from same calcs at different times doesnt desync replays.
function ReplaySyncEvent(eventTime, state) {  // eventTime is gameTime at which the render occurs.  TODO IMPLEMENT SO THAT THIS WILL OVERRIDE ANYTHING AT THE SAME TIME IN THE LIST.
  Event.apply(this, [eventTime])
  this.mask += E_SYNC_MASK;

  if (eventTime !== state.time) {
    throw "ReplaySyncEvent time and its states time dont match";
  }
  this.state = new State(eventTime, state.radius, state.pos, state.vel, state.accel);

  this.handler = function (p) {
    p.updateToState(this.state);
    //TODO UPDATE PHYSENG TO THE RIGHT HEAP VALUES.
  }
}
ReplaySyncEvent.prototype = new Event();
//ReplaySyncEvent.prototype.constructor = ReplaySyncEvent;







/* Predicted Events class. Not stored in replays. These are calculated by physics engine automatically.
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function PredictedEvent(predictedTime, dependencyMask) {
  Event.apply(this, [predictedTime])
  this.mask += E_PREDICTED_MASK;

  this.dependencyMask = dependencyMask;
}
PredictedEvent.prototype = new Event();
PredictedEvent.prototype.constructor = PredictedEvent;
PredictedEvent.prototype.handler = function (physEng) {          //THIS IS THE PARENT CLASS FOR INPUT CHANGE CODE.
  throw "this abstract function should never call.";
}






// InputEvent class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEvent(browserTime, pressed, eventTime) {   //
  Event.apply(this, [eventTime])
  this.mask += E_INPUT_MASK;
  this.mask += E_REPLAY_EVENT_MASK;
  if (browserTime) {
    this.mask += E_BROWSER_TIME_MASK;
  }

  this.validTime = eventTime >= 0 ? true : false;

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
    var p = physEng.player;
    //console.log("Handling input right event. pressed = ", this.pressed);
    var curInputState = p.inputState;
    if (this.pressed && (!curInputState.right)) {  // Input was just pressed down.
      curInputState.right = true;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      }
    } else if ((!this.pressed) && (curInputState.right)) {            // Input was just released.
      curInputState.right = false;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      } 
    } else {
      console.log("we reached a state where a right input was illogically pressed or released.");
    }
    physEng.updatePredicted();
  }
}
InputEventRight.prototype = new InputEvent();
//InputEventRight.prototype.constructor = InputEventRight;




// InputEventLeft class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventLeft(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  SHOULD BE DONE.
    var p = physEng.player;
    //console.log("Handling input left event. pressed = ", this.pressed);
    var curInputState = p.inputState;
    if (this.pressed && (!curInputState.left)) {  // Input was just pressed down.
      curInputState.left = true;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      }
    } else if (!this.pressed && (curInputState.left)) {            // Input was just released.
      curInputState.left = false;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      } 
    } else {
      console.log("we reached a state where a left input was illogically pressed or released.");
    }
    physEng.updatePredicted();
  }
}
InputEventLeft.prototype = new InputEvent();
//InputEventLeft.prototype.constructor = InputEventLeft;



// InputEventUp class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventUp(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.    SHOULD BE DONE.
    var p = physEng.player;
    //console.log("Handling input up event. pressed = ", this.pressed);
    var curInputState = p.inputState;
    if (this.pressed && (!curInputState.up)) {  // Input was just pressed down.
      curInputState.up = true;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      }
    } else if (!this.pressed && (curInputState.up)) {            // Input was just released.
      curInputState.up = false;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      }
    } else {
      console.log("we reached a state where an up input was illogically pressed or released.");
    }
    physEng.updatePredicted();
  }
}
InputEventUp.prototype = new InputEvent();
//InputEventUp.prototype.constructor = InputEventUp;




// InputEventDown class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventDown(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.    SHOULD BE DONE.
    var p = physEng.player;
    //console.log("Handling input down event. pressed = ", this.pressed);
    var curInputState = p.inputState;
    if (this.pressed && (!curInputState.down)) {  // Input was just pressed down.
      curInputState.down = true;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      }
    } else if (!this.pressed && (curInputState.down)) {            // Input was just released.
      curInputState.down = false;
      if (!p.dashing) {
        p.updateVecs(curInputState);
      }
    } else {
      console.log("we reached a state where a down input was illogically pressed or released.");
    }
    physEng.updatePredicted();
  }
}
InputEventDown.prototype = new InputEvent();
//InputEventDown.prototype.constructor = InputEventDown;




// InputEventJump class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventJump(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES. 
    var p = physEng.player;
    var input = p.inputState;
    //console.log("Handling input jump event. pressed = ", this.pressed);
    if (pressed) {
      input.jump = true;

      if (p.onSurface) {  //handle jumping from a surface
        p.jump();
        console.log("ground jumping", this);
        p.updateVecs(input);
        physEng.updatePredicted();
      } else if (p.airChargeCount > 0) {          //handle jumping in the air
        p.doubleJump();
        console.log("doubleJumping", this);
        p.updateVecs(input);
        physEng.updatePredicted();
      } else { //cant jump right now, TODO BUFFER JUMP
        console.log("airchargeCount: ", p.airChargeCount);
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
    var p = physEng.player;
    //console.log("Handling input boost event. pressed = ", this.pressed);
    var curInputState = p.inputState;                       // TODO HANDLE BOOST
    //if (this.pressed && (!curInputState.boost)) {  // Input was just pressed down.
    //  curInputState.boost = true;
    //  physEng.accelState.update();
    //} else if (!this.pressed && (curInputState.boost)) {            // Input was just released.
    //  curInputState.boost = false;
    //  physEng.accelState.update();
    //}
    p.updateVecs(curInputState);
    physEng.updatePredicted();
  }
}
InputEventBoost.prototype = new InputEvent();
//InputEventBoost.prototype.constructor = InputEventBoost;






// InputEventLock class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventLock(browserTime, pressed, eventTime) {   //
  InputEvent.apply(this, [browserTime, pressed, eventTime]);
  this.handler = function (physEng) {          //THIS CODE HANDLES LOCK CHANGES.  TODO DONE????
    var p = physEng.player;
    //console.log("Handling input lock event. pressed = ", this.pressed);
    var curInputState = p.inputState;
    if (this.pressed && (!curInputState.lock)) {  // Input was just pressed down.
      curInputState.lock = true;
      if (p.onSurface) {
        p.locked = true;
      }
      //physEng.accelState.update();                              // TODO MOST LIKELY UNNECESSARY BUT MAY BE NEEDED LATER???
    } else if (!this.pressed && (curInputState.lock)) { // Input was just released.
      curInputState.lock = false;
      if (p.locked) {
        p.locked = false;
        p.updateVecs(curInputState);
      }
    } else {
      console.log("we reached a state where a lock input was illogically pressed or released.");
    }
    physEng.updatePredicted();
  }
}
InputEventLock.prototype = new InputEvent();
//InputEventLock.prototype.constructor = InputEventLock;







// PauseEvent class for pausing the physics engine.
function PauseEvent(browserTime, eventTime) {   //takes browser time.
  Event.apply(this, [eventTime]);
  this.mask += E_PAUSE_MASK;
  this.mask += E_BROWSER_TIME_MASK;

  this.browserTime = browserTime;

  this.validTime = eventTime >= 0 ? true : false;
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  
    var p = physEng.player;
    if (physEng.isPaused) {  // DEBUG TODO REMOVE
      throw "already paused";
    }
    physEng.pause();


  }
}
PauseEvent.prototype = new Event();
//PauseEvent.prototype.constructor = PauseEvent;




// UnpauseEvent class for unpausing the physics engine. 
function UnpauseEvent(browserTime, eventTime) {   //takes browser time.
  Event.apply(this, [eventTime]);
  this.mask += E_PAUSE_MASK;
  this.mask += E_BROWSER_TIME_MASK;

  this.browserTime = browserTime;

  this.validTime = eventTime >= 0 ? true : false;

  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES. 
    var p = physEng.player;
    if (!physEng.isPaused) {//DEBUG TODO REMOVE
      throw "trying to unpause when physEng is already unpaused";
    }
    physEng.unpause(this.browserTime);
  }
}
UnpauseEvent.prototype = new Event();
//UnpauseEvent.prototype.constructor = UnpauseEvent;


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






// Event class for the Collectible Event when the player runs into a collectible. 
function CollectibleEvent(eventTime) { // eventTime is gameTime at which the event occurs.
  Event.apply(this, [eventTime])
  this.mask += E_COLLECTIBLE_MASK;

  this.handler = function (physEng) {
    var p = physEng.player;
    physEng.updatePredicted();
    return;     //TODO IMPLEMENT
  }
}
CollectibleEvent.prototype = new Event();
//CollectibleEvent.prototype.constructor = CollectibleEvent;






// Abstract event class for the Collision Event when the player runs into a Level element. 
function CollisionEvent(gameTimeOfCollision, stateAtCollision) {
  Event.apply(this, [gameTimeOfCollision])
  this.mask += E_COLLISION_MASK;

  this.state = stateAtCollision;
}
CollisionEvent.prototype = new Event();
CollisionEvent.handler = function (physEng) {
  throw "Abstract function should never be called.";
}
//CollisionEvent.prototype.constructor = CollisionEvent;






// Checkpoint event.
function CheckpointEvent(gameTimeOfCollision, stateAtCollision, checkpoint, checkpointLines) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  this.mask += E_CHECKPOINT_MASK;
  this.checkpoint = checkpoint;
  this.lines = checkpointLines;
  this.state = stateAtCollision;
}
CheckpointEvent.prototype = new CollisionEvent();
CheckpointEvent.handler = function (physEng) {
  var that = this;
  physEng.player.reachedCheckpoints.push(this.checkpoint);
  this.lines.forEach(function (cpl) {
    physEng.player.reachedCheckpointLines.push(cpl);
  });
  physEng.player.lastCheckpoint = this.checkpoint;
}
//CheckpointEvent.prototype.constructor = CheckpointEvent;






// Death event.
function DeathEvent(gameTimeOfCollision, stateAtCollision, deathZone) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  this.mask += E_DEATH_MASK;
  this.deathZone = deathZone;
  this.state = stateAtCollision;
}
DeathEvent.prototype = new CollisionEvent();
DeathEvent.handler = function (physEng) {
  var that = this;
  physEng.player.respawn();
  physEng.player.numDeaths++;
}
//DeathEvent.prototype.constructor = DeathEvent;






// GoalEvent event.
function GoalEvent(gameTimeOfCollision, stateAtCollision, goal) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  this.mask += E_GOAL_MASK;
  this.goal = goal;
  this.state = stateAtCollision;
}
GoalEvent.prototype = new CollisionEvent();
GoalEvent.handler = function (physEng) {
  var that = this;
  physEng.player.respawn();
  physEng.player.numDeaths++;
}
//DeathEvent.prototype.constructor = DeathEvent;






// Collectible event.
function CollectibleEvent(gameTimeOfCollision, stateAtCollision, collectible) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  this.mask += E_COLLECTIBLE_MASK;
  this.collectible = collectible;
  this.state = stateAtCollision;
}
CollectibleEvent.prototype = new CollisionEvent();
CollectibleEvent.handler = function (physEng) {
  var that = this;
  physEng.player.alreadyCollected.push(this.collectible);
  physEng.tm.collected.push(this.collectible);
  physEng.player.score += this.collectible.pointValue;
}
//CollectibleEvent.prototype.constructor = CollectibleEvent;






/**
 * Event class for the TerrainLineCollision Event when the player runs into a TerrainLine from the air. 
 */
function TerrainLineCollisionEvent(gameTimeOfCollision, line, stateAtCollision, allowLock) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  if (!((gameTimeOfCollision || gameTimeOfCollision === 0) &&
        (line) &&
        (stateAtCollision) &&
        (allowLock === true || allowLock === false))) {
    console.log(gameTimeOfCollision, line, stateAtCollision, allowLock);
    throw "missing params.";
  }
  console.log(" ");
  console.log(" ");
  console.log(">>>> TerrainLineCollisionEvent constructor, state at collision: ");
  stateAtCollision.print(">>>> ");

  //DEBUG_DRAW_BROWN.push(new DebugCircle(stateAtCollision.pos, stateAtCollision.radius, 5));
  this.mask += E_LINE_COLLISION_MASK;
  //this.time
  //this.state = stateAtCollision;
  this.line = line;
  this.allowLock = allowLock;
  this.surfaceVec = line.p0.subtract(line.p1);


  this.handler = function (physEng) {
    console.group();
    var p = physEng.player;
    var input = p.inputState;

    var normalBallVel = p.vel.normalize();
    var collisionVec = this.line.normal;




    var collisionVecNorm = collisionVec.normalize();
    //console.log(this.normalVec);
    var collisionForceVec = projectVec2(p.vel, collisionVecNorm);
    var collisionForceVecLen = collisionForceVec.length();


    if (this.allowLock && collisionForceVecLen < p.physParams.autoLockThreshold) {
      console.log(">>>> TerrainLineCollisionEvent auto locked!?!?");
      var surfaceVecNorm = collisionVecNorm.perp();  

      var surface = this.line;

      //var velocityMag = ballState.vel.length();                     // DISABLED FOR REALISTIC PHYSICS
      //var surfaceInvertAngle = surfaceVec.negate().dot(normalBallVel);

      //if (surfaceAngle > surfaceInvertAngle) {
      //  surfaceVec = surfaceVec.negate();
      //}
      //this.player.vel = surfaceVec.multf(velocityMag);              // END DISABLED FOR REALISTIC PHYSICS
      console.log(">>>> Line: ", line);
      p.lockTo(surface, this.surfaceVec.normalize());

      animationSetPlayerRunning(p, this.time);
    } else if (input.lock && this.allowLock && collisionForceVecLen < p.physParams.lockThreshold) {
      // IF PLAYER IS HOLDING LOCK, ATTEMPT TO LOCK IF WITHIN BOUNDARIES! TODO IS THE NEGATIVE LOCK_MIN_ANGLE CHECK NEEDED!!!?
      console.log(">>>> TerrainLineCollisionEvent locked!?!?");

      var surface = this.line;
      p.lockTo(surface, this.surfaceVec.normalize());
      animationSetPlayerRunning(p, this.time);
    } else {
      // BOUNCE. TODO implement addition of normalVector * jumpVel to allow jump being held to bounce him higher?   perhaps just buffer jump events.      
      p.vel = getReflectionVector(p.vel, collisionVec).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT
      //this.player.vel = getReflectionVector(ballState.vel, collisionVec.normalize()).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT          // COLLISIONVEC AVERAGE VERSION
      p.pos = this.state.pos;
      p.leaveGround();
    }
    console.log(">>>> fin TerrainLineCollisionEvent");
    physEng.updatePredicted();
    console.groupEnd();
  }
}
TerrainLineCollisionEvent.prototype = new CollisionEvent();
//TerrainLineCollisionEvent.prototype.constructor = TerrainLineCollisionEvent;







/**
 * Event class for the MultiTerrainLineCollisionEvent Event when the player runs into multiple TerrainLines from the air. 
 */
function MultiTerrainLineCollisionEvent(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec, allowLock) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  if (!((gameTimeOfCollision || gameTimeOfCollision === 0) &&
        (collidedWithList) &&
        (stateAtCollision) &&
        (surfaceVec) &&
        (normalVec) &&
        (allowLock === true || allowLock === false))) {
    console.log(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec, allowLock);
    throw "missing params.";
  }
  console.log(" ");
  console.log(" ");
  console.log(">>>> MultiTerrainLineCollisionEvent constructor, state at collision: ");
  stateAtCollision.print(">>>> ");
  if (collidedWithList.length > 1) {
    console.log(collidedWithList);
    throw "got a MultiTerrainLineCollisionEvent with more than one line. See above: ^";
  }
  //DEBUG_DRAW_BROWN.push(new DebugCircle(stateAtCollision.pos, stateAtCollision.radius, 5));
  this.mask += E_LINE_COLLISION_MASK;
  //this.time
  //this.collidedWithList = collidedWithList;
  //this.state = stateAtCollision;
  this.collidedWithList = collidedWithList;
  this.surfaceVec = surfaceVec;
  this.normalVec = normalVec; //the collision normal vector.
  this.allowLock = allowLock;



  this.handler = function (physEng) {
    console.group();
    var p = physEng.player;
    var input = p.inputState;

    var normalBallVel = p.vel.normalize();
    var collisionVec = this.normalVec;




    var collisionVecNorm = collisionVec.normalize();
    //console.log(this.normalVec);
    var collisionForceVec = projectVec2(p.vel, collisionVecNorm);
    var collisionForceVecLen = collisionForceVec.length();


    if (this.allowLock && collisionForceVecLen < p.physParams.autoLockThreshold) {
      console.log(">>>> MultiTerrainLineCollisionEvent auto locked!?!?");
      var surfaceVecNorm = collisionVecNorm.perp();      //TODO OHGOD REFACTOR TO THIS METHOD TAKING A COLLISION OBJECT THAT STORES NORMALS AND THE SINGLE SURFACE TO LOCK TO
      if (this.collidedWithList.length > 1) {
        throw "allowLock is true but theres multiple things in collidedWithList.";
      }
      console.log(this.collidedWithList);
      var surface = this.collidedWithList[0];

      //var velocityMag = ballState.vel.length();                     // DISABLED FOR REALISTIC PHYSICS
      //var surfaceInvertAngle = surfaceVec.negate().dot(normalBallVel);

      //if (surfaceAngle > surfaceInvertAngle) {
      //  surfaceVec = surfaceVec.negate();
      //}
      //this.player.vel = surfaceVec.multf(velocityMag);              // END DISABLED FOR REALISTIC PHYSICS
      console.log(">>>> collidedWithList: ", collidedWithList);
      p.lockTo(surface, this.surfaceVec.normalize());

      animationSetPlayerRunning(p, this.time);
    } else if (input.lock && this.allowLock && collisionForceVecLen < p.physParams.lockThreshold) {
      // IF PLAYER IS HOLDING LOCK, ATTEMPT TO LOCK IF WITHIN BOUNDARIES! TODO IS THE NEGATIVE LOCK_MIN_ANGLE CHECK NEEDED!!!?
      console.log(">>>> MultiTerrainLineCollisionEvent locked!?!?");
      if (this.collidedWithList.length > 1) {
        throw "allowLock is true but theres multiple things in collidedWithList.";
      }
      var surface = this.collidedWithList[0];
      p.lockTo(surface, surfaceVec.normalize());
      animationSetPlayerRunning(p, this.time);
    } else {
      // BOUNCE. TODO implement addition of normalVector * jumpVel to allow jump being held to bounce him higher?   perhaps just buffer jump events.      
      p.vel = getReflectionVector(p.vel, collisionVec).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT
      //this.player.vel = getReflectionVector(ballState.vel, collisionVec.normalize()).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT          // COLLISIONVEC AVERAGE VERSION
      p.pos = this.state.pos;
      p.leaveGround();
    }
    console.log(">>>> fin MultiTerrainLineCollisionEvent");
    physEng.updatePredicted();
    console.groupEnd();
  }
}
MultiTerrainLineCollisionEvent.prototype = new CollisionEvent();
//MultiTerrainLineCollisionEvent.prototype.constructor = MultiTerrainLineCollisionEvent;










/**
 * Event class for the TerrainPointCollisionEvent Event when the player runs into a TerrainLine. 
 * TODO fucking fix this shit.
 */
function TerrainPointCollisionEvent(gameTimeOfCollision, terrainPointCollidedWith, stateAtCollision, surfaceVec, normalVec, allowLock, terrainLines) {
  CollisionEvent.apply(this, [gameTimeOfCollision, stateAtCollision]);
  if (!((gameTimeOfCollision || gameTimeOfCollision === 0) &&
        (terrainPointCollidedWith) &&
        (terrainPointCollidedWith.lines) &&
        (terrainPointCollidedWith.id) &&
        (stateAtCollision) &&
        (surfaceVec) &&
        (normalVec) &&
        (allowLock === true || allowLock === false))) {
    console.log(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec, allowLock);
    throw "missing params.";
  }
  console.log(" ");
  console.log(" ");
  console.log("<<<< TerrainPointCollisionEvent constructor, state at collision: ");
  stateAtCollision.print("<<<< ");
  this.mask += E_POINT_COLLISION_MASK;
  //this.time
  //this.collidedWithList = collidedWithList;
  //this.state = stateAtCollision;
  this.tp = terrainPointCollidedWith;
  this.surfaceVec = surfaceVec;
  this.normalVec = normalVec; //the collision normal vector.
  this.allowLock = allowLock;
  this.terrainLines = terrainLines;



  this.handler = function (physEng) {
    console.log("<<<< TerrainPointCollisionEvent handler");
    console.group();
    var p = physEng.player;
    var input = p.inputState;

    var normalBallVel = p.vel.normalize();
    var collisionVec = this.normalVec;
    //console.log(this.normalVec);
    var collisionForceVec = projectVec2(p.vel, this.normalVec);
    var collisionForceVecLen = collisionForceVec.length();


    if (this.allowLock && collisionForceVecLen < p.physParams.autoLockThreshold) {
      console.log("<<<< TerrainPointCollisionEvent auto locked!?!?");

      this.lockTo(physEng);     //TODO USE A SNAP INSTEAD

      animationSetPlayerRunning(p, this.time);
    } else if (input.lock && this.allowLock && collisionForceVecLen < p.physParams.lockThreshold) {
      // IF PLAYER IS HOLDING LOCK, ATTEMPT TO LOCK IF WITHIN BOUNDARIES! TODO IS THE NEGATIVE LOCK_MIN_ANGLE CHECK NEEDED!!!?
      console.log("<<<< TerrainCollisionEvent locked!?!?");

      this.lockTo(physEng);

      animationSetPlayerRunning(p, this.time);
    } else {
      // BOUNCE. TODO implement addition of normalVector * jumpVel to allow jump being held to bounce him higher?   perhaps just buffer jump events.      
      p.vel = getReflectionVector(p.vel, collisionVec).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT
      //this.player.vel = getReflectionVector(ballState.vel, collisionVec.normalize()).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT          // COLLISIONVEC AVERAGE VERSION
      p.pos = this.state.pos;
      p.leaveGround();
    }
    console.groupEnd();
    console.log("<<<< fin TerrainPointCollisionEvent");
    physEng.updatePredicted();
  }


  this.lockTo = function (physEng) {
    var p = physEng.player;
    var inputs = p.inputState;
    var forceVec = p.getBaseForceVecGround(p.inputState);
    p.vel = projectVec2(p.vel, this.surfaceVec.normalize()); 
    p.accel = projectVec2(forceVec, this.surfaceVec.normalize());
    //function AngularState(time, radius, pointCircling, angle, angularVel, angularAccel) {

    //var vec0 = this.tp.line0.p0.subtract;
    //var vec1;

    


    //console.log("this.tp.line0: ", this.tp.line0);
    //console.log("this.tp.line1: ", this.tp.line1);
    for (var i = 0; i < this.terrainLines.length; i++) {
      if (this.terrainLines[i] && this.terrainLines[i] instanceof TerrainLine) {
        p.arcTangentSurfaces.push(this.terrainLines[i]);
      }
    }
    p.startArc(this.tp, this.normalVec.angle(), this.normalVec);

    return;
  }
}
TerrainPointCollisionEvent.prototype = new CollisionEvent();
//TerrainPointCollisionEvent.prototype.constructor = TerrainPointCollisionEvent;







/* Event class for the predicted time the player will hit adjacent terrain, when adjacent terrain is concave.
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function SurfaceToSurfaceEvent(predictedTime, dependencyMask, surface, nextSurface, angle, allowLock) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask]);

  this.surface = surface;
  this.nextSurface = nextSurface;
  this.angle = angle;
  this.allowLock = allowLock;
  this.upsideDown = (nextSurface.normal.y > 0 ? true : false);


  this.handler = function (physEng) {
    var p = physEng.player;
    var input = p.inputState;

    var normalBallVel = p.vel.normalize();
    var collisionVecNorm = this.nextSurface.normal;



    var collisionForceVec = projectVec2(p.vel, this.nextSurface.normal);
    var collisionForceVecLen = collisionForceVec.length();
    var surfaceVecNorm = collisionVecNorm.perp();

    console.log("          in SurfaceToSurfaceEvent handler. Angle ", this.angle, " p.physParams.surfaceSnapAngle ", p.physParams.surfaceSnapAngle);

    if (this.allowLock && p.physParams.surfaceSnapAngle <= this.angle && (!this.upsideDown || input.lock)) {        
      // if we should snap to the surface without losing momentum.
      console.log("            SurfaceToSurfaceEvent surface snap!?!?");


      //var velocityMag = ballState.vel.length();                     // DISABLED FOR REALISTIC PHYSICS
      //var surfaceInvertAngle = surfaceVec.negate().dot(normalBallVel);

      //if (surfaceAngle > surfaceInvertAngle) {
      //  surfaceVec = surfaceVec.negate();
      //}
      //this.player.vel = surfaceVec.multf(velocityMag);              // END DISABLED FOR REALISTIC PHYSICS

      p.snapTo(this.nextSurface, surfaceVecNorm);

      animationSetPlayerRunning(p, this.time);

    } else if (input.lock && this.allowLock && collisionForceVecLen < p.physParams.lockThreshold) {
      // if we should lock to the surface and lose momentum.
      console.log("            SurfaceToSurfaceEvent locking!?!?");


      p.lockTo(this.nextSurface, surfaceVecNorm);
      animationSetPlayerRunning(p, this.time);

    } else {
      console.log("            SurfaceToSurfaceEvent Bouncing!?!?");
      // BOUNCE. 
      p.vel = getReflectionVector(p.vel, collisionVecNorm).multf(p.physParams.bounceSpeedLossRatio); //TODO REFACTOR TO USE NEW COLLISION OBJECT
    
      p.leaveGround();
    }
    console.log("          fin SurfaceToSurfaceEvent");
    physEng.updatePredicted();
  }
}
SurfaceToSurfaceEvent.prototype = new PredictedEvent();
//SurfaceToSurfaceEvent.prototype.constructor = SurfaceToSurfaceEvent;






/* Event class for the predicted time the player will roll to the end of a line and reach its corner. 
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function SurfaceEndEvent(predictedTime, dependencyMask, surface, nextSurface, endpoint, arcAngle, allowLock) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask]);

  this.surface = surface;
  this.nextSurface = nextSurface;
  this.arcAngle = arcAngle;
  this.point = endpoint;
  this.allowLock = allowLock;
  this.upsideDown = (nextSurface.normal.y > 0 ? true : false);
  

  console.log("|-|-|-|-|-|  endpoint " + endpoint.x + ", " + endpoint.y);
  console.log("|-|-|-|-|-|  arcAngle ", this.arcAngle);
  console.log("|-|-|-|-|-|  surface.normal ", "" + surface.normal.x, ", " + surface.normal.y);
  console.log("|-|-|-|-|-|  nextSurface.normal ", "" + nextSurface.normal.x, ", " + nextSurface.normal.y);


  this.handler = function (physEng) {
    var p = physEng.player;
    var inputs = p.inputState;
    //PLAYER FIELDS TO USE
    //p.point = pointCircling;   // point being rounded
    //p.a = angle;               // angle around point.
    //p.aVel = angularVel;       // signed angular velocity.
    //p.aAccel = angularAccel;   // signed angular accel.

    var angleAbs = (this.arcAngle < 0 ? -this.arcAngle : this.arcAngle);

    if ((inputs.lock && angleAbs < p.physParams.pointLockRoundMinAngle) || (angleAbs < p.physParams.pointLockRoundMinAngle)) {  // Dont just release, we should lock wrap.
      this.wrap(physEng);
    } else {
      p.leaveGround();
    }



    //throw "stop";
    physEng.updatePredicted();
    return;
  }



  this.wrap = function (physEng) {
    var p = physEng.player;
    var inputs = p.inputState;


    p.startArc(this.point, this.arcAngle, this.surface.normal);
    p.arcTangentSurfaces.push(this.nextSurface);
    return;
  }
}
SurfaceEndEvent.prototype = new PredictedEvent();
//SurfaceEndEvent.prototype.constructor = SurfaceEndEvent;






/* Event class for the EndArcEvent predicted when a locked ball completes a corner and continues locked on the next surface.
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function EndArcEvent(predictedTime, dependencyMask, nextSurface) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask])
  this.nextSurface = nextSurface;
  this.handler = function (physEng) {
    var p = physEng.player;

    if (this.nextSurface) {
      console.log("  ++++++++  p.arcTo(this.nextSurface)         ++++");
      p.arcTo(this.nextSurface);
    } else {
      console.log("  ++++++++  p.arcTo(null)     ++++++++");
      p.arcTo();
    }

    physEng.updatePredicted();
    return;                               //TODO
  }
}
EndArcEvent.prototype = new PredictedEvent();
//EndArcEvent.prototype.constructor = EndArcEvent;









/* 
 * Event class for the DragTableEvent
 * @param predictedTime     the gametime at which the event will occur.
 * @param dependencyMask    used to bitwise and shit for predictions that are only affected by specific things. MAY NOT USE?
 */
function DragTableEvent(predictedTime, dependencyMask, upOrDown) { // predictedTime should be gameTime since last frame, the time the physics engine should complete up to before rendering.
  PredictedEvent.apply(this, [predictedTime, dependencyMask])

  this.handler = function (physEng) {
    var p = physEng.player;
    physEng.updatePredicted();
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
//    var p = physEng.player;
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