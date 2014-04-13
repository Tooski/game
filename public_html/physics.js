/*
 * The physics engine. These are helper functions used to base the games physics around.
 * May later be extended to support different player characters with different physics properties.
 */
function physParams(gravity, dragBaseAmt, dragTerminalVelocity, dragExponent) {
  this.grav = gravity;
  this.dragBase = dragBaseAmt;
  this.dragTV = dragTerminalVelocity;
  this.dragExp = drawExponent;
}

function controlParams(groundLRaccel, airLRaccel, boostLRvel, boostDownVel, jumpVel, doubleJumpVel) {
  this.groundLRaccel = groundLRaccel;
  this.airLRaccel = airLRaccel;
  this.boostLRvel = boostLRvel;
  this.boostDownVel = boostDownVel;
  this.jumpVel = jumpVel;
  this.doubleJumpVel = doubleJumpVel;
}



function physEng(physParams, controlParams) {
  this.gravity = new vec2(0, -physParams.grav);
  this.dragBase = physParams.dragBase;
  this.dragTV = physParams.dragTV;
  this.dragExp = physParams.dragExp;

  this.controlParams = controlParams;
}

physEng.prototype.step = function (timeDelta) {

}

