/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 */
function PhysParams(gravity, dragBaseAmt, dragTerminalVelocity, dragExponent) {
  this.grav = gravity;
  this.dragBase = dragBaseAmt;
  this.dragTV = dragTerminalVelocity;
  this.dragExp = drawExponent;
}

function ControlParams(groundLRaccel, airLRaccel, boostLRvel, boostDownVel, jumpVel, doubleJumpVel) {
  this.groundLRaccel = groundLRaccel;
  this.airLRaccel = airLRaccel;
  this.boostLRvel = boostLRvel;
  this.boostDownVel = boostDownVel;
  this.jumpVel = jumpVel;
  this.doubleJumpVel = doubleJumpVel;
}


function PlayerModel(controlParams, ballRadius, startPoint, numAirCharges) {     // THIS IS THE PLAYER PHYSICS MODEL, EXTENDABLE FOR DIFFERENT CHARACTER TYPES.
  this.radius = ballRadius;          //float radius
  this.airCharges = numAirCharges;   //number of boost / double jumps left in the air.
  this.controls = controlParams;     //control parameters.

  this.position = startPoint;        //vec2 for position!
  this.velocity = new vec2(0.0, 0.0);//vec2 for velocity!


}


function PhysEng(physParams, playerModel) {
  this.gravity = new vec2(0, -physParams.grav);
  this.dragBase = physParams.dragBase;
  this.dragTV = physParams.dragTV;
  this.dragExp = physParams.dragExp;

  this.hamster = playerModel; //LAZY FOR NOW.
}

PhysEng.prototype.step = function (timeDelta) {
  
}

