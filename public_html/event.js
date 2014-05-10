



// Event class. All events interpreted by the physics engine must extend this, as seen below. 
// Currently input and render events exist. Physics events will probably follow shortly (for example, when the player passes from one terrain line to another, etc).
function Event(eventTime) {    //eventTime is the gameTime that the event occurs at.
  this.time = eventTime;
}

Event.prototype.handler = function (physEng) {   // NEEDS TO BE OVERRIDDEN IN CHILDREN CLASSES
  throw "this abstract function should never call.";
};



// InputEvent class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEvent(eventTime, pressed) {   //
  Event.apply(this, [eventTime])
  this.pressed = pressed;       // PRESSED DOWN OR RELEASED
}

InputEvent.prototype = new Event();
InputEvent.prototype.constructor = InputEvent;
InputEvent.prototype.handler = function (physEng) {          //THIS IS THE PARENT CLASS FOR INPUT CHANGE CODE.
  throw "this abstract function should never call.";
}



// InputEventRight class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventRight(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES. SHOULD BE DONE.
    //console.log("Handling input right event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;
    if (this.pressed && (!curInputState.right)) {  // Input was just pressed down.
      curInputState.right = true;
      physEng.accelState.update(curInputState);
    } else if ((!this.pressed) && (curInputState.right)) {            // Input was just released.
      curInputState.right = false;
      physEng.accelState.update(curInputState);
    } else {
      console.log("we reached a state where a right input was illogically pressed or released.");
    }
  }
}
InputEventRight.prototype = new InputEvent();
//InputEventRight.prototype.constructor = InputEventRight;




// InputEventLeft class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventLeft(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  SHOULD BE DONE.
    //console.log("Handling input left event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;
    if (this.pressed && (!curInputState.left)) {  // Input was just pressed down.
      curInputState.left = true;
      physEng.accelState.update(curInputState);
    } else if (!this.pressed && (curInputState.left)) {            // Input was just released.
      curInputState.left = false;
      physEng.accelState.update(curInputState);
    } else {
      console.log("we reached a state where a left input was illogically pressed or released.");
    }
  }
}
InputEventLeft.prototype = new InputEvent();
//InputEventLeft.prototype.constructor = InputEventLeft;



// InputEventUp class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventUp(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.    SHOULD BE DONE.
    //console.log("Handling input up event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;
    if (this.pressed && (!curInputState.up)) {  // Input was just pressed down.
      curInputState.up = true;
      physEng.accelState.update(curInputState);
    } else if (!this.pressed && (curInputState.up)) {            // Input was just released.
      curInputState.up = false;
      physEng.accelState.update(curInputState);
    } else {
      console.log("we reached a state where an up input was illogically pressed or released.");
    }
  }
}
InputEventUp.prototype = new InputEvent();
//InputEventUp.prototype.constructor = InputEventUp;




// InputEventDown class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventDown(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.    SHOULD BE DONE.
    //console.log("Handling input down event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;
    if (this.pressed && (!curInputState.down)) {  // Input was just pressed down.
      curInputState.down = true;
      physEng.accelState.update(curInputState);
    } else if (!this.pressed && (curInputState.down)) {            // Input was just released.
      curInputState.down = false;
      physEng.accelState.update(curInputState);
    } else {
      console.log("we reached a state where a down input was illogically pressed or released.");
    }
  }
}
InputEventDown.prototype = new InputEvent();
//InputEventDown.prototype.constructor = InputEventDown;




// InputEventJump class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventJump(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES. 
    //console.log("Handling input jump event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;               // TODO HANDLE JUMP
    //if (this.pressed && (!curInputState.jump)) {  // Input was just pressed down.
    //  curInputState.jump = true;
    //  physEng.accelState.update();
    //} else if (!this.pressed && (curInputState.jump)) {            // Input was just released.
    //  curInputState.jump = false;
    //  physEng.accelState.update();
    //}
  }
}
InputEventJump.prototype = new InputEvent();
//InputEventJump.prototype.constructor = InputEventJump;





// InputEventBoost class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventBoost(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  
    //console.log("Handling input boost event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;                       // TODO HANDLE BOOST
    //if (this.pressed && (!curInputState.boost)) {  // Input was just pressed down.
    //  curInputState.boost = true;
    //  physEng.accelState.update();
    //} else if (!this.pressed && (curInputState.boost)) {            // Input was just released.
    //  curInputState.boost = false;
    //  physEng.accelState.update();
    //}
  }
}
InputEventBoost.prototype = new InputEvent();
//InputEventBoost.prototype.constructor = InputEventBoost;






// InputEventLock class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventLock(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES LOCK CHANGES.  TODO DONE????
    //console.log("Handling input lock event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;
    if (this.pressed && (!curInputState.lock)) {  // Input was just pressed down.
      curInputState.lock = true;
      if (physEng.player.onGround) {
        physEng.player.gLocked = true;
      }
      //physEng.accelState.update();                              // TODO MOST LIKELY UNNECESSARY BUT MAY BE NEEDED LATER???
    } else if (!this.pressed && (curInputState.lock)) {           // Input was just released.
      if (physEng.player.gLocked) {
        curInputState.lock = false;
        physEng.accelState.update(curInputState);
      }
    } else {
      console.log("we reached a state where a lock input was illogically pressed or released.");
    }
  }
}
InputEventLock.prototype = new InputEvent();
//InputEventLock.prototype.constructor = InputEventLock;







// InputEventPause class for input events. These are the events that would be stored in a replay file and consist of any human input to the physics engine (Character control).
function InputEventPause(eventTime, pressed) {   //
  InputEvent.apply(this, [eventTime, pressed]);
  this.handler = function (physEng) {          //THIS CODE HANDLES INPUT CHANGES.  TODO handle later, who needs pausing anyway?
    //console.log("Handling input pause event. pressed = ", this.pressed);
    var curInputState = physEng.inputState;
    if (this.pressed && (!curInputState.pause)) {  // Input was just pressed down.
      curInputState.pause = true;
      physEng.accelState.update(curInputState);
    } else if (!this.pressed && (curInputState.pause)) {            // Input was just released.
      curInputState.pause = false;
      physEng.accelState.update(curInputState);
    } else {
      console.log("we reached a state where a pause was illogically pressed or released.");
    }
  }
}
InputEventPause.prototype = new InputEvent();
//InputEventPause.prototype.constructor = InputEventPause;







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
function TerrainCollisionEvent(gameTimeOfCollision, collidedWithList, stateAtCollision, surfaceVec, normalVec) {
  CollisionEvent.apply(this, [gameTimeOfCollision, collidedWithList, stateAtCollision]);

  this.surfaceVec = surfaceVec;
  this.normalVec = normalVec;


  this.handler = function (physEng) {










    //OLD

    //console.log("START handleTerrainAirCollision");
    var normalBallVel = this.state.vel.normalize();
    var angleToNormal;
    var collisionVec;
    //if (stuffWeCollidedWith.length > 1) {
    console.log("radius = ", this.state.radius);
    collisionVec = this.normalVec;


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
function GoalEvent(eventTime) { // eventTime is gameTime at which the event occurs.
  Event.apply(this, [eventTime])

  this.handler = function (physEng) {
    return;     //TODO IMPLEMENT
  }
}
GoalEvent.prototype = new Event();
//GoalEvent.prototype.constructor = GoalEvent;





// Event class for the render event. One of these should be the last event in the eventList array passed to update. NOT STORED IN REPLAYS.
function RenderEvent(eventTime) {  // eventTime is gameTime at which the render occurs.
  Event.apply(this, [eventTime])

  this.handler = function (physEng) {
    return;
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
    return;                               //TODO
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