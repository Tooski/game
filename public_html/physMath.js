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
 * Steps either an angular 
 */
function stepStateToTime(state, targetGameTime) {
  console.log(" ! ! ! ! ! ! ! ! ! ! ! ! ! ! stepping state to time: ", state);
  if (state.point) {
    console.log(" ! ! ! ! ! ! ! ! ! ! ! ! ! ! angular state step");
    return stepAngularStateToTime(state, targetGameTime);
  } else {
    console.log(" ! ! ! ! ! ! ! ! ! ! ! ! ! ! normal state step");
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

  var angleDelta = (aState.aVel * deltaTime + aState.aAccel * deltaTime * deltaTime) / aState.radius;

  var endAngle = aState.a + angleDelta;

  var endVel = aState.aVel + aState.aAccel * deltaTime;

  return new AngularState(targetGameTime, aState.radius, aState.point, endAngle, endVel, aState.aAccel);
}






// Steps the angular state by the angle.
// DONE???
function stepAngularStateByAngle(aState, angle) {

  //// this thing is just useful for storing potential angular movement states of an object.
  //function AngularState(time, radius, pointCircling, angle, angularVel, angularAccel) {

  //  this.time = time;
  //  this.radius = radius;
  //  this.point = pointCircling;
  //  this.a = angle;
  //  this.aVel = angularVel;
  //  this.aAccel = angularAccel;
  //}
  console.log(" * * * * * * * stepAngularStateByAngle, angle " + angle);
  console.log(" * * * * * * * aState " + aState);
  var circDist = angle * aState.radius;

  console.log(" * * * * * * * circDist " + circDist);

  var deltaTime = solveTimeToDist1D(circDist, aState.aVel, aState.aAccel);
  console.log(" * * * * * * * deltaTime " + deltaTime);

  var endAngle = aState.a + angle;
  console.log(" * * * * * * * endAngle " + endAngle);

  var endVel = aState.aVel + aState.aAccel * deltaTime;
  console.log(" * * * * * * * endVel " + endVel);

  if (!(deltaTime >= 0)) {
    console.log("bad time: ", deltaTime);
    throw "bad time returned in stepAngularStateByAngle";
  }

  return new AngularState(aState.time + deltaTime, aState.radius, aState.point, endAngle, endVel, aState.aAccel);
}



/**
 * Helper function to get the surfaces corresponding to the closest endArc time.
 * returns { surface, nextSurface, state };
 */
function getSurfacesAtSoonestAngleTime(aState, surface1, surface2) {
  var startAngle = aState.a;
  var angle1 = null;
  var angle2 = null;
  var state1 = null;
  var state2 = null;

  console.log("      -_-_-_-_-    aState: ", aState);
  console.log("      -_-_-_-_-    surface1: ", surface1);
  console.log("      -_-_-_-_-    surface2: ", surface2);
  var toReturn = null;

  if (surface1) {
    if (surface2) {
      console.log("      =-=-=-=-=-= both surfaces. ");
      angle1 = surface1.normal.angle();
      angle2 = surface2.normal.angle();
      state1 = stepAngularStateByAngle(aState, angle1);
      state2 = stepAngularStateByAngle(aState, angle2);
      console.log("      =-=-=-=-=-= angle1 ", angle1);
      console.log("      =-=-=-=-=-= angle2 ", angle2);
      console.log("      =-=-=-=-=-= state1 ", state1);
      console.log("      =-=-=-=-=-= state2 ", state2);

      var earliest = closestPositive(state1.time, state2.time);
      console.log("      =-=-=-=-=-= earliest ", earliest);

      if (earliest > 0) {
        if (earliest === state1.time) {
          console.log("      =-=-=-=-=-= -= state1 ", state1);
          toReturn = { surface: surface2, nextSurface: surface1, state: state1 };
        } else {
          console.log("      =-=-=-=-=-= -= state2 ", state2);
          toReturn = { surface: surface1, nextSurface: surface2, state: state2 };
        }
      }
    } else {    // no surface 2.
      angle1 = surface1.normal.angle();
      state1 = stepAngularStateByAngle(aState, angle1);
      if (state1.time > 0) {
        console.log("      =-=-=-=-=-= -= state1 ", state1);
        toReturn = { surface: surface2, nextSurface: surface1, state: state1 };
      }
    }
  } else {
    if (surface2) {
      angle2 = surface2.normal.angle();
      state2 = stepAngularStateByAngle(aState, angle2);
      if (state2.time > 0) {
        console.log("      =-=-=-=-=-= -= state2 ", state2);
        toReturn = { surface: surface1, nextSurface: surface2, state: state2 };
      }
    } else {
    }
  }
  console.log("      -_-_-_-_-    returning: ", toReturn);
  return toReturn;
}





function convertAngularToNormalState(aState) {
  var posVec = vecFromAngleLength(aState.a, aState.radius);

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
    var x = (b * b) - (4 * a * c);

    if (x < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("            roots are imaginary.... a ", a, ", b ", b, ", c ", c);
      return null;
    } else {
      //calculate roots
      var bNeg = -b;
      var aDoubled = 2 * a;
      var t = Math.sqrt(x);
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

  //console.log("      solving earliest surface endpoint, ");
  //console.log("        state ", state);
  //console.log("        surface ", surface);

  //return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
  //getStateAndDistancesAlignedWithLine(state, targetLine)
  var results = getStateAndDistancesAlignedWithLine(state, surface);
  //console.log("        getStateAndDistancesAlignedWithLine results ", results);

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
  //console.log("Solved time, time at: ", time);
  var closestPos = closestPositive(time0, time1);
  var data = null;

  if (closestPos === undefined || closestPos === null) {
    //throw "yay null this might be okay but have an exception anyway!";
  } else if (closestPos === time0) {
    data = { pointNumber: 0, time: state.time + time0 };
  } else if (closestPos === time1) {
    data = { pointNumber: 1, time: state.time + time1 };
  } else {
    throw "what the balls man, closest positive isnt time0, time1, or null???";
  }

  //console.log("        solved earliest surface endpoint. results:  ", data);

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

  // concave result { concave: t / f, angle } where angle in radians from this surface to next surface surface. the closer to Math.PI the less the angle of change between surfaces.
  var concRes0 = surface.getAdj0Angle();
  var concRes1 = surface.getAdj1Angle();

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
    //console.log("closestPos: ", closestPos);
    //console.log("concRes0: ", concRes0);
    //console.log("time0: ", time0);
    data = { adjNumber: 0, time: state.time + time0, angle: concRes0.angle };
  } else if (closestPos === time1) {
    //console.log("closestPos: ", closestPos);
    //console.log("concRes1: ", concRes1);
    //console.log("time1: ", time1);
    data = { adjNumber: 1, time: state.time + time1, angle: concRes1.angle };
  } else {
    throw "what the balls man, closest positive isnt time0, time1, or null???";
  }

  return data;
}



/*
 * Gets the amount of time taken to travel the specified distance at the current velocity and acceleration. 1 dimensional.
 * assumes the starting position is at 0.
 */
function solveTimeToDist1D(targetDist, currentVelocity, acceleration) {
  //console.log("        solving time to dist 1D, targetDist ", targetDist, ", currentVelocity ", currentVelocity, ", acceleration ", acceleration);
  //throw "lol";
  //console.log("        solved. Time at:  ", time);

  targetDist = -targetDist;
  //var a = acceleration / 2;
  //var b = currentVelocity;
  //var c = distanceToSurfaceEnd;

  var time = null;

  if (acceleration === 0) {

    time = -targetDist / currentVelocity;
    if (time <= 0) {
      time = null;
    }

  } else {
    var x = (currentVelocity * currentVelocity) - (2 * acceleration * targetDist);
    var y;
    var z;
    if (x < 0) {
      // ROOTS ARE IMAGINARY!
      console.log("          roots are imaginary, not gonna exit surface.");
      console.log("          x ", x, ", acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);
    } else {
      //calculate roots
      //console.log("x: ", x);
      var velNeg = -currentVelocity;
      //console.log("velNeg: ", velNeg);
      var t = Math.sqrt(x);
      //console.log("t: ", t);
      y = (velNeg + t) / (acceleration);  //root 1
      z = (velNeg - t) / (acceleration);  //root 2
      //console.log("solveTimeToDist1D.  acceleration ", acceleration, ", currentVelocity ", currentVelocity, ", distanceToSurfaceEnd ", targetDist);
      //console.log("   possible time distances are ", y, ", ", z);

      time = closestPositive(y, z);
    }
  }

  //console.log("        solved time to dist 1D. Time at:  ", time);
  return time;
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
  var rootsArray = solveQuadratic(accel.length(), curVel.length(), c); //TODO DEBUG PRINT STATEMENTS AND VERIFY THIS IS CORRECT, PROBABLY WRONG. DOES THIS ACTUALLY WORK? WAS IT REALLY THIS EASYYYY????????

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
  //console.log("      solving time to dist from line, ");
  //console.log("        curPos {", curPos.x, curPos.y, "}   curVel {", curVel.x, curVel.y, "}   accel {", accel.x, accel.y, "}");
  //console.log("        targetLine p0 {", targetLine.p0.x, targetLine.p0.y, "}  p1 {", targetLine.p1.x, targetLine.p1.y, (targetLine.normal.y > 0 ? "}  down" : "}  up"));
  //console.log("        distanceGoal ", distanceGoal);

  var tempState = new State(0.0, distanceGoal, curPos, curVel, accel);

  //return  { parallelVel,  perpVel,  parallelAccel,  perpAccel,  distancePerp,  distanceP0,  distanceP1 };
  //getStateAndDistancesAlignedWithLine(state, targetLine)
  var results = getStateAndDistancesAlignedWithLine(tempState, targetLine);
  //DEBUG_DRAW_LIGHTBLUE.push(new DebugLine(targetLine.p0, targetLine.p1, 5));
  //console.log("        results: ", results);
  var distance = (results.distancePerp > 0 ? results.distancePerp - distanceGoal : results.distancePerp + distanceGoal);
  var time = solveTimeToDist1D(distance, results.perpVel, results.perpAccel);



  //console.log("      solved time to dist from line. Time at:  ", time);
  return time;
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
  if (value1 === null && value2 >= TIME_EPSILON) {      //handle nulls.
    return value2;
  } else if (value2 === null && value1 >= TIME_EPSILON) {
    return value1;
  }



  if (value1 <= TIME_EPSILON) {            // is value1 negative?     //hackey bullshit to stop infinite looping???? TODO ????
    if (value2 <= TIME_EPSILON) {
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

