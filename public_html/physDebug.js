/**
 * physDebug.js
 * Runs some stuff on physics and prints output step by step. used to test various things.
 */




var DEBUG_STEP = true;
var DEBUG_EVENT_AT_A_TIME = true && DEBUG_STEP; //only true if debug step is also true. Saves me the time of changing 2 variables to switch between normal state and debug state.
var DEBUG_MAX_TIMESTEP = 0.033333333333333333;


//var aP0 = new vec2(-100, 100);
//var aP1 = new vec2(100, 100);
//var aNorm = aP1.subtract(aP0).perp().normalize();
//if (aNorm.y >= 0) {
//  aNorm = aNorm.negate();
//}

//var bP0 = aP1;
//var bP1 = new vec2(300, -100);
//var bNorm = bP1.subtract(bP0).perp().normalize();
//if (bNorm.y >= 0) {
//  bNorm = bNorm.negate();
//}
//var lineA = new TerrainLine(aP0, aP1, "wahtever", null, null, aNorm);
//var lineB = new TerrainLine(bP0, bP1, "wahtever", lineA, null, bNorm);
//DEBUG_DRAW_GRAY.push(new DebugLine(aP0, aP1, 5));
//DEBUG_DRAW_GRAY.push(new DebugLine(bP0, bP1, 5));

//lineA.adjacent1 = lineB;



var aP0 = new vec2(-100, 100);
var aP1 = new vec2(100, 150);
var aNorm = aP1.subtract(aP0).perp().normalize();
if (aNorm.y >= 0) {
  aNorm = aNorm.negate();
}

var bP0 = aP1;
var bP1 = new vec2(300, 250);
var bNorm = bP1.subtract(bP0).perp().normalize();
if (bNorm.y >= 0) {
  bNorm = bNorm.negate();
}

var cP0 = bP1;
var cP1 = aP0
var cNorm = cP1.subtract(cP0).perp().normalize();
if (cNorm.y <= 0) {
  bNorm = bNorm.negate();
}
var lineA = new TerrainLine(aP0, aP1, "wahtever", null, null, aNorm);
var lineB = new TerrainLine(bP0, bP1, "wahtever", lineA, null, bNorm);
var lineC = new TerrainLine(cP0, cP1, "wahtever", lineB, lineA, cNorm);
DEBUG_DRAW_GRAY.push(new DebugLine(aP0, aP1, 5));
DEBUG_DRAW_GRAY.push(new DebugLine(bP0, bP1, 5));
DEBUG_DRAW_GRAY.push(new DebugLine(cP0, cP1, 5));

lineA.adjacent1 = lineB;
lineA.adjacent0 = lineC;
lineB.adjacent1 = lineC;


var currentLevel = new TerrainManager();
currentLevel.terrainList.push(lineA);
currentLevel.terrainList.push(lineB);
currentLevel.terrainList.push(lineC);


var physParams = new PhysParams(400, DFLT_lockThreshold, DFLT_autoLockThreshold, DFLT_surfaceSnapAngle, DFLT_pointLockRoundMinAngle, DFLT_bounceSpeedLossRatio);
var controlParams = new ControlParams(DFLT_gLRaccel, DFLT_aLRaccel, DFLT_aUaccel, DFLT_aDaccel, DFLT_gUaccel, DFLT_gDaccel, DFLT_gBoostLRvel, DFLT_aBoostLRvel, DFLT_aBoostDownVel, DFLT_jumpVelNormPulse, DFLT_doubleJumpVelYPulse, DFLT_doubleJumpVelYMin, DFLT_numAirCharges, 0.0, 100000000, 2, DFLT_jumpSurfaceSpeedLossRatio, DFLT_reverseAirJumpSpeed);
var playerModel = new PlayerModel(controlParams, physParams, 0.0, DFLT_radius, new vec2(0, 0), new vec2(0, 0), new vec2(0, 0), null);       //NEW
var physEng = new PhysEng("fuck you", playerModel);


var replayEvents = [];
replayEvents.push(new InputEventDown(20, true, 0.2));

physEng.loadReplay(replayEvents);

var i = 0;
physEng.start();


var TIME_TO_STEP_TO = 2.0;
while (physEng.getTime() < TIME_TO_STEP_TO) {
//while (i < 100) {
  physEng.stepDebug();
  i++;
  console.log("update " + i + ", getTime() " + physEng.getTime());
  console.log("-playerModel");
  playerModel.print("--");
  console.log("-predictedEventHeap, ", physEng.predictedEventHeap.size(), physEng.predictedEventHeap.heap);
  console.log(" ");
  console.log(" ");
}



