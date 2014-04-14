/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 * Author Travis Drake
 */
PHYS_DEBUG = true;


// PhysParams object contains all the physics values. These will not change between characters. 
// This exists because it will be used later on to implement other terrain types, whose static
// effect values will be passed in here.
function PhysParams(gravity) {
  this.gravity = gravity;
}

// This object contains all the values that are relative to the PLAYER. IE, anything that would be specific to different selectable characters.
function ControlParams(gLRaccel, aLRaccel, aUaccel, aDaccel, gBoostLRvel, aBoostLRvel, boostDownVel, jumpVel, doubleJumpVel, numAirCharges, dragBaseAmt, dragTerminalVelocity, dragExponent) {
  this.gLRaccel = groundLRaccel;        //x acceleration exerted by holding Left or Right on the ground.
  this.aLRaccel = airLRaccel;           //x acceleration exerted by holding Left or Right in the air.
  this.aUaccel = airUaccel;             //y acceleration exerted by holding up in the air.
  this.aDaccel = airDaccel;             //y acceleration exerted by holding down in the air.
  this.gBoostLRvel = gBoostLRvel;       //x velocity that a boost on the ground sets.
  this.aBoostLRvel = aBoostLRvel;       //x velocity that a boost in the air sets.
  this.boostDownVel = boostDownVel;     //-y velocity that a downboost sets in the air.
  this.jumpVel = jumpVel;               //y velocity that a ground jump sets.
  this.doubleJumpVel = doubleJumpVel;   //y velocity that a double jump sets.

  this.numAirCharges = numAirCharges;   //number of boost / double jumps left in the air.

  this.dragBase = dragBaseAmt;          //base drag exerted
  this.dragTV = dragTerminalVelocity;   //the velocity at which drag and gravity will be equal with no other factors present.
  this.dragExp = drawExponent;          //the exponent used to create the drag curve.
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


function PhysEng(physParams, playerModel) {
  this.player = playerModel;    // the players character model
  this.ctrl = controlParams;    // control parameters.
  this.phys = physParams;       // physics parameters

}

PhysEng.prototype.step = function (timeDelta) { // CHECKS FOR COLLISIONS, HANDLES THEIR TIME STEPS, AND THEN CALLS airStep AND / OR groundStep WHERE APPLICABLE.
  if (PHYS_DEBUG) {

  }
}

PhysEng.prototype.airStep = function (timeDelta) { // Returns the players new position and velocity after an airStep of this length. Does not modify values.

}

PhysEng.prototype.groundStep = function (timeDelta) { // A step while the player is in the ground. Returns the players new position and velocity after a groundStep of this length. Does not modify values.

}