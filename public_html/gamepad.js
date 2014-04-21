/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 */

function GamepadState(gamepad) {
  this.buttons = [];
  this.axes = [];
  for (var i = 0; i < gamepad.buttons.length; i++) {
    this.buttons.push(gamepad.buttons[i]);
  }
  for (var i = 0; i < gamepad.axes.length; i++) {
    this.buttons.push(gamepad.axes[i]);
  }
}


var AXIS_THRESHHOLD = 0.3;


var gamepadSupport = {
  // A number of typical buttons recognized by Gamepad API and mapped to
  // standard controls. Any extraneous buttons will have larger indexes.
  TYPICAL_BUTTON_COUNT: 16,

  // A number of typical axes recognized by Gamepad API and mapped to
  // standard controls. Any extraneous buttons will have larger indexes.
  TYPICAL_AXIS_COUNT: 4,

  // Whether we’re requestAnimationFrameing like it’s 1999.
  ticking: false,

  // The canonical list of attached gamepads, without “holes” (always
  // starting at [0]) and unified between Firefox and Chrome.
  gamepads: [],

  //Contain a list of gamepads. States are copies of the button and axis arrays.
  gamepadsLastStates: [],

  // Remembers the connected gamepads at the last check; used in Chrome
  // to figure out when gamepads get connected or disconnected, since no
  // events are fired.
  prevRawGamepadTypes: [],

  // Previous timestamps for gamepad state; used in Chrome to not bother with
  // analyzing the polled data if nothing changed (timestamp is the same
  // as last time).
  prevTimestamps: [],

  //GameEngine object to call from
  engine: null,

  /*    CONTROLLER BUTTON REFERENCE LIST
  buttons[x]
  0   A / X
  1   B / O
  2   X / Square
  3   Y / Triangle
  4   LB / L1
  5   RB / R1
  6   LT / L2
  7   RT / R2
  8   Select / Back
  9   Start / Forward
  10  LS click
  11  RS click
  12  up dpad
  13  down dpad
  14  left dpad
  15  right dpad
  16  middle button (between start and select)

  axes[x]
  0   Left stick X axis, negative left, positive right
  1   Left stick Y axis, negative up, positive down
  2   right stick X axis, negative left, positive right
  3   right stick Y axis, negative up, positive down
  */


  //Button mapping. I'm implementing them as a bitmask, so multiple buttons can map to this.
  bUp: 12,
  bDown: 13,
  bLeft: 14,
  bRight: 15,

  bJump: 0,
  bBoost: 4,
  bLock: 7,

  bPause: 9,

  axisUpDown: 1,
  axisLeftRight: 0,

  /**
   * Initialize support for Gamepad API.
   */
  init: function(gameEngine) {
    var gamepadSupportAvailable = navigator.getGamepads ||
        !!navigator.webkitGetGamepads ||
        !!navigator.webkitGamepads;

	gamepadSupport.engine = gameEngine;
	//console.log("in gamepad init: function(), engine: ");
	//console.log(gamepadSupport.engine);
    if (!gamepadSupportAvailable) {
      // It doesn’t seem Gamepad API is available – show a message telling
      // the visitor about it.
      console.log("Gamepad not supported");
    } else {
      console.log("Gamepads supported, still in init: ");
      // Check and see if gamepadconnected/gamepaddisconnected is supported.
      // If so, listen for those events and don't start polling until a gamepad
      // has been connected.
      if ('ongamepadconnected' in window) {
        console.log("ongamepadconnected supported, still in init: ");
        window.addEventListener('gamepadconnected',
                              gamepadSupport.onGamepadConnect, false);
        window.addEventListener('gamepaddisconnected',
                                gamepadSupport.onGamepadDisconnect, false);
      } else {
        // If connection events are not supported just start polling
        gamepadSupport.startPolling();
      }
    }
  },

  /**
   * React to the gamepad being connected.
   */
  onGamepadConnect: function (event) {
    console.log("In gamepad onGamepadConnect");
    // Add the new gamepad on the list of gamepads to look after.
    gamepadSupport.gamepads.push(event.gamepad);
    gamepadSupport.gamepadsLastStates.push(new GamepadState(event.gamepad));

    // Start the polling loop to monitor button changes.
    gamepadSupport.startPolling();
  },

  /**
   * React to the gamepad being disconnected.
   */
  onGamepadDisconnect: function (event) {
    console.log("In gamepad onGamePadDisconnect");
    // Remove the gamepad from the list of gamepads to monitor.
    for (var i in gamepadSupport.gamepads) {
      if (gamepadSupport.gamepads[i].index == event.gamepad.index) {
        gamepadSupport.gamepads.splice(i, 1);
        break;
      }
    }

    // If no gamepads are left, stop the polling loop.
    if (gamepadSupport.gamepads.length == 0) {
      gamepadSupport.stopPolling();
    }
  },

  /**
   * Starts a polling loop to check for gamepad state.
   */
  startPolling: function() {
    // Don’t accidentally start a second loop, man.
    if (!gamepadSupport.ticking) {
      gamepadSupport.ticking = true;
      gamepadSupport.tick();
    }
  },

  /**
   * Stops a polling loop by setting a flag which will prevent the next
   * requestAnimationFrame() from being scheduled.
   */
  stopPolling: function() {
    gamepadSupport.ticking = false;
  },

  /**
   * A function called with each requestAnimationFrame(). Polls the gamepad
   * status and schedules another poll.
   */
  tick: function() {
    gamepadSupport.pollStatus();
    gamepadSupport.scheduleNextTick();
  },

  scheduleNextTick: function () {
    //console.log("In gamepad scheduleNextTick");
    // Only schedule the next frame if we haven’t decided to stop via
    // stopPolling() before.
    if (gamepadSupport.ticking) {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(gamepadSupport.tick);
      } else if (window.mozRequestAnimationFrame) {
        window.mozRequestAnimationFrame(gamepadSupport.tick);
      } else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(gamepadSupport.tick);
      }
      // Note lack of setTimeout since all the browsers that support
      // Gamepad API are already supporting requestAnimationFrame().
    }
  },

  /**
   * Checks for the gamepad status. Monitors the necessary data and notices
   * the differences from previous state (buttons for Chrome/Firefox,
   * new connects/disconnects for Chrome). If differences are noticed, asks
   * to update the display accordingly. Should run as close to 60 frames per
   * second as possible.
   */
  pollStatus: function () {
    //console.log("In gamepad pollStatus");
    // Poll to see if gamepads are connected or disconnected. Necessary
    // only on Chrome.
    gamepadSupport.pollGamepads();

    for (var i = 0; i < gamepadSupport.gamepads.length; i++) {
      var gamepad = gamepadSupport.gamepads[i];
      if (!gamepadSupport.gamepadsLastStates[i]) {
        gamepadSupport.gamepadsLastStates[i] = new GamepadState(gamepad);
      }
      //console.log(gamepad.buttons);


      // Don’t do anything if the current timestamp is the same as previous
      // one, which means that the state of the gamepad hasn’t changed.
      // This is only supported by Chrome right now, so the first check
      // makes sure we’re not doing anything if the timestamps are empty
      // or undefined.
      if (gamepad.timestamp &&
          (gamepad.timestamp == gamepadSupport.prevTimestamps[i])) {
        continue;
      }
      gamepadSupport.prevTimestamps[i] = gamepad.timestamp;

      gamepadSupport.updateDisplay(i);
    }
  },

  // This function is called only on Chrome, which does not yet support
  // connection/disconnection events, but requires you to monitor
  // an array for changes.
  pollGamepads: function () {
    //console.log("In gamepad pollGamepads: ");
    // Get the array of gamepads – the first method (getGamepads)
    // is the most modern one and is supported by Firefox 28+ and
    // Chrome 35+. The second one (webkitGetGamepads) is a deprecated method
    // used by older Chrome builds.
    var rawGamepads =
        (navigator.getGamepads && navigator.getGamepads()) ||
        (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

    if (rawGamepads) {
      // We don’t want to use rawGamepads coming straight from the browser,
      // since it can have “holes” (e.g. if you plug two gamepads, and then
      // unplug the first one, the remaining one will be at index [1]).
      gamepadSupport.gamepads = [];

      // We only refresh the display when we detect some gamepads are new
      // or removed; we do it by comparing raw gamepad table entries to
      // “undefined.”
      var gamepadsChanged = false;

      for (var i = 0; i < rawGamepads.length; i++) {
        if (typeof rawGamepads[i] != gamepadSupport.prevRawGamepadTypes[i]) {
          gamepadsChanged = true;
          gamepadSupport.prevRawGamepadTypes[i] = typeof rawGamepads[i];
        }

        if (rawGamepads[i]) {
          gamepadSupport.gamepads.push(rawGamepads[i]);
        }
      }
    }
  },

  // Call game.js with new state and ask it to update the screen
  updateDisplay: function(gamepadId) {
    var gamepad = gamepadSupport.gamepads[gamepadId];
    var gamepadLastState = gamepadSupport.gamepadsLastStates[gamepadId];
    //console.log("In gamepad updateDisplay: function. gamePadLastStates = ");
    //console.log(gamepadLastState);

    var timeStamp = performance.now();
    if (gamepad.buttons[gamepadSupport.bUp] !== gamepadLastState.buttons[gamepadSupport.bUp]) {
      gamepadSupport.engine.setUp((gamepad.buttons[gamepadSupport.bUp] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bDown] !== gamepadLastState.buttons[gamepadSupport.bDown]) {
      gamepadSupport.engine.setDown((gamepad.buttons[gamepadSupport.bDown] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bLeft] !== gamepadLastState.buttons[gamepadSupport.bLeft]) {
      gamepadSupport.engine.setLeft((gamepad.buttons[gamepadSupport.bLeft] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bRight] !== gamepadLastState.buttons[gamepadSupport.bRight]) {
      gamepadSupport.engine.setRight((gamepad.buttons[gamepadSupport.bRight] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bJump] !== gamepadLastState.buttons[gamepadSupport.bJump]) {
      gamepadSupport.engine.setJump((gamepad.buttons[gamepadSupport.bJump] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bBoost] !== gamepadLastState.buttons[gamepadSupport.bBoost]) {
      gamepadSupport.engine.setBoost((gamepad.buttons[gamepadSupport.bBoost] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bLock] !== gamepadLastState.buttons[gamepadSupport.bLock]) {
      gamepadSupport.engine.setLock((gamepad.buttons[gamepadSupport.bLock] === 1.0 ? true : false), timeStamp);
    }
    if (gamepad.buttons[gamepadSupport.bPause] !== gamepadLastState.buttons[gamepadSupport.bPause]) {
      gamepadSupport.engine.setPause((gamepad.buttons[gamepadSupport.bPause] === 1.0 ? true : false), timeStamp);
    }

    
    //if (gamepad.axes[gamepadSupport.axisLeftRight] != gamepadLastState.axes[gamepadSupport.axisLeftRight]) {  // test analog stick X axis
    //  if (gamepad.axes[gamepadSupport.axisLeftRight] <= - AXIS_THRESHHOLD) {
    //    gamepadSupport.engine.setLeft(true, timeStamp);
    //  } else if (gamepad.axes[gamepadSupport.axisLeftRight] >= AXIS_THRESHHOLD) {
    //    gamepadSupport.engine.setRight(true, timeStamp);
    //  } else {
    //    gamepadSupport.engine.setLeft(false, timeStamp);
    //    gamepadSupport.engine.setRight(false, timeStamp);
    //  }
    //}

    //if (gamepad.axes[gamepadSupport.axisUpDown] !== gamepadLastState.axes[gamepadSupport.axisUpDown]) {     // test analog stick Y axis
    //  if (gamepad.axes[gamepadSupport.axisUpDown] <= - AXIS_THRESHHOLD) {
    //    gamepadSupport.engine.setUp(true, timeStamp);
    //  } else if (gamepad.axes[gamepadSupport.axisUpDown] >= AXIS_THRESHHOLD) {
    //    gamepadSupport.engine.setDown(true, timeStamp);
    //  } else {
    //    gamepadSupport.engine.setUp(false, timeStamp);
    //    gamepadSupport.engine.setDown(false, timeStamp);
    //  }
    //}
    gamepadSupport.gamepadsLastStates[gamepadId] = new GamepadState(gamepad);
  },
};
