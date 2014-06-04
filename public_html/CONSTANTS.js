

//CONSTANTS
var HALF_PI = Math.PI / 2.0;        // AKA 90 DEGREES IN RADIANS
var HALF_PI_NEG = -Math.PI / 2.0;   // AKA -90 DEGREES IN RADIANS
var TWO_PI = Math.PI * 2.0;


var TIME_EPSILON = 0.00000001;
var TIME_EPSILON_SQ = TIME_EPSILON * TIME_EPSILON;
var COLLISION_EPSILON_SQ = 0.0000; // fuck the police
var ANGLE_EPSILON = 0.000001;
//var ARC_RADIUS_PADDING = 0.001;




//DEFAULT PHYSICS VALS, TWEAK HERE
// WIDTH  = 1920 UNITS
// HEIGHT = 1080 UNITS
var DFLT_gravity = 900;        // FORCE EXERTED BY GRAVITY IS 400 ADDITIONAL UNITS OF VELOCITY DOWNWARD PER SECOND. 

var DFLT_lockThreshold = 1600;
var DFLT_autoLockThreshold = 1000;

var DFLT_pointLockRoundMinAngle = -(45 / 180) * Math.PI + Math.PI;


//angle between surfaces at which the player continues onto the next surface whether locked or not.
var DFLT_surfaceSnapAngle = -(45 / 180) * Math.PI + Math.PI;

var DFLT_JUMP_HOLD_TIME = 0.15; // To jump full height, jump must be held for this long. Anything less creates a fraction of the jump height based on the fraction of the full time the button was held. TODO implement.

// CONST ACCEL INPUTS
var DFLT_gLRaccel = 800;
var DFLT_aLRaccel = 300;
var DFLT_aUaccel = 200;
var DFLT_aDaccel = 300;
var DFLT_gUaccel = 300;
var DFLT_gDaccel = 400;
var DFLT_gBoostLRvel = 1500;
var DFLT_aBoostLRvel = 1500;
var DFLT_aBoostDownVel = 1500;

// CONST PULSE INPUTS
var DFLT_jumpVelNormPulse = 1000;
var DFLT_doubleJumpVelYPulse = 800;
var DFLT_doubleJumpVelYMin = 600;

// OTHER CHAR DEFAULTS
var DFLT_numAirCharges = 1;
var DFLT_radius = 1920 / 32;

// CONST RATIOS
var DFLT_jumpSurfaceSpeedLossRatio = 0.7;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 
var DFLT_bounceSpeedLossRatio = 0.8;
var DFLT_reverseAirJumpSpeed = 300;






// LEVEL DEFAULTS
var DFLT_collectibleValue = 100;




// VECTOR / ROTATIONAL CONSTANTS
var HORIZ_NORM = new vec2(1, 0, true);
var VERT_NORM = new vec2(0, 1, true);
var ORIGIN = new vec2(0, 0, false);

var ROT_EPSILON = 0.000000001;