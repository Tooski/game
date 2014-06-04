/**
 * terrainmanager.js
 * Original author: Joe
 * Heavily revised and edited by Travis and Michael Vlaming
 */




//object that represents a checkpoint. this is entirely different from a CheckpointLine.
// id = "checkpoint " + x + " " + y;
function Checkpoint(id, x, y) {
  if (!id) {
    console.log("_+_+_+_bad Checkpoint id, id: " + id);
    //throw "_+_+_+_bad id for Checkpoint, see above";
  }
  if (!(x || x === 0) || !(y || y === 0)) {
    console.log("_+_+_+_bad Checkpoint x or y.  x " + x + ", y " + y);
    //throw "_+_+_+_bad x or y in Checkpoint, see above";
  }
  vec2.apply(this, [x, y]); 		 // initializes this as a vec2 with parameters x and y.  this.x is now x, this.y is now y
  this.id = id;


  this.toJSON = function () {
    return { id: this.id, x: this.x, y: this.y };
  }
}




//object that represents a collectible.
// id = "Collectible " + x + " " + y;
function Collectible(id, x, y, pointValue, radius) {
  if (!id) {
    console.log("_+_+_+_bad Collectible id, id: " + id);
    //throw "_+_+_+_bad id for Collectible, see above";
  }
  if (!(x || x === 0) || !(y || y === 0)) {
    console.log("_+_+_+_bad Collectible x or y.  x " + x + ", y " + y);
    //throw "_+_+_+_bad x or y in Collectible, see above";
  }
  if (!pointValue && !pointValue === 0) {

    console.log("_+_+_+_bad Collectible pointValue, " + pointValue);
    //throw "_+_+_+_bad point value in Collectible, see above";
  }
  vec2.apply(this, [x, y]); 		 // initializes this as a vec2 with parameters x and y.  this.x is now x, this.y is now y
  this.pointValue = pointValue;	 // the value of this collectible? may not need
  this.id = id;
  this.radius = radius || DFLT_COLLECTIBLE_RADIUS;


  this.toJSON = function () {
    return { id: this.id, points: this.pointValue, x: this.x, y: this.y, radius: this.radius };
  }
}
Collectible.prototype = new vec2();
Collectible.prototype.constructor = Collectible;
Collectible.prototype.collidesWith = function (point, radius) {
  if (point.subtract(this).length() < radius + this.radius) {
    return true;
  } else {
    return false;
  }
}




/**
 * object that represents a specific goal. this is different from a GoalLine
 * id = terrainmanager.nextGoalNumber();
 */
function Goal(id) {

  this.id = id;		// sets this goals number to a new goal number. 
  // used to determine what goal the player completed at the end of the level,
  // and used to determine the leaderboard to submit to.


  this.toJSON = function () {
    var formattedObj = { id: this.id };
    return formattedObj;
  }
}





/**
 * object that represents a specific KillZone. this is different from a KillLine
 * id = terrainmanager.nextKillZoneNumber();
 */
function KillZone(id) {

  this.id = id;		// sets this goals number to a new goal number. 
  // used to determine what goal the player completed at the end of the level,
  // and used to determine the leaderboard to submit to.


  this.toJSON = function () {
    return { id: this.id };
  }
}






// returns a string representing a point. Used to key into the terrainManager.pointMap to check if a point already exists.
function pointString(point) {
  return "" + point.x + " " + point.y;
}






//TerrainManager itself
function TerrainManager() {
  //SEE RESET FUNCTION BELOW FOR DOCUMENTATION OF FIELDS

  this.tempLines = [];
  this.tempCirclePos = null;
  this.tempCircleRad = null;

  this.nextCollectibleNo;
  this.collectibles;
  this.collected;

  this.nextGoalNo;
  this.goals;
  this.nextGoalLineNo;
  this.goalLines;

  this.nextCheckpointNo;
  this.checkpoints;
  this.nextCheckpointLineNo;
  this.checkpointLines;

  this.nextKillZoneNo;
  this.killZones;
  this.nextKillLineNo;
  this.killLines;

  this.nextPointNo;
  this.pointMap;
  this.points;
  this.drawPoints;

  this.nextTerrainLineNo;
  this.terrainLines;
  this.nextPolygonNo;
  this.polygons = [];

  this.startPoint;



  this.reset();



  this.getNextCollectibleNumber = function () { return this.nextCollectibleNo++; }
  this.getNextGoalNumber = function () { return this.nextGoalNo++; }
  this.getNextGoalLineNumber = function () { return this.nextGoalLineNo++; }
  this.getNextCheckpointNumber = function () { return this.nextCheckpointNo++; }
  this.getNextCheckpointLineNumber = function () { return this.nextCheckpointLineNo++; }
  this.getNextKillZoneNumber = function () { return this.nextCollectibleNo++; }
  this.getNextKillLineNumber = function () { return this.nextKillLineNo++; }
  this.getNextPointNumber = function () { return this.nextPointNo++; }
  this.getNextTerrainLineNumber = function () { return this.nextTerrainLineNo++; }
  this.getNextPolygonNumber = function () { return this.nextPolygonNo++; }



  /**
	 * checks if a vec2 point is in the pointmap. If it already is, return the linepoint reference. 
	 * if it isnt already in it, create a new linePoint and insert it into pointMap, and then return the LinePoint.
	 * THIS SHOULD BE CALLED ANY TIME NEW POINTS ARE CREATED IN THE EDITOR TO AVOID POINT REPLICATION.
	 */
  this.toLinePoint = function (point) {
    var ps = pointString(point);
    var mapPoint = this.pointMap[ps];
    if (mapPoint) {
      return mapPoint;
    } else {
      var newID = this.getNextPointNumber();
      var linePoint = new LinePoint(newID, point.x, point.y);
      this.pointMap[ps] = linePoint;
      this.points[newID] = linePoint;
      return linePoint;
    }
  }





  this.toJSON = function () {					    // gets the JSON version of this manager.
    var JSONdata = {
      levelName: this.levelName,
      startPoint: this.startPoint,

      nextCollectibleNo: this.nextCollectibleNo,

      nextGoalNo: this.nextGoalNo,
      nextGoalLineNo: this.nextGoalLineNo,

      nextCheckpointNo: this.nextCheckpointNo,
      nextCheckpointLineNo: this.nextCheckpointLineNo,

      nextKillZoneNo: this.nextKillZoneNo,
      nextKillLineNo: this.nextKillLineNo,

      nextPointNo: this.nextPointNo,

      nextTerrainLineNo: this.nextTerrainLineNo,
      nextPolygonNo: this.nextPolygonNo,
    };


    //JSONdata.pointMap = this.pointMap;
    JSONdata.points = this.points;
    JSONdata.goals = this.goals;
    JSONdata.killZones = this.killZones;
    JSONdata.checkpoints = this.checkpoints;
    JSONdata.collectibles = this.collectibles;
    JSONdata.terrainLines = this.terrainLines;
    JSONdata.checkpointLines = this.checkpointLines;
    JSONdata.goalLines = this.goalLines;
    JSONdata.killLines = this.killLines;

    return JSONdata;
  }
}



TerrainManager.prototype = new Entity();
TerrainManager.constructor = TerrainManager;


TerrainManager.prototype.addPolygon = function (polygon) {
  this.polygons.push(polygon);
}



/**
 * Clears all the stuff in TerrainManager back to default values.
 */
TerrainManager.prototype.reset = function () {
  this.levelName = null;

  this.nextCollectibleNo = 1;
  this.collectibles = new Array();      // Array of all collectibles indexed by ID that are currently contained in this level.	
  this.collected = new Array();         // Collectibles not to draw because already collected.


  this.nextGoalNo = 1;
  this.goals = new Array();     	      // Array of all goals indexed by ID that are currently contained in this level.	 /NOT THE GOAL LINES/
  // id is also used for determining what leaderboard to put the players entry on.

  this.nextGoalLineNo = 1;
  this.goalLines = new Array();         //  Array of all GoalLines indexed by id

  this.nextCheckpointNo = 1;
  this.checkpoints = new Array();		    // Array of all checkpoints indexed by id /NOT THE CHECKPOINT LINES/
  this.nextCheckpointLineNo = 1;
  this.checkpointLines = new Array();	  // Array of all checkpoint lines indexed by id

  this.nextKillZoneNo = 1;
  this.killZones = new Array();         // the KillZones in the level.
  this.nextKillLineNo = 1;
  this.killLines = new Array();         // Array of all KillLines indexed by id 

  this.nextPointNo = 1;
  this.points = new Array();			      // Array of all points, indexed by id.
  this.pointMap = {};			              // this is a map of all LinePoints by their position, used to reduce point replication everywhere.
  // should only iterate through it or use this.toLinePoint(point) to modify it.

  this.nextTerrainLineNo = 1;
  this.terrainLines = new Array();		  // Array of all TerrainLines indexed by id that are currently contained in the level.
  this.nextPolygonNo = 1;
  this.polygons = new Array();          // Array of all polygons from ALL the different line types indexed by polyID.


  this.startPoint = new vec2(1, 1);     // the player starting location.

  this.modified = false;
  this.isReset = true;
}



/**
 * Clears all the stuff in TerrainManager back to default values.
 */
TerrainManager.prototype.init = function () {
  
  this.collected = new Array();         // Collectibles not to draw because already collected.

}




/**
 * The public erase interface for the erase button.
 */
TerrainManager.prototype.eraseByPosition = function (position, distance) {
  var hackeyState = new State(0.0, distance, position, new vec2(0, 0), new vec2(0, 0));
  var terrain = this.getTerrainCollisions(hackeyState, []);
  var goals = this.getGoalCollisions(hackeyState, []);
  var killZones = this.getKillZoneCollisions(hackeyState, []);
  var checkpoints = this.getCheckpointCollisions(hackeyState, []);
  var collectibles = this.getCollectibleCollisions(hackeyState, []);

  this.removeFromTerrain(terrain);
  this.removeFromGoals(goals);
  this.removeFromKillZones(killZones);
  this.removeFromCheckpoints(checkpoints);
  this.removeFromCollectibles(collectibles);
};



//no touchy
TerrainManager.prototype.removeFromTerrain = function (terrainLinesToRemove) {
  console.group();
  if (terrainLinesToRemove) {
    for (var i = 0; i < terrainLinesToRemove.length; i++) {
      if (terrainLinesToRemove[i]) {
        console.log(terrainLinesToRemove[i]);
        var itr = terrainLinesToRemove[i].surface;
        var start = itr;
        do {
          itr.p0.removeLine(itr);
          itr.p1.removeLine(itr);
          console.log("p0.numLines " + itr.p0.numLines);
          console.log("p1.numLines " + itr.p1.numLines);
          if (itr.p0.numLines === 0) {
            this.removePoint(itr.p0);
          }
          if (itr.p1.numLines === 0) {
            this.removePoint(itr.p1);
          }

          delete this.terrainLines[itr.id];
          itr = itr.adjacent0;
        } while (itr !== start);
        delete this.polygons[start.polyID];
      }
    }
  }
  //this.attemptRemovePoints(pointsToRemove);
  console.groupEnd();
}



//no touchy
TerrainManager.prototype.removeFromGoals = function (goalLinesToRemove) {
  if (goalLinesToRemove) {
    for (var i = 0; i < goalLinesToRemove.length; i++) {
      if (goalLinesToRemove[i]) {
        var itr = goalLinesToRemove[i].surface;
        var start = itr;
        do {
          itr.p0.removeLine(itr);
          itr.p1.removeLine(itr);
          if (itr.p0.numLines === 0) {
            this.removePoint(itr.p0);
          }
          if (itr.p1.numLines === 0) {
            this.removePoint(itr.p1);
          }

          delete this.goalLines[itr.id];
          itr = itr.adjacent0;
        } while (itr !== start);
        delete this.goals[start.goalID];
      }
    }
  }
  //this.attemptRemovePoints(pointsToRemove);
}



//no touchy
TerrainManager.prototype.removeFromCheckpoints = function (checkpointLinesToRemove) {
  if (checkpointLinesToRemove) {
    for (var i = 0; i < checkpointLinesToRemove.length; i++) {
      if (checkpointLinesToRemove[i]) {
        var itr = checkpointLinesToRemove[i].surface;
        var start = itr;
        do {
          itr.p0.removeLine(itr);
          itr.p1.removeLine(itr);
          if (itr.p0.numLines === 0) {
            this.removePoint(itr.p0);
          }
          if (itr.p1.numLines === 0) {
            this.removePoint(itr.p1);
          }

          delete this.checkpointLines[itr.id];
          itr = itr.adjacent0;
        } while (itr !== start);
        console.log("deleting start.checkpointID", start.checkpointID);
        console.log("checkpoints[start.checkpointID]", this.checkpoints[start.checkpointID]);
        delete this.checkpoints[start.checkpointID];
        console.log("after: checkpoints[start.checkpointID]", this.checkpoints[start.checkpointID]);
      }
    }
  }
  //this.attemptRemovePoints(pointsToRemove);
}



//no touchy
TerrainManager.prototype.removeFromKillZones = function (killZonesToRemove) {
  if (killZonesToRemove) {
    for (var i = 0; i < killZonesToRemove.length; i++) {
      if (killZonesToRemove[i]) {
        var itr = killZonesToRemove[i].surface;
        var start = itr;
        do {
          itr.p0.removeLine(itr);
          itr.p1.removeLine(itr);
          if (itr.p0.numLines === 0) {
            this.removePoint(itr.p0);
          }
          if (itr.p1.numLines === 0) {
            this.removePoint(itr.p1);
          }

          delete this.killLines[itr.id];
          itr = itr.adjacent0;
        } while (itr !== start);
        delete this.killZones[start.killZoneID];
      }
    }
  }
  //this.attemptRemovePoints(pointsToRemove);
}



//no touchy
TerrainManager.prototype.removeFromCollectibles = function (collectiblesToRemove) {
  if (collectiblesToRemove) {
    for (var i = 0; i < collectiblesToRemove.length; i++) {
      if (collectiblesToRemove[i]) {
        delete this.collectibles[collectiblesToRemove[i].id];
      }
    }
  }
}


/**
 * removes a single point from the level. Should only be called when this points number of lines remaining is 0.
 */
TerrainManager.prototype.removePoint = function (pointToRemove) {
  if (pointToRemove.numLines > 0) {
    console.log(pointToRemove);
    throw "why would you remove a point with lines left ???? ";
  }
  console.log("deleting point ", pointToRemove);
  delete this.points[pointToRemove.id];
  delete this.pointMap[pointString(pointToRemove)];
}







/**
 * Sets a new start location.
 */
TerrainManager.prototype.setStart = function (point) {
  this.startPoint = new vec2(point.x, point.y);
  this.modified = true;
}



/**
 * Adds a new collectible to the map at the specified point.
 */
TerrainManager.prototype.addCollectible = function (point, pointVal, radius) {
  var collectible = new Collectible(this.getNextCollectibleNumber(), point.x, point.y, pointVal, radius); //DFLT_collectibleValue
  if (!this.collectibles[collectible.id]) { this.collectibles[collectible.id] = collectible; } else { throw "wtf yo collectible id already exists"; }
  this.modified = true;
}




/**
 * Eats editor lines that have normals, adds them to the real level.
 */
TerrainManager.prototype.addTerrain = function (editorLineArray) {
  var lines = editorLineArray;

  var first = new TerrainLine(this.getNextTerrainLineNumber(), this.getNextPolygonNumber(), this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null, lines[0].normal);
  if (this.terrainLines[first.id]) {
    throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
  } else {
    this.terrainLines[first.id] = first;
  }
  var prev = first;
  for (var i = 1; i < lines.length; i++) {
    var converted = new TerrainLine(this.getNextTerrainLineNumber(), first.polyID, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null, lines[i].normal);
    prev.adjacent1 = converted;
    if (this.terrainLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
    }
    this.terrainLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
  this.modified = true;
}




/**
 * Eats editor lines and a checkpoint position, adds checkpoint / checkpointLines to the real level.
 */
TerrainManager.prototype.addCheckpoint = function (checkpointPos, editorLineArray) {

  var lines = editorLineArray;

  var checkpoint = new Checkpoint(this.getNextCheckpointNumber(), checkpointPos.x, checkpointPos.y);
  if (this.checkpoints[checkpoint.id]) {
    throw "what the hell, already a checkpoint with this id in checkpoints array";
  } else {
    this.checkpoints[checkpoint.id] = checkpoint;
  }

  var first = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);

  if (this.checkpointLines[first.id]) {
    throw "what the hell, a CheckpointLine already exists with this ID. Fix yo shit";
  } else {
    this.checkpointLines[first.id] = first;
  }
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.checkpointLines[converted.id]) {
      throw "what the hell, a CheckpointLine already exists with this ID. Fix yo shit";
    }
    this.checkpointLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
  this.modified = true;
}


/**
 * Eats editor lines and a goal / GoalLines to the real level.
 */
TerrainManager.prototype.addGoal = function (editorLineArray) {

  var lines = editorLineArray;

  var goal = new Goal(this.getNextGoalNumber());

  if (this.goals[goal.id]) {
    throw "what the hell, already a goal with this id in goals array";
  } else {
    this.goals[goal.id] = goal;
  }

  var first = new GoalLine(this.getNextGoalLineNumber(), goal.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);

  if (this.goalLines[first.id]) {
    throw "what the hell, a GoalLine already exists with this ID. Fix yo shit";
  } else {
    this.goalLines[first.id] = first;
  }
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new GoalLine(this.getNextGoalLineNumber(), goal.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.goalLines[converted.id]) {
      throw "what the hell, a GoalLine already exists with this ID. Fix yo shit";
    }
    this.goalLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
  this.modified = true;
}





/**
 * Eats editor lines and spits out KillLines to the real level.
 */
TerrainManager.prototype.addKillZone = function (editorLineArray) {

  var lines = editorLineArray;

  var killzone = new KillZone(this.getNextKillZoneNumber());

  if (this.killZones[killzone.id]) {
    throw "what the hell, already a killZone with this id in checkpoints array";
  } else {
    this.killZones[killzone.id] = killzone;
  }

  var first = new KillLine(this.getNextKillLineNumber(), killzone.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);
  if (this.killLines[first.id]) {
    throw "what the hell, a Kill Line already exists with this ID. Fix yo shit";
  } else {
    this.killLines[first.id] = first;
  }
  var prev = first;
  for (var i = 1; i < lines.length; i++) {
    var converted = new KillLine(this.getNextKillLineNumber(), killzone.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.killLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
    }
    this.killLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
  this.modified = true;
}








var POINT_COLOR = "#FFFFFF";
var POINT_SIZE = 8;
var DRAW_POINTS = true;

var LINE_WIDTH = 6;
var LINE_JOIN = "round";
var LINE_CAP = "round";

var TERRAIN_LINE_COLOR = "#000000";
var GOAL_LINE_COLOR = "#CCCCCC";
var KILL_LINE_COLOR = "#CC1100";
var CHECKPOINT_LINE_COLOR = "rgba(0, 0, 220, 0.45)";

var CURRENT_LINE_COLOR = "#888800";

var TEMP_COLOR = "#222222";

TerrainManager.prototype.draw = function (ctx) {

  ctx.miterLimit = 3;
  //  drawLineArray(ctx, this.currentLines, CURRENT_LINE_COLOR, DrawLine.lineWidth, LINE_JOIN, LINE_CAP);

  //drawPolygons(ctx, this.polygons, "#222222", LINE_WIDTH, LINE_JOIN, LINE_CAP);
  if (editMode) {

    this.drawCheckpointArray(ctx);
    this.drawStart(ctx);
  }

  if (this.terrainList && this.terrainList.length) {
    drawLineArray(ctx, this.terrainList, TERRAIN_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  }



  drawLineArray(ctx, this.killLines, KILL_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  drawLineArray(ctx, this.goalLines, GOAL_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  drawLineArray(ctx, this.terrainLines, TERRAIN_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  this.drawCollectibles(ctx);

  if (editMode) {
    drawLineArray(ctx, this.checkpointLines, CHECKPOINT_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);

    drawPointArray(ctx, this.points, POINT_COLOR, POINT_SIZE);

    drawLineArray(ctx, this.tempLines, TEMP_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
    this.drawTempCircle(ctx, TEMP_COLOR);
  }



  //             draw points 





  ////OLD SHIT
  //    if(editMode) {
  //        this.terrainList.forEach (function(ter) {
  //            //if(!ter.polygonID){
  //                ter.draw(ctx);
  //            //}
  //        });
  //        //for(var i = 0; i < this.closedTerrain.length; i++) {
  //        //    this.closedTerrain[i].draw(ctx);
  //        //}
  //        //console.log(this.closedTerrain.length);
  //		this.drawStart();
  //    } else {
  //        this.lineDraw = {};
  //     for(var i = 0; i < this.terrainList.length; i++) {
  //        if(!this.terrainList[i].adjacent0 && !this.terrainList[i].adjacent1) {
  //            this.terrainList[i].draw(ctx);
  //        } else {
  //        ctx.lineWidth = this.terrainList[i].lineWidth;
  //        if(this.terrainList[i].adjacent0) {

  //             createCurves(ctx, this.terrainList[i].p0, this.terrainList[i].p1, 
  //             this.terrainList[i].adjacent0.p0, this.terrainList[i].adjacent0.p1, 
  //             this.terrainList[i].adjacent1, true);
  //        }

  //        if(this.terrainList[i].adjacent1) {

  //            createCurves(ctx, this.terrainList[i].p0, this.terrainList[i].p1, 
  //            this.terrainList[i].adjacent1.p0, this.terrainList[i].adjacent1.p1,
  //            this.terrainList[i].adjacent0, false);
  //        }
  //    }
  //	//Draw other elements
  //  }
  //}
};






function drawPointArray(ctx, pointArray, color, pointWidth) {
  var halfWidth = pointWidth / 2;

  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = color;

  pointArray.forEach(function (point) {
    ctx.rect(point.x - halfWidth, point.y - halfWidth, pointWidth, pointWidth);
  });

  ctx.fill();
  ctx.restore();
}

function drawPolygons(ctx, polygons, color, lineWidth, lineJoin, lineCap) {
  ctx.save();
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = lineJoin;
  ctx.lineCap = lineCap;
  ctx.strokeStyle = color;
  console.log(polygons.length);
  polygons.forEach(function (poly) {
    var original = poly.polygon[0];
    ctx.moveTo(original.p0.x, original.p0.y);
    var line = original;


    while (line.adjacent1 !== original) {
      ctx.lineTo(line.p1.x, line.p1.y);
      line = line.adjacent1;
  }
    ctx.closePath();

    var first;
    while (!first || line.adjacent1 !== original) {
      first = true;

      if (editMode) {
        if (line.normal) {
          var midPoint = line.p0.add(line.p1).divf(2.0);

          var pNormalPosEnd = midPoint.add(line.normal.multf(20));

          //            line.normalPosCol.x = pNormalPosEnd.x - line.normalPosCol.w / 2;
          //            line.normalPosCol.y = pNormalPosEnd.y - line.normalPosCol.h / 2;
          ctx.moveTo(midPoint.x, midPoint.y);
          ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);
        }
      }
      line = line.adjacent1;
    }


  });
  ctx.stroke();
  ctx.restore();
}





function drawLineArray(ctx, lineArray, color, lineWidth, lineJoin, lineCap) {
  ctx.save();

  ctx.beginPath();
  ctx.lineWidth = lineWidth;

  ctx.lineJoin = lineJoin;
  ctx.lineCap = lineCap;
  ctx.strokeStyle = color;

  lineArray.forEach(function (line) {

    ctx.moveTo(line.p0.x, line.p0.y);
    ctx.lineTo(line.p1.x, line.p1.y);

    //// CODE BELOW ONLY SHOWS IF EDIT MODE IS ENABLED FOR MAP EDITOR!      

    if (line.normal) {
      var midPoint = line.p0.add(line.p1).divf(2.0);

      var pNormalPosEnd = midPoint.add(line.normal.multf(20));

      //line.normalPosCol.x = pNormalPosEnd.x - line.normalPosCol.w / 2;
      //line.normalPosCol.y = pNormalPosEnd.y - line.normalPosCol.h / 2;

      //line.p0edit.x = line.p0.x;
      //line.p0edit.y = line.p0.y;

      //line.p1edit.x = line.p1.x;
      //line.p1edit.y = line.p1.y;

      ctx.moveTo(midPoint.x, midPoint.y);
      ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);


      //line.p0edit.x = line.p0.x;
      //line.p0edit.y = line.p0.y;

      //line.p1edit.x = line.p1.x;
      //line.p1edit.y = line.p1.y;
    }
    if (editMode) {

    }
  });

  ctx.stroke();

  ctx.restore();
}







var START_RADIUS = DFLT_radius;
var START_COLOR_LINE = "black";
var START_COLOR_FILL = "darkgreen";
var START_COLOR_INNER_LINE = "green";
var START_COLOR_INNER_FILL = "silver";

//Draws a circle denoting the set starting position if in edit mode 
TerrainManager.prototype.drawStart = function (ctx) {
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(this.startPoint.x, this.startPoint.y, START_RADIUS, 0, TWO_PI, false);
  ctx.fillStyle = START_COLOR_FILL;
  ctx.fill();
  ctx.strokeStyle = START_COLOR_LINE;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(this.startPoint.x, this.startPoint.y, START_RADIUS / 2, 0, TWO_PI, false);
  ctx.fillStyle = START_COLOR_INNER_FILL;
  ctx.fill();
  ctx.strokeStyle = START_COLOR_INNER_LINE;
  ctx.stroke();
}



//Draws a circle denoting the tempCircle if there is one.
TerrainManager.prototype.drawTempCircle = function (ctx, color) {
  if (this.tempCirclePos) {
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(this.tempCirclePos.x, this.tempCirclePos.y, this.tempCircleRad, 0, TWO_PI, false);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}




var CHECKPOINT_RADIUS = DFLT_radius;
var CHECKPOINT_COLOR_LINE = "rgba(0, 0, 220, 0.55)";
var CHECKPOINT_COLOR_FILL = "rgba(10, 10, 255, 0.35)";
var CHECKPOINT_COLOR_INNER_LINE = "rgba(20, 40, 255, 0.55)";
var CHECKPOINT_COLOR_INNER_FILL = "rgba(10, 70, 220, 0.25)";;

//Draws a circle denoting the set checkpoint positions if in edit mode 
TerrainManager.prototype.drawCheckpointArray = function (ctx) {
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (var i = 0; i < this.checkpoints.length; i++) {
    if (this.checkpoints[i]) {
      ctx.moveTo(this.checkpoints[i].x + CHECKPOINT_RADIUS, this.checkpoints[i].y)
      ctx.arc(this.checkpoints[i].x, this.checkpoints[i].y, CHECKPOINT_RADIUS, 0, TWO_PI, false);
    }
  }
  ctx.fillStyle = CHECKPOINT_COLOR_FILL;
  ctx.fill();
  ctx.strokeStyle = CHECKPOINT_COLOR_LINE;
  ctx.stroke();



  ctx.beginPath();
  for (var i = 0; i < this.checkpoints.length; i++) {
    if (this.checkpoints[i]) {
      var checkpoint = this.checkpoints[i];
      ctx.moveTo(this.checkpoints[i].x + CHECKPOINT_RADIUS / 2, this.checkpoints[i].y)
      ctx.arc(checkpoint.x, checkpoint.y, CHECKPOINT_RADIUS / 2, 0, TWO_PI, false);
    }
  }
  ctx.fillStyle = CHECKPOINT_COLOR_INNER_FILL;
  ctx.fill();
  ctx.strokeStyle = CHECKPOINT_COLOR_INNER_LINE;
  ctx.stroke();
}



var DFLT_COLLECTIBLE_RADIUS = 25;
var COLLECTIBLE_COLOR_LINE = "#FF6600";
var COLLECTIBLE_COLOR_FILL = "#FF8833";


//Draws a circle denoting the set checkpoint positions if in edit mode 
TerrainManager.prototype.drawCollectibles = function (ctx) {
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (var i = 0; i < this.collectibles.length; i++) {
    if (this.collectibles[i] && (editMode || !this.collected[i])) {
      //console.log(this.collectibles[i]);
      ctx.moveTo(this.collectibles[i].x + this.collectibles[i].radius, this.collectibles[i].y)
      ctx.arc(this.collectibles[i].x, this.collectibles[i].y, this.collectibles[i].radius, 0, TWO_PI, false);
    }
  }
  ctx.fillStyle = COLLECTIBLE_COLOR_FILL;
  ctx.fill();
  ctx.strokeStyle = COLLECTIBLE_COLOR_LINE;
  ctx.stroke();
}




TerrainManager.prototype.loadFromFile = function (id, init, callback) {
  var that = this;


  if (init) init();

  game.settings.get({ "command": "getleveljson", "data": { "levelid": (id || 1) } },
    function (data) {
      var obj = $.parseJSON($.parseJSON(data));
      console.log(obj);
      if (obj[0]) {      //Ducktyping check, is this an integer? if not this is an old level. 
        that.loadOldLevelFromJSON(obj);
      }

      that.loadFromJSON(obj);


      gameEngine.initializePhysEng(that);
    });


  //    gameEngine.initializePhysEng();
  //    gameEngine.physEng.start();
  //    gameEngine.physEng.pause();

};





/**
 * Converts an old level to the new format.
 */
TerrainManager.prototype.loadOldLevelFromJSON = function (obj) {
  this.reset();
  //this.addTerrain(obj);
  //console.log("Loading from old level", obj);
  //var jsonPretty = JSON.stringify(this, null, 2);
  //console.log(this);
  //document.getElementById("eklipzConsole").innerHTML = jsonPretty;
}





/**
 * Loads a new formatted level.
 */
TerrainManager.prototype.loadFromJSON = function (obj) {
  this.reset();
  console.log("They see me loading, they hatin");
  console.group();

  console.log("JSON obj to load:");
  console.log(obj);
  //var jsonPretty = JSON.stringify(this, null, 2);
  //console.log(this);
  //document.getElementById("eklipzConsole").innerHTML = jsonPretty;
  this.levelName = obj.levelName;
  this.startPoint = new vec2(obj.startPoint.x, obj.startPoint.y);

  this.nextCollectibleNo = obj.nextCollectibleNo;

  this.nextGoalNo = obj.nextGoalNo;
  this.nextGoalLineNo = obj.nextGoalLineNo;

  this.nextCheckpointNo = obj.nextCheckpointNo;
  this.nextCheckpointLineNo = obj.nextCheckpointLineNo;

  this.nextKillZoneNo = obj.nextKillZoneNo;
  this.nextKillLineNo = obj.nextKillLineNo;

  this.nextPointNo = obj.nextPointNo;

  this.nextTerrainLineNo = obj.nextTerrainLineNo;
  this.nextPolygonNo = obj.nextPolygonNo;


  console.log("loading main data");
  //this.loadPointMap(obj.pointMap);
  this.loadPoints(obj.points);
  this.loadCheckpoints(obj.checkpoints);
  this.loadGoals(obj.goals);
  this.loadKillZones(obj.killZones);
  this.loadCollectibles(obj.collectibles);


  console.log("loading line data");
  this.loadTerrainLines(obj.terrainLines);
  this.loadKillLines(obj.killLines);
  this.loadCheckpointLines(obj.checkpointLines);
  this.loadGoalLines(obj.goalLines);

  //JSONdata.checkpointLines = this.checkpointLines;
  //JSONdata.goalLines = this.goalLines;
  //JSONdata.killLines = this.killLines;

  console.groupEnd();
  //var jsonPretty = JSON.stringify(this, null, 2);
  //document.getElementById("eklipzConsole").innerHTML = jsonPretty;
}





///**
// * Loads the pointMap from an array of saved JSON.
// */
//TerrainManager.prototype.loadPointMap = function (pointMap) {
//  console.log("pointMap: ", pointMap);
//  pointMap.forEach(function (mapPoint) {
//    if (mapPoint) {
//      var p = new vec2(mapPoint.x, mapPoint.y);
//      this.pointMap[pointString(p)] = p;
//    } else {
//      console.log("!mapPoint???? ", mapPoint);
//      throw "???";
//    }
//  });
//}





/**
 * Loads the points from an array of saved JSON.
 */
TerrainManager.prototype.loadPoints = function (points) {
  var that = this;
  points.forEach(function (point) {
    if (point) {
      var p = new LinePoint(point.id, point.x, point.y);
      that.points[p.id] = p;
      that.pointMap[pointString(p)] = p;
    } else {
    }
  });
}





/**
 * Loads the checkpoints from an array of saved JSON.
 */
TerrainManager.prototype.loadCheckpoints = function (checkpoints) {
  var that = this;
  checkpoints.forEach(function (checkpoint) {
    if (checkpoint) {
      var cp = new Checkpoint(checkpoint.id, checkpoint.x, checkpoint.y);
      that.checkpoints[cp.id] = cp;
    } else {
    }
  });
}





/**
 * Loads the goals from an array of saved JSON.
 */
TerrainManager.prototype.loadGoals = function (goals) {
  var that = this;
  goals.forEach(function (goal) {
    if (goal) {
      var g = new Goal(goal.id);
      that.goals[g.id] = g;
    } else {
    }
  });
}





/**
 * Loads the killZones from an array of saved JSON.
 */
TerrainManager.prototype.loadKillZones = function (killZones) {
  var that = this;
  killZones.forEach(function (killZone) {
    if (killZone) {
      var k = new KillZone(killZone.id);
      that.killZones[k.id] = k;
    } else {
    }
  });
}




/**
 * Loads the collectibles from an array of saved JSON.
 */
TerrainManager.prototype.loadCollectibles = function (collectibles) {
  var that = this;
  collectibles.forEach(function (collectible) {
    if (collectible) {
      var c = new Collectible(collectible.id, collectible.x, collectible.y, collectible.pointValue, collectible.radius);
      that.collectibles[c.id] = c;
    } else {
    }
  });
}





TerrainManager.prototype.loadTerrainLines = function (tLines) {
  var polygonsDiscovered = {};
  var that = this;
  tLines.forEach(function (ter) {
    if (ter) {
      that.terrainLines[ter.id] = new TerrainLine(ter.id, ter.polyID, that.points[ter.p0id], that.points[ter.p1id], null, null, new vec2(ter.normal.x, ter.normal.y));
      that.terrainLines[ter.id].p0.connectLine(that.terrainLines[ter.id]);
      that.terrainLines[ter.id].p1.connectLine(that.terrainLines[ter.id]);
    }
  });

  tLines.forEach(function (ter) {
    if (ter) {
      that.terrainLines[ter.id].adjacent0 = that.terrainLines[ter.adj0id];
      that.terrainLines[ter.id].adjacent1 = that.terrainLines[ter.adj1id];
    }
  });
}





TerrainManager.prototype.loadKillLines = function (kLines) {
  var polygonsDiscovered = {};
  var that = this;
  kLines.forEach(function (kl) {
    if (kl) {
      that.killLines[kl.id] = new KillLine(kl.id, kl.killZoneID, that.points[kl.p0id], that.points[kl.p1id], null, null);
      //that.terrainLines[kl.id].p0.connectLine(that.terrainLines[ter.id]);
      //that.terrainLines[kl.id].p1.connectLine(that.terrainLines[ter.id]);
    }
  });

  kLines.forEach(function (kl) {
    if (kl) {
      that.killLines[kl.id].adjacent0 = that.killLines[kl.adj0id];
      that.killLines[kl.id].adjacent1 = that.killLines[kl.adj1id];
    }
  });
}





TerrainManager.prototype.loadGoalLines = function (gLines) {
  var polygonsDiscovered = {};
  var that = this;
  gLines.forEach(function (gl) {
    if (gl) {
      that.goalLines[gl.id] = new GoalLine(gl.id, gl.goalID, that.points[gl.p0id], that.points[gl.p1id], null, null);
      //that.goalLines[gl.id].p0.connectLine(that.goalLines[gl.id]);
      //that.goalLines[gl.id].p1.connectLine(that.goalLines[gl.id]);
    }
  });

  gLines.forEach(function (gl) {
    if (gl) {
      that.goalLines[gl.id].adjacent0 = that.goalLines[gl.adj0id];
      that.goalLines[gl.id].adjacent1 = that.goalLines[gl.adj1id];
    }
  });
}






TerrainManager.prototype.loadCheckpointLines = function (cpLines) {
  var polygonsDiscovered = {};
  var that = this;
  cpLines.forEach(function (cpl) {
    if (cpl) {
      that.checkpointLines[cpl.id] = new CheckpointLine(cpl.id, cpl.checkpointID, that.points[cpl.p0id], that.points[cpl.p1id], null, null);
      //that.checkpointLines[cpl.id].p0.connectLine(that.checkpointLines[cpl.id]);
      //that.checkpointLines[cpl.id].p1.connectLine(that.checkpointLines[cpl.id]);
    }
  });

  cpLines.forEach(function (cpl) {
    if (cpl) {
      that.checkpointLines[cpl.id].adjacent0 = that.checkpointLines[cpl.adj0id];
      that.checkpointLines[cpl.id].adjacent1 = that.checkpointLines[cpl.adj1id];
    }
  });
}





TerrainManager.prototype.getTerrainCollisions = function (ballstate, doNotCheck) {
  return this.getCollisionsInList(ballstate, this.terrainLines, doNotCheck);
}

TerrainManager.prototype.getGoalCollisions = function (ballstate) {
  return this.getCollisionsInList(ballstate, this.goalLines, []);
}

TerrainManager.prototype.getCheckpointCollisions = function (ballstate, alreadyReached) {
  return this.getCollisionsInList(ballstate, this.checkpointLines, alreadyReached);
}

TerrainManager.prototype.getKillZoneCollisions = function (ballstate) {
  return this.getCollisionsInList(ballstate, this.killLines, []);
}

TerrainManager.prototype.getCollectibleCollisions = function (ballstate, alreadyCollected) {
  var stuffWeCollidedWith = [];

  for (var i = 0; i < this.collectibles.length; i++) {
    if (this.collectibles[i] && !contains(alreadyCollected, this.collectibles[i])) {
      //console.log(data);
      if (this.collectibles[i].collidesWith(ballstate.pos, ballstate.radius)) {
        stuffWeCollidedWith.push(this.collectibles[i]);
      }
    }
  }
  var didWeCollide = false;
  if (stuffWeCollidedWith.length > 0) {
    didWeCollide = true;
  }
  //console.log("stuffWeCollidedWith:", stuffWeCollidedWith);
  return stuffWeCollidedWith;
}






//What I will be calling in the recursive physics bounds checking function to check the initial collision list.
//doNotCheck may be empty.
TerrainManager.prototype.getCollisionsInList = function (ballstate, collidersToCheck, doNotCheck) {
  //code to check for collisions ONLY WITH THE THINGS IN THE PASSED LIST! Should be about the same as the above method but only searches this specific list, and returns the subset of it that is still being collided with.
  var stuffWeCollidedWith = [];

  for (var i = 0; i < collidersToCheck.length; i++) {
    if (collidersToCheck[i] && !contains(doNotCheck, collidersToCheck[i])) {
      //data { collided, collidedLine, collidedP0, collidedP1, surface, perpendicularIntersect }
      var data = collidersToCheck[i].collidesData(ballstate.pos, ballstate.radius);
      //console.log(data);
      if (data.collided) {
        stuffWeCollidedWith.push(data);
      }
    } else {
      //console.log("doNotCheck contained colliders[i]: ", collidersToCheck[i]);
    }
  }
  var didWeCollide = false;
  if (stuffWeCollidedWith.length > 0) {
    didWeCollide = true;
  }
  //console.log("stuffWeCollidedWith:", stuffWeCollidedWith);
  return stuffWeCollidedWith;
}










function createCurves(ctx, a0, a1, b0, b1, other, check) {
  var midPoint1 = a0.add(a1).divf(2.0);
  var midPoint2 = b0.add(b1).divf(2.0);
  ctx.beginPath();
  ctx.moveTo(check ? midPoint2.x : midPoint1.x, check ? midPoint2.y : midPoint1.y);
  ctx.quadraticCurveTo(check ? a0.x : a1.x, check ? a0.y : a1.y,
  check ? midPoint1.x : midPoint2.x, check ? midPoint1.y : midPoint2.y);
  ctx.stroke();
  if (!other) {
    ctx.beginPath();
    ctx.moveTo(midPoint1.x, midPoint1.y);
    ctx.lineTo(check ? a1.x : a0.x, check ? a1.y : a0.y);
    ctx.stroke();
  }
}
