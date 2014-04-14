/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 * Author Travis Drake
 */
PHYS_DEBUG = true;

// this should work in just about any browser, and allows us to use performance.now() successfully no matter the browser.
window.performance = window.performance || {};
performance.now = (function () {
  return performance.now ||
         performance.mozNow ||
         performance.msNow ||
         performance.oNow ||
         performance.webkitNow ||
         function () { return new Date().getTime(); };
})();




// PhysParams object contains all the physics values. These will not change between characters. 
// This exists because it will be used later on to implement other terrain types, whose static
// effect values will be passed in here.
function PhysParams(gravity) {
  this.gravity = gravity;
}

// this thing is just useful for storing potential states in an object.
function TempState(pos, vel) {
  this.pos = pos;
  this.vel = vel;
}
function TempState(px, py, vx, vy) {
  this.pos = vec2(px, py);
  this.vel = vec2(vx, vy);
}

// This object contains all the values that are relative to the PLAYER. IE, anything that would be specific to different selectable characters.
function ControlParams(gLRaccel, aLRaccel, aUaccel, aDaccel, gBoostLRvel, aBoostLRvel, boostDownVel, jumpVel, doubleJumpVel, numAirCharges, dragBaseAmt, dragTerminalVel, dragExponent) {
  this.gLRaccel = gLRaccel;                 //x acceleration exerted by holding Left or Right on the ground.
  this.aLRaccel = aLRaccel;                 //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = aUaccel;                   //y acceleration exerted by holding up in the air.
  this.aDaccel = aDaccel;                   //y acceleration exerted by holding down in the air.
  this.gBoostLRvel = gBoostLRvel;           //x velocity that a boost on the ground sets.
  this.aBoostLRvel = aBoostLRvel;           //x velocity that a boost in the air sets.
  this.boostDownVel = boostDownVel;         //-y velocity that a downboost sets in the air.
  this.jumpVel = jumpVel;                   //y velocity that a ground jump sets.
  this.doubleJumpVel = doubleJumpVel;       //y velocity that a double jump sets.

  this.numAirCharges = numAirCharges;       //number of boost / double jumps left in the air.

  this.dragBase = dragBaseAmt;              //base drag exerted
  this.dragTerminalVel = dragTerminalVel;   //the velocity at which drag and gravity will be equal with no other factors present.
  this.dragExponent = dragExponent;         //the exponent used to create the drag curve.
}


function PlayerModel(controlParams, ballRadius, startPoint, numAirCharges) {     // THIS IS THE PLAYER PHYSICS MODEL, EXTENDABLE FOR DIFFERENT CHARACTER TYPES.
  // Player properties.
  this.radius = ballRadius;          //float radius
  this.controlParameters = controlParams;

  // Movement values.
  this.pos = startPoint;        //vec2 for position!
  this.vel = new vec2(0.0, 0.0);//vec2 for velocity!


  // STATE FLAGS! READ THEIR COMMENTS BEFORE USING!
  this.airBorne = true;           // BE CAREFUL WITH THESE. IF THE PLAYER IS ON THE GROUND, airBorne should ALWAYS be false. 
  this.groundLocked = false;      // If the player is on the ground but is not holding the lock button, then this should ALSO be false.

  this.airChargeCount = numAirCharges; //number of boosts / double jumps left.
}

// Physics Engine constructor.
function PhysEng(physParams, playerModel) {
  this.player = playerModel;                        // the players character model
  this.ctrl = playerModel.controlcontrolParameters; // control parameters.
  this.phys = physParams;                           // physics parameters

  if (PHYS_DEBUG) {
    this.printStartState();
  }
}


// CHECKS FOR COLLISIONS, HANDLES THEIR TIME STEPS, AND THEN CALLS airStep AND / OR groundStep WHERE APPLICABLE
PhysEng.prototype.step = function (timeDelta) { // ______timeDelta IS ALWAYS A FLOAT REPRESENTING THE FRACTION OF A SECOND ELAPSED, WHERE 1.0 IS ONE FULL SECOND. _____________                           
  if (PHYS_DEBUG) {
    console.log("\nEntered step(timeDelta), timeDelta = %.3f\n", timeDelta);
    this.printState(true, false, false);
  }


}

PhysEng.prototype.airStep = function (timeDelta) { // Returns the players new position and velocity after an airStep of this length. Does not modify values.

}

PhysEng.prototype.groundStep = function (timeDelta) { // A step while the player is in the ground. Returns the players new position and velocity after a groundStep of this length. Does not modify values.

}

PhysEng.prototype.printState = function (printExtraPlayerDebug, printExtraControlsDebug, printExtraPhysDebug) {
  console.log("Player: ");
  console.log("  pos: %.2f, %.2f", player.pos.x, player.pos.y);
  console.log("  vel: %.2f, %.2f", player.vel.x, player.vel.y);
  if (printExtraPlayerDebug) {
    console.log("  airBorne:       %s", player.airBorne);
    console.log("  groundLocked:   %s", player.groundLocked);
    console.log("  airChargeCount: %d", player.airChargeCount);
  }
  console.log("");

  if (printExtraControlsDebug) {
    console.log("Controls: ");
    console.log("  gLRaccel: %.2f", ctrl.gLRaccel);
    console.log("  aLRaccel: %.2f", ctrl.aLRaccel);
    console.log("  aUaccel: %.2f", ctrl.aUaccel);
    console.log("  aDaccel: %.2f", ctrl.aDaccel);
    console.log("  gBoostLRvel: %.2f", ctrl.gBoostLRvel);
    console.log("  aBoostLRvel: %.2f", ctrl.aBoostLRvel);
    console.log("  boostDownVel: %.2f", ctrl.boostDownVel);
    console.log("  jumpVel: %.2f", ctrl.jumpVel);
    console.log("  doubleJumpVel: %.2f", ctrl.doubleJumpVel);
    console.log("  numAirCharges: %.2f", ctrl.numAirCharges);
    console.log("  dragBase: %.2f", ctrl.dragBase);
    console.log("  dragTerminalVel: %.2f", ctrl.dragTerminalVel);
    console.log("  dragExponent: %.2f", ctrl.dragExponent);
    console.log("");
  }


  if (printExtraPhysDebug) {

    console.log("PhysParams: ");
    console.log("  gravity: %.2f", phys.gravity);
    console.log("");
  }
  console.log("");

}

PhysEng.prototype.printStartState = function () {
  console.log("Created PhysEng");
  console.log("Controls: ");
  console.log("  gLRaccel: %.2f", ctrl.gLRaccel);
  console.log("  aLRaccel: %.2f", ctrl.aLRaccel);
  console.log("  aUaccel: %.2f", ctrl.aUaccel);
  console.log("  aDaccel: %.2f", ctrl.aDaccel);
  console.log("  gBoostLRvel: %.2f", ctrl.gBoostLRvel);
  console.log("  aBoostLRvel: %.2f", ctrl.aBoostLRvel);
  console.log("  boostDownVel: %.2f", ctrl.boostDownVel);
  console.log("  jumpVel: %.2f", ctrl.jumpVel);
  console.log("  doubleJumpVel: %.2f", ctrl.doubleJumpVel);
  console.log("  numAirCharges: %.2f", ctrl.numAirCharges);
  console.log("  dragBase: %.2f", ctrl.dragBase);
  console.log("  dragTerminalVel: %.2f", ctrl.dragTerminalVel);
  console.log("  dragExponent: %.2f", ctrl.dragExponent);
  console.log("");

  console.log("PhysParams: ");
  console.log("  gravity: %.2f", phys.gravity);
  console.log("");

  console.log("Player: ");
  console.log("  radius: %.2f", player.radius);
  console.log("  starting pos: %.2f, %.2f", player.pos.x, player, pos.y);
  console.log("  starting vel: %.2f, %.2f", player.vel.x, player, vel.y);
  console.log("  airBorne: %s", player.airBorne);
  console.log("  groundLocked: %s", player.groundLocked);
  console.log("");
  console.log("");
}