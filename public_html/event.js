



// Event class. All events interpreted by the physics engine must extend this, as seen below. 
// Currently input and render events exist. Physics events will probably follow shortly (for example, when the player passes from one terrain line to another, etc).
function Event(eventTime) {    //eventTime is the gameTime that the event occurs at.
  this.time = eventTime;
  this.handler = function (physEng) {   // NEEDS TO BE OVERRIDDEN IN CHILDREN CLASSES
    throw "this abstract function should never call.";
  };
}



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
  Event.apply(this, [eventTime])
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