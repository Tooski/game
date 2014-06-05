/**
 * physMath.js
 *
 * Contains a shit ton of physics math. Finally decided to separate it out because I'm sick
 * of having to scroll up and down through physics to look at math methods while coding
 * physics flow code.
 *
 * @author Travis Drake
 * All rights reserved.
 */




/**
 * Steps either an angular or a normal state.
 */
function stepStateToTime(state, targetGameTime) {
  //console.log(" ! ! ! ! ! ! ! ! ! ! ! ! ! ! stepping state to time: ", state);
  if (state.point) {
    //console.log(" ! ! ! ! ! ! ! ! ! ! ! ! ! ! angular state step");
    return stepAngularStateToTime(state, targetGameTime);
  } else {
    //console.log(" ! ! ! ! ! ! ! ! ! ! ! ! ! ! normal state step");
    return stepNormalStateToTime(state, targetGameTime);
  }
}



// Universal method to step a state forward to a time, no logic involved.
function stepNormalStateToTime(state, targetGameTime) {
  var startTime = state.time;
  //console.log("in stepStateToTime. targetGameTime: ", targetGameTime);
  //console.log("startTime: ", state.time);
  //console.log("state: ", state);
  var deltaTime = targetGameTime - startTime;
  var multVel = state.vel.multf(deltaTime);
  var multAcc = state.accel.multf(deltaTime * deltaTime / 2);

  var newPos = state.pos.add(multVel.add(multAcc));

  var newVel = state.vel.add(state.accel.multf(deltaTime));

  return new State(targetGameTime, state.radius, newPos, newVel, state.accel);
}






// Steps the angular state to the targetTime.
function stepAngularStateToTime(aState, targetGameTime) {
  var startTime = aState.time;

  //// this thing is just useful for storing potential angular movement states of an object.
  //function AngularState(time, radius, pointCircling, angle, angularVel, angularAccel) {

  //  this.time = time;
  //  this.radius = radius;
  //  this.point = pointCircling;
  //  this.a = angle;
  //  this.aVel = angularVel;
  //  this.aAccel = angularAccel;
  //}

  var deltaTime = targetGameTime - startTime;

  var angleDelta = (aState.aVel * deltaTime + aState.aAccel * deltaTime * deltaTime / 2) / aState.radius;

  var endAngle = aState.a + angleDelta;
  while (endAngle >= TWO_PI) {
    endAngle = endAngle - TWO_PI;
  }
  while (endAngle < 0) {
    endAngle = endAngle + TWO_PI;
  }

  var endVel = aState.aVel + aState.aAccel * deltaTime;

  return new AngularState(targetGameTime, aState.radius, aState.point, endAngle, endVel, aState.aAccel);
}






// Steps the angular state by the signed angle.
// DONE???
function stepAngularStateByAngle(aState, signedAngle) {
  //// this thing is just useful for storing potential angular movement states of an object.
  //function AngularState(time, radius, pointCircling, angle, angularVel, angularAccel) {

  console.group("stepAngularStateByAngle, signedAngle " + signedAngle);
  console.log("<<<<<<<<<<<<<<< above angle should be > NEG_PI and < PI???");
  aState.print("");

  var circDist = signedAngle * aState.radius;
  console.log("circDist " + circDist);
  var deltaTime = solveTimeToDist1D(circDist, aState.aVel, aState.aAccel);
  if (!deltaTime) {
    console.log("bad time: ", deltaTime);
    //throw "bad time returned in stepAngularStateByAngle";
    console.groupEnd();
    return;
  } else if (deltaTime < 0) {
    console.log("negative time: ", deltaTime);
    console.groupEnd();
    return;
  }

  console.log("deltaTime " + deltaTime);

  var endAngle = aState.a + signedAngle;
  console.log("endAngle " + endAngle);

  var endVel = aState.aVel + aState.aAccel * deltaTime;
  console.log("endVel " + endVel);
  console.groupEnd();


  return new AngularState(aState.time + deltaTime, aState.radius, aState.point, endAngle, endVel, aState.aAccel);
}



/**
 * steps to an absolute angle.
 */
function stepAngularStateToAngle(aState, targetSignedAngle) {
  if (targetSignedAngle > Math.PI || targetSignedAngle < -Math.PI)  {
    console.log("targetSignedAngle " + targetSignedAngle);
    throw "not a signed angle";
  }
  console.group("stepAngularStateToAngle, CHECK ME");

  var startAngle = aState.a;
  var angleDelta = targetSignedAngle - startAngle;
  var sign = (angleDelta > 0 ? 1 : -1);
  console.log("target signed angle " + targetSignedAngle);
  console.log("startAngle " + startAngle);
  console.log("first angleDelta " + angleDelta);

  angleDelta = angleDelta * sign;
  if (angleDelta > Math.PI) {
    angleDelta = angleDelta - TWO_PI;
    console.log("flipping direction angleDelta " + angleDelta);
  } else if (angleDelta < 0) {
    throw "bad";
  }
  angleDelta = angleDelta * sign;
  console.log("final angleDelta " + angleDelta);

  var toReturn;
  if (angleDelta < ANGLE_EPSILON && angleDelta > -ANGLE_EPSILON) {  // its the same angle.
    console.log("its the same angle as starting angle. Should we try to arc back down to starting angle?");
    toReturn = stepAngularStateByAngle(aState, angleDelta);
  } else {
    toReturn = stepAngularStateByAngle(aState, angleDelta);
  }
  console.groupEnd();
  return toReturn;
}




/**
 * converts a signed angle to an absolute unsigned angle.
 */
function convertSignedAngleToUnsigned(signedAng) {
  if (signedAngle < 0) {
    while (signedAngle < 0) {
      signedAngle = TWO_PI + signedAng;
    }
    return signedAngle;
  } else {
    return signedAng % TWO_PI;
  }
}



/**
 * Helper function to get the surfaces corresponding to the closest endArc time.
 * returns { surface, nextSurface, state };
 */
function getSurfacesAtSoonestAngleTime(aState) {
  var startAngle = aState.a;
  console.log("getSurfacesAtSoonestAngleTime");
  console.group();
  console.log("aState: ", aState);
  console.log("aState.point.lines: ", aState.point.lines);

  var states = [];
  var angles = [];
  if (aState.point.lines.length < 2) {

    throw "not enough lines in aState.point.lines????";
  }
  for (var i = 0; i < aState.point.lines.length; i++) {
    angles[i] = aState.point.lines[i].normal.sangle();
    console.log("attempting to step aState to angles[i]: ", angles[i]);
    states[i] = stepAngularStateToAngle(aState, angles[i]);
    console.log("resulting in state: ", states[i]);
  }


  var earliestTime = 10000000000;
  var toReturn = {};

  for (var i = 0; i < aState.point.lines.length; i++) {
    if (states[i] && states[i].time < earliestTime) {
      toReturn.nextSurface = aState.point.lines[i];
      toReturn.state = states[i];
      earliestTime = states[i].time;
    }
  }


  console.log("returning: ", toReturn);
  console.groupEnd();
  return toReturn;
}





function convertAngularToNormalState(aState) {
  //var posVec = vecFromAngleLength(aState.a, aState.radius);

  var pos = vecFromPointDistAngle(aState.point, aState.radius, aState.a);

  var vel;
  if (aState.aVel > 0) {
    vel = vecFromAngleLength(aState.a + HALF_PI, aState.aVel);
  } else {
    vel = vecFromAngleLength(aState.a + Math.PI + HALF_PI, -aState.aVel);
  }

  var accel;
  if (aState.aAccel > 0) {
    accel = vecFromAngleLength(aState.a + HALF_PI, aState.aAccel);
  } else {
    accel = vecFromAngleLength(aState.a + Math.PI + HALF_PI, -aState.aAccel);
  }

  return new State(aState.time, aState.radius, pos, vel, accel);
}





function vecToRadial(angleDirVec, velVec, accelVec) {
  var angle = angleDirVec.sangle();
  var aVel;
  var aAccel;


  var d = angleDirVec;
  var v = velVec;
  var a = accelVec;


  // so long as we have a vel, get aVel
  if (velVec.lengthsq() > 0) {
    // get vel angle
    if (d.x > 0) {            // positive d.x
      if (v.y >= 0) {           //positive aVel
        aVel = v.length();
      } else {                  //neg aVel
        aVel = -v.length();
      }
    } else if (d.x < 0) {     // negative d.x
      if (v.y <= 0) {           //positive aVel
        aVel = v.length();
      } else {                  //neg aVel
        aVel = -v.length();
      }
    } else {                  //        0 d.x, use d.y and v.x
      if (d.y > 0) {            // positive d.x
        if (v.x < 0) {           //positive aVel
          aVel = v.length();
        } else {                  //neg aVel
          aVel = -v.length();
        }
      } else if (d.y < 0) {     // negative d.x
        if (v.x > 0) {           //positive aVel
          aVel = v.length();
        } else {                  //neg aVel
          aVel = -v.length();
        }
      }
    }
  } else { aVel = 0; }                // vel length was 0, set this to 0.



  // so long as we have an accel, get aAccel
  if (accelVec.lengthsq() > 0) {
    // get accel angle
    if (d.x > 0) {            // positive d.x
      if (a.y >= 0) {           // then positive aAccel
        aAccel = a.length();
      } else {                  // then neg aAccel
        aAccel = -a.length();
      }
    } else if (d.x < 0) {     // negative d.x
      if (a.y <= 0) {           // then positive aAccel
        aAccel = a.length();
      } else {                  // then neg aAccel
        aAccel = -a.length();
      }
    } else {                  //        0 d.x, use d.y and a.x
      if (d.y > 0) {            // positive d.y
        if (a.x < 0) {           // then pos aAccel
          aAccel = a.length();
        } else {                  // then neg aAccel
          aAccel = -a.length();
        }
      } else if (d.y < 0) {     // negative d.x
        if (a.x > 0) {           // then positive aAccel
          aAccel = a.length();
        } else {                  // then neg aVel
          aAccel = -a.length();
        }
      }
    }
  } else { aAccel = 0; }          // Accel length was 0, set this to 0.
  
  return { sAngle: angle, aVel: aVel, aAccel: aAccel };
}



//function convertNormalToAngularState(state, point) {
//}





//GET REFLECTION VECTOR. velVec = vector to get the reflection of. normalVec, the normal of the surface that you're reflecting off of. TODO possibly a bug if velVec isnt normalized for the function and then length remultiplied at the end? P sure this is right but if bounces are buggy start here.
function getReflectionVector(velVec, normalVec) {
  //     v' = 2 * (v . n) * n - v;

  // SINGLE LINE OPTIMIZED
  return (velVec).subtract(normalVec.multf(2.0 * velVec.dot(normalVec)));
  //return normalVec.multf(2.0 * velVec.dot(normalVec)).subtract(velVec);                OLD
}





/**
 * gets the time that it takes a ball with the given velocity to go from the given angle to the targetAngle.
 */
function getTimeToAngle(radius, velocity, startAngle, targetAngle) {
  //var 2 * Math.PI
}


//TEST REFLECTION
//var toReflect = new vec2(19, 31);   //moving down and right
//var theNormal = new vec2(-1, .5).normalize();    //normal facing straight up
//console.log("reflection ", getReflectionVector(toReflect, theNormal));




// finds the roots of a quadratic function ax^2 + bx + c
function solveQuadratic(a, b, c) {
  console.log("          in solveQuadratic: a ", a, ",  b ", b, ",  c ", c);
  var roots = [];
  //calculate

  if (a === 0) {
    var root = -c / b;
    return [root, root];

  } else {
    var d = (b * b) - (4 * a * c);

    if (d < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("            roots are imaginary.... a ", a, ", b ", b, ", c ", c);
      return null;
    } else {
      //calculate roots
      var bNeg = -b;
      var aDoubled = 2 * a;
      var t = Math.sqrt(d);
      var y = (bNeg + t) / (aDoubled);
      var z = (bNeg - t) / (aDoubled);
      //console.log("roots are ", y, ", ", z);
      roots.push(y);
      roots.push(z);
    }
    return roots;
  }
}



/**
 * Solves the time that it will take the provided state to reach either end of the surface.
 * returns { pointNumber: 0 or 1, time }
 */
function solveEarliestSurfaceEndpoint(state, surface) {
  if (!state || !surface) {
    throw "missing params " + state + surface;
  }
  
  console.log("solving earliest surface endpoint, ");
  console.group();
  console.log("state ", state);
  console.log("surface ", surface);

  //return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
  //getStateAndDistancesAlignedWithLine(state, targetLine)
  var results = getStateAndDistancesAlignedWithLine(state, surface);
  console.log("getStateAndDistancesAlignedWithLine results ", results);

  //var distance0 = rotateResults.rotP0.y - rotated.pos.y;
  //var distance1 = rotateResults.rotP1.y - rotated.pos.y;
  var time0 = solveTimeToDist1D(results.distanceP0, results.parallelVel, results.parallelAccel);
  var time1 = solveTimeToDist1D(results.distanceP1, results.parallelVel, results.parallelAccel);
  //console.log("curPos: ", curPos);
  //console.log("curVel: ", curVel);
  //console.log("accel: ", accel);
  //console.log("targetLine: ", targetLine);
  //console.log("distanceGoal: ", distanceGoal);

  //console.log("rotated: ", rotated);
  //console.log("distance: ", distance);
  console.log("time0 at: ", time0);
  console.log("time1 at: ", time1);
  var closestPos = closestPositive(time0, time1);
  console.log("closestPos", closestPos);
  var data;

  if (closestPos === undefined || closestPos === null) {
  } else if (closestPos === time0) {
    data = { pointNumber: 0, time: state.time + time0 };
  } else if (closestPos === time1) {
    data = { pointNumber: 1, time: state.time + time1 };
  } else {
    throw "what the balls man, closest positive isnt time0, time1, or null???";
  }
  console.log("solved earliest surface endpoint. results:  ", data);
  console.groupEnd();

  return data;
}





















/**
 * Solves the time that it will take the provided state to reach the next surface, if it will.
 * returns { adjNumber: 0 or 1, time, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
 * null if none in positive time or both not concave.
 */
function getNextSurfaceData(state, surface) {
  var data = null;
  var time0 = null;
  var time1 = null;
  console.group("getNextSurfaceData, pay attention to me you fucker");
  // concave result { concave: t / f, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
  var concRes0 = getLineLineConcavity(surface, surface.adjacent0, state.position);
  var concRes1 = getLineLineConcavity(surface, surface.adjacent1, state.position);

  console.log("concRes0: ", concRes0);
  console.log("concRes1: ", concRes1);

  if (concRes0 && concRes0.concave) {

    time0 = solveTimeToDistFromLine(state.pos, state.vel, state.accel, surface.adjacent0, state.radius);
  }
  if (concRes1 && concRes1.concave) {

    time1 = solveTimeToDistFromLine(state.pos, state.vel, state.accel, surface.adjacent1, state.radius);
  }

  var closestPos = closestPositive(time0, time1);
  if (closestPos === undefined || closestPos === null) {
    //throw "yay null this might be okay but have an exception anyway!";
  } else if (closestPos === time0) {
    console.log("closestPos: ", closestPos);
    console.log("concRes0: ", concRes0);
    console.log("time0: ", time0);
    data = { adjNumber: 0, time: state.time + time0, angle: concRes0.angle };
  } else if (closestPos === time1) {
    console.log("closestPos: ", closestPos);
    console.log("concRes1: ", concRes1);
    console.log("time1: ", time1);
    data = { adjNumber: 1, time: state.time + time1, angle: concRes1.angle };
  } else {
    throw "what the balls man, closest positive isnt time0, time1, or null???";
  }
  console.groupEnd();
  return data;
}



/*
 * Gets the amount of time taken to travel the specified distance at the current velocity and acceleration. 1 dimensional.
 * assumes the starting position is at 0.
 */
function solveTimeToDist1D(targetDist, currentVelocity, acceleration) {
  console.log("solving time to dist 1D,");
  console.group();
  console.log("solveTimeToDist1D.  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);

  targetDist = -targetDist;

  var time;

  if (acceleration === 0) {

    time = -targetDist / currentVelocity;
    if (time <= 0) {
      console.groupEnd();
      return time;
    }

  } else {
    var x = (currentVelocity * currentVelocity) - (2 * acceleration * targetDist);
    var y;
    var z;
    if (x < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("timeToDist1D: roots are imaginary, not gonna exit surface.");
      console.groupEnd();
      return time;
    } else {
      //calculate roots
      //console.log("x: ", x);
      var velNeg = -currentVelocity;
      //console.log("velNeg: ", velNeg);
      var t = Math.sqrt(x);
      //console.log("t: ", t);
      y = (velNeg + t) / (acceleration);  //root 1
      z = (velNeg - t) / (acceleration);  //root 2
      console.log("possible time distances are ", y, ", ", z);

      time = closestPositive(y, z);
    }
  }
  console.groupEnd();
  //console.log("        solved time to dist 1D. Time at:  ", time);
  return time;
}





function getLineCollisionTime(state, line) {
  console.log("getLineCollisionTime()");
  console.group();
  var futureTime = solveTimeToDistFromLine(state.pos, state.vel, state.accel, line, state.radius);
  console.log("futureTime", futureTime);
  console.log("state.time", state.time);
  console.groupEnd();
  if (!(futureTime >= 0)) {
    if (futureTime <= 0) {
      return state.time + futureTime;
    } else return;
  } else {
    return state.time + futureTime;
  }

}



function getCircleCollisionTime(state, circle) {
  var time = solveTimeToDistFromPoint(state.pos, state.vel, state.accel, circle, circle.radius + state.radius);
  if (time) {
    return state.time + time;
  } else {
    return null;
  }
}



function getPointCollisionTime(state, point) { //copy pasta from below.
  var c = -(state.pos.subtract(point).length()) + state.radius;
  var rootsArray = solveQuadratic(state.accel.length() / 2, state.vel.length(), c); //TODO DEBUG PRINT STATEMENTS AND VERIFY THIS IS CORRECT, PROBABLY WRONG. DOES THIS ACTUALLY WORK? WAS IT REALLY THIS EASYYYY????????

  //console.log("solveTimeToDistFromPoint.   accel.length() ", accel.length(), ", curVel.length() ", curVel.length(), ", curPos ", curPos, ", targetPos ", targetPos, ", distanceGoal ", distanceGoal);
  //console.log("   possible time distances are ", rootsArray[0], ", ", rootsArray[1]);
  var time = (rootsArray === null ? null : closestPositive(rootsArray[0], rootsArray[1]));

  //console.log("      solved time to dist from point. Time at:  ", time);
  if (time === null) {
    return null;
  } else {
    return state.time + time;
  }
}



//Generally, targetPos is the point and distanceGoal is radius (we want to find the time when balls center point is exactly radius away from the targetPos)
//Returns the nearest positive point in time when this will occur, or null if it wont occur.
function solveTimeToDistFromPoint(curPos, curVel, accel, targetPos, distanceGoal) {
  /* (p1-(p2+vt + (1/2 * a*t^2))) = r
     -(p2+vt + (1/2 * a*t^2)) = r - p1
     -p2-vt - (1/2 * a*t^2) = r - p1
     -vt - (1/2 * a*t^2) = r - p1 + p2
     vt + (1/2 * a*t^2) = (p1 - p2) - r
        Now since ||d|| = ||b||+||c|| when d = b+c, we know that
  
     ||v||t + 1/2 * ||a||t^2 = ||p1-p2|| - r
     ||v||t + 1/2 * ||a||t^2	- ||p1-p2|| + r = 0										//NEW,	roots are when this = 0. Yields solution????
   */

  //console.log("      solving time to dist from point, ");
  //console.log("        curPos ", curPos);
  //console.log("        curVel ", curVel);
  //console.log("        accel ", accel);
  //console.log("        targetPos ", targetPos);
  //console.log("        distanceGoal ", distanceGoal);


  var c = -(curPos.subtract(targetPos).length()) + distanceGoal;
  var rootsArray = solveQuadratic(accel.length() / 2, curVel.length(), c); //TODO DEBUG PRINT STATEMENTS AND VERIFY THIS IS CORRECT, PROBABLY WRONG. DOES THIS ACTUALLY WORK? WAS IT REALLY THIS EASYYYY????????

  //console.log("solveTimeToDistFromPoint.   accel.length() ", accel.length(), ", curVel.length() ", curVel.length(), ", curPos ", curPos, ", targetPos ", targetPos, ", distanceGoal ", distanceGoal);
  //console.log("   possible time distances are ", rootsArray[0], ", ", rootsArray[1]);
  var time = (rootsArray === null ? null : closestPositive(rootsArray[0], rootsArray[1]));

  //console.log("      solved time to dist from point. Time at:  ", time);
  return time;
}



////CODE TO TEST solveTimeToDistFromLine
//console.log("DOING THE THING");
//console.log("DOING THE THING");
//console.log("DOING THE THING");
//console.log("DOING THE THING");
//var pos = new vec2(15, 10);
//var vel =  new vec2(-13, -5);
//var accel = new vec2(4, -10.0000);
//var rad = 5;

//var t0 = new vec2(-50, 0);
//var t1 = new vec2(50, -120);
//var n = t1.subtract(t0).perp().normalize();
//var ter = new TerrainLine(t0, t1, null, null, null, n);

//var test = solveTimeToDistFromLine(pos, vel, accel, ter, rad);
//console.log(test);
//throw "nothing else run fgt";




/**
 * Solves the time it will take a ball from curPos to reach the specified distance from the line.
 */
function solveTimeToDistFromLine(curPos, curVel, accel, targetLine, distanceGoal) {
  console.group("solving time to dist from line, ");
  console.log("curPos {", curPos.x, curPos.y, "}   curVel {", curVel.x, curVel.y, "}   accel {", accel.x, accel.y, "}");
  console.log("targetLine", targetLine);
  console.log("distanceGoal ", distanceGoal);

  var tempState = new State(0.0, distanceGoal, curPos, curVel, accel);

  //return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
  //getStateAndDistancesAlignedWithLine(state, targetLine)
  var results = getStateAndDistancesAlignedWithLine(tempState, targetLine);
  //DEBUG_DRAW_LIGHTBLUE.push(new DebugLine(targetLine.p0, targetLine.p1, 5));
  console.log("results: ", results);
  var distance = (results.distancePerp > 0 ? results.distancePerp - distanceGoal : results.distancePerp + distanceGoal);
  var time = solveTimeToDist1D(distance, results.perpVel, results.perpAccel);



  console.log("solved time to dist from line. Time delta:  ", time);
  console.groupEnd();
  return time;
}




function getDistFromLine(point, line) {
  var pA = line.p0;              // TerrainLine point 1
  var pB = line.p1;              // TerrainLine point 2
  var pC = point;                // center of the ball

  var vAB = pB.subtract(pA);     // vector from A to B
  var vAC = pC.subtract(pA);     // vector from A to the ball
  var vBC = pC.subtract(pB);     // vector from B to the ball
  //console.log(pA + " " + pB + " " + pC);
  var vAD = projectVec2(vAC, vAB); //project the vector to the ball onto the surface.
  var pD = pA.add(vAD);            // find the perpendicular intersect of the surface.
  var vCD = pC.subtract(pD);       // find the vector from ball to the perpendicular intersection.
  return vCD.length();
}






///**
// * helper function that returns a bunch of bullshit.
// * returns returns { rotState, rotP0, rotP1 };
// */
//function getRotatedToXAroundState(state, targetLine) {
//  var v01 = targetLine.p1.subtract(targetLine.p0);
//  console.log(v01);
//  console.log(targetLine);
//  console.log(origin);
//  var radiansToHorizontal = getRadiansToHorizontal(v01);

//  //console.log("radiansToHorizontal: ", radiansToHorizontal);
//  //console.log("to degrees: ", radiansToHorizontal * 180 / Math.PI);

//  var rMat = getRotationMatRad(radiansToHorizontal);

//  var newPos = (curPos.subtract(targetLine.p0).multm(rMat));
//  //console.log("oldPos: ", curPos);
//  //console.log("rotated newPos: ", newPos);


//  //console.log("rotated newP1: ", v01);

//  var newVel = curVel.multm(rMat);
//  //console.log("rotated newVel: ", newVel);

//  var newAccel = accel.multm(rMat);
//  //console.log("rotated newAccel: ", newAccel);
//  var results = { pos: newPos, vel: newVel, accel: newAccel };

//  return results;
//}









////unit testing for getRotatedToYAroundState
//var testPos = new vec2(50, 50);
//var testVel = new vec2(1, 1);
//var testAccel = new vec2(-3, 0);
//var testState = new State(0.0, 1, testPos, testVel, testAccel);
//var testLine = new TerrainLine


//var aP0 = new vec2(-50, -100);
//var aP1 = new vec2(150, 100);
//var aNorm = aP1.subtract(aP0).perp().normalize();
//if (aNorm.y >= 0) {
//  aNorm = aNorm.negate();
//}
//var testLine = new TerrainLine(aP0, aP1, "wahtever", null, null, aNorm);

//var data = getStateAndDistancesAlignedWithLine(testState, testLine);
//console.log(data);

////var bP0 = new vec2(100, 100);
////var bP1 = new vec2(300, -100);
////var bNorm = bP1.subtract(bP0).perp().normalize();
////if (bNorm.y >= 0) {
////  bNorm = bNorm.negate();
////}
////var lineB = new TerrainLine(bP0, bP1, "wahtever", lineA, null, bNorm);
////lineA.adjacent1 = lineB;

//throw "testing";









/**
 * helper function that returns a bunch of bullshit. Rotates so that the targetLine is horizontal, so that distance is measureable by the y value.
 * returns relative values.
 * @return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
 */
function getStateAndDistancesAlignedWithLine(state, targetLine) {
  var v01 = targetLine.p1.subtract(targetLine.p0);
  var radiansToHorizontal = getRadiansToHorizontal(v01);
  //console.log("               getStateAndDistancesAlignedWithLine of surface = ", radiansToHorizontal);


  var rMat = getRotationMatRad(radiansToHorizontal);

  var newP0 = (targetLine.p0.subtract(state.pos).multm(rMat));
  var newP1 = (targetLine.p1.subtract(state.pos).multm(rMat));
  //console.log("oldPos: ", curPos);
  //console.log("rotated newPos: ", newPos);


  //console.log("rotated newP1: ", v01);

  var newVel = state.vel.multm(rMat);
  //console.log("rotated newVel: ", newVel);

  var newAccel = state.accel.multm(rMat);
  //console.log("rotated newAccel: ", newAccel);
  var results = { parallelVel: newVel.x, perpVel: newVel.y, parallelAccel: newAccel.x, perpAccel: newAccel.y, distancePerp: newP0.y, distanceP0: newP0.x, distanceP1: newP1.x };

  return results;
}



/**
 * helper function to be more simple and useable than getRotatedToX/YAroundState.
 * returns 
 */
function getRelative1DLineData(state, targetLine) {
  var results = getRotatedToYAroundState(state, targetLine); // results { rotState, rotP0, rotP1 };
  var distance = results.rotP0.x;
  var velocity = results.rotState.vel;
  var accel = results.rotState.accel;
}



/*
 * finds the time at which the states velocity will reach velTarget.
 */
function getTimeToVelocity(state, velTarget) {
  if (!(state.time && state.vel && state.accel && velTarget)) {
    console.log("Missing fields in state.");
    console.log("time: ", state.time);
    console.log("vel: ", state.vel);
    console.log("accel: ", state.accel);
    console.log("velTarget: ", velTarget);
    throw "Missing fields in state.";
  }
  var ax = state.accel.x;
  var ay = state.accel.y;
  var vx = state.vel.x;
  var vy = state.vel.y;
  var s = velTarget;

  var postRad = 2 * ax * vx + 2 * ay * vy;

  var radical = sqrt(postRad * postRad - 4 * (ax * ax + ay * ay) * ((-(s * s)) + vx * vx + vy * vy));
  var denominator = 2 * (ax * ax + ay * ay);

  var t0 = (-radical - postRad) / denominator; //root 0
  var t1 = (radical - postRad) / denominator;  //root 1

  return closestPositive(t0, t1) + state.time;				// null if no valid roots.
}




function closestPositive(value1, value2) {
  var toReturn = null;

  //console.log("            Closest positive, ", "value1:  ", value1, "value2:  ", value2);
  if (value1 == null && value2 > 0) {      //handle nulls.
    return value2;
  } else if (value2 == null && value1 > 0) {
    return value1;
  }



  if (value1 <= 0) {            // is value1 negative?     //hackey bullshit to stop infinite looping???? TODO ????
    if (value2 <= 0) {
      toReturn = null;        // NO VALID ROOT, BOTH ARE BACKWARDS IN TIME
      console.log("         NO VALID ROOT, BOTH ARE BACKWARDS IN TIME, v1: ", value1, ", v2: ", value2);
    } else {
      toReturn = value2;           // value1 < 0 and value2 > 0 return value2
      //console.log("   value1 < 0 and value2 > 0 return value2, v1: ", value1, ", v2: ", value2);
    }
  } else if (value2 <= TIME_EPSILON) {     // is value2 negative? we know value1 is positive.
    toReturn = value1;             // value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1
    //console.log("   value1 WASNT NEGATIVE AND value2 WAS SO RETURN value1, v1: ", value1, ", v2: ", value2);
  } else if (value1 > value2) {     // value1 and value2 are both positive, return the smaller one
    toReturn = value2;             // value2 occurs earlier
    //console.log("   value1 and value2 are both positive, return the smaller one. value2 occurs earlier, v1: ", value1, ", v2: ", value2);
  } else {
    toReturn = value1;             // value1 occurs earlier
    //console.log("   value1 and value2 are both positive, return the smaller one. value1 occurs earlier, v1: ", value1, ", v2: ", value2);
  }
  //console.log("   returning closest: ", toReturn);
  return toReturn;                          //TODO DEBUG could be totally wrong with this, may require a different test.
}






// CONCAVITY TESTING
var U = 1;
var D = -1;

function L (x0, y0, x1, y1, upOrDown) {
  this.p0 = new vec2(x0, y0);
  this.p1 = new vec2(x1, y1);
  this.normal = genNormal(this, upOrDown);
}




function pointsEqual(p0, p1) {
  if (p0.id && p1.id) {
    return (p0.id === p1.id);
  } else {
    return (p0.x === p1.x && p0.y === p1.y);
  }
}




function genNormal(surface, upOrDown) {
  var surfVec = surface.p1.subtract(surface.p0).normalize();
  var possNorm = surfVec.perp();
  if (possNorm.y !== 0) {     // Point up if U or down if D
    if ((upOrDown > 0 && possNorm.y < 0) || (upOrDown < 0 && possNorm.y > 0)) {
      possNorm = possNorm.negate();
    }
  } else {                    // Point left if U or right if D
    if ((upOrDown > 0 && possNorm.x < 0) || (upOrDown < 0 && possNorm.x > 0)) {
      possNorm = possNorm.negate();
    }
  }
  return possNorm;
}





function getLineLineConcavity(line0, line1, referencePos) {
//  console.log("start getLineLineConcavity");
//  console.group();
  var vec0;
  var vec1;
  var intersect;

  if (pointsEqual(line0.p0, line1.p1)) {
//    console.log("line0.p0 and line1.p1 shared");
    intersect = line0.p0;
    vec0 = line0.p1.subtract(intersect);
    vec1 = line1.p0.subtract(intersect);
  } else if (pointsEqual(line0.p1, line1.p0)) {
//    console.log("line0.p1 and line1.p0 shared");
    intersect = line0.p1;
    vec0 = line0.p0.subtract(intersect);
    vec1 = line1.p1.subtract(intersect);
  } else if (pointsEqual(line0.p1, line1.p1)) {   // BAD CASE
    intersect = line0.p1;
    vec0 = line0.p0.subtract(intersect);
    vec1 = line1.p0.subtract(intersect);

//    console.log(line0, line1);
//    throw "wrong points equal????";

  } else if (pointsEqual(line0.p0, line1.p0)) {   // BAD CASE
    intersect = line0.p0;
    vec0 = line0.p1.subtract(intersect);
    vec1 = line1.p1.subtract(intersect);

    console.log(line0, line1);
    throw "wrong points equal????";

  } else {                                                // the serious one
//    console.log("no shared points, find intersect");
    intersect = getLineLineIntersect(line0, line1);
    vec0 = line0.p1.subtract(intersect);
    vec1 = line1.p0.subtract(intersect);
    if (bisects(intersect, line0)) {
//      console.log("bisects line0, projecting pos");      
      vec0 = projectVec2(referencePos.subtract(intersect), vec0);
    } 
    if (bisects(intersect, line1)) {
//      console.log("bisects line1, projecting pos");
      vec1 = projectVec2(referencePos.subtract(intersect), vec1);
    } 
  }
//  console.log("intersect ", intersect);
//
//
//  console.log("vec0 ", vec0);
//  console.log("vec1 ", vec1);

  var vec0n = vec0.normalize();
  var vec1n = vec1.normalize();
//
//  console.log("vec0n ", vec0n);
//  console.log("vec1n ", vec1n);



  // CREDIT TO Y2KK FOR STRATS
  var normTestLine1 = new L(vec0n.x, vec0n.y, vec0n.x + line0.normal.x, vec0n.y + line0.normal.y);
  var normTestLine2 = new L(vec1n.x, vec1n.y, vec1n.x + line1.normal.x, vec1n.y + line1.normal.y);
  var normTestIntersect = getLineLineIntersect(normTestLine1, normTestLine2);

//  console.log("normTestIntersect ", normTestIntersect);

  var intVec0 = normTestIntersect.subtract(vec0n);
  var intVec1 = normTestIntersect.subtract(vec1n);
//  console.log("intVec0 ", intVec0);
//  console.log("intVec1 ", intVec1);
  
  var sameDir0 = (((intVec0.x > 0 && line0.normal.x > 0) || (intVec0.x <= 0 && line0.normal.x <= 0)) && 
                 ((intVec0.y > 0 && line0.normal.y > 0) || (intVec0.y <= 0 && line0.normal.y <= 0)));
  var sameDir1 = (((intVec1.x > 0 && line1.normal.x > 0) || (intVec1.x <= 0 && line1.normal.x <= 0)) && 
                 ((intVec1.y > 0 && line1.normal.y > 0) || (intVec1.y <= 0 && line1.normal.y <= 0)));
//  console.log("sameDir0 " + sameDir0);
//  console.log("sameDir1 " + sameDir1);
  var toReturn = {};

  if (sameDir0 && sameDir1) {           // nigga we concave
    toReturn.concave = true;
    toReturn.convex = false;
    toReturn.badConcavity = false;
  } else if (!(sameDir0 || sameDir1)) { // nigga we convex
    toReturn.concave = false;
    toReturn.convex = true;
    toReturn.badConcavity = false;
  } else {                              // oh shiiiiiiiiit nigga we undefined
    toReturn.concave = false;
    toReturn.convex = false;
    toReturn.badConcavity = true;
  }

  toReturn.angle = Math.acos(vec0.dot(vec1));
  if (toReturn.convex) {
    toReturn.angle = TWO_PI - toReturn.angle;
  }
  console.groupEnd();
  // var result = { concave: t/f, convex: t/f, badConcavity: t/f, angle: angle extending from one normal to the other, or smallest angle in case of undefined concavity }
  return toReturn;
}


// assert that this point lies on the line....
function bisects(point, line) {
  var minX = line.p0.x > line.p1.x ? line.p1.x : line.p0.x;
  var maxX = line.p0.x <= line.p1.x ? line.p1.x : line.p0.x;
  var minY = line.p0.y > line.p1.y ? line.p1.y : line.p0.y;
  var maxY = line.p0.y <= line.p1.y ? line.p1.y : line.p0.y;

  if (point.x > minX && point.x < maxX && point.y > minY && point.y < maxY) {
    return true;
  } else {
    return false;
  }
}



function getLineLineIntersect(line0, line1) {
/*
  var v0 = line0.p0.subtract(line0.p1);
  var m0 = v0.y / v0.x;
  var b0 = line0.p0.y - m0 * line0.p0.x;    // y = mx + b


  var v1 = line1.p0.subtract(line1.p1);
  var m1 = v1.y / v1.x;
  var b1 = line1.p0.y - m1 * line1.p0.x;    // y = mx + b


  // m0*x + b0 = m1*x + b1      equation to find convergent x point

  // (m0 - m1)*x = b1 - b0
  var b01 = b1 - b0;                
  var xCoef = m0 - m1;
  
  // x = (b1 - b0) / (m0 - m1)
  var x = b01 / xCoef;
  var y = m0 * x + b0;
  return new vec2(x, y);

  ^ human readable code
  v Optimized code */

  var v0 = line0.p0.subtract(line0.p1);
  var m0 = v0.y / v0.x;
  var b0 = line0.p0.y - m0 * line0.p0.x;    // y = mx + b


  var v1 = line1.p0.subtract(line1.p1);
  var m1 = v1.y / v1.x;
  var b1 = line1.p0.y - m1 * line1.p0.x;    // y = mx + b


  // m0*x + b0 = m1*x + b1      equation to find convergent x point
  var x = (b1 - b0) / (m0 - m1);
  return new vec2(x,  m0 * x + b0);
}





function getPolygonArrayFromLine(line) {

  var start = line;
  var itr = line;
  var polygonArray = [];
  var infiniteCheck = 2000;
  do {
    polygonArray.push(itr);
    itr = itr.adjacent0;
    infiniteCheck--;
  } while (itr != start && infiniteCheck > 0);
  if (infiniteCheck === 0) {
    console.log(polygonArray);
    throw "either we had 2000 lines in a polygon, or there is a cycle. ^";
  }
  return polygonArray;
}



/*







*/