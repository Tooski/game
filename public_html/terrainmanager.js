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
    var formattedObj = { id: this.id, x: this.x, y: this.y };
    return JSON.stringify(formattedObj);
  }
}




//object that represents a collectible.
// id = "Collectible " + x + " " + y;
function Collectible(id, x, y, pointValue) {
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


  this.toJSON = function () {
    var formattedObj = { id: this.id, points: this.pointValue, x: this.x, y: this.y };
    return JSON.stringify(formattedObj);
  }
}
Collectible.prototype = new vec2();

Collectible.prototype.draw = function (ctx) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
  ctx.fillStyle = "orange";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "000000";
  ctx.stroke();
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
    return JSON.stringify(formattedObj);
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
    var formattedObj = { id: this.id };
    return JSON.stringify(formattedObj);
  }
}






// returns a string representing a point. Used to key into the terrainManager.pointMap to check if a point already exists.
function pointString(point) {
  return "" + point.x + " " + point.y;
}






//TerrainManager itself
function TerrainManager() {
                                    //SEE RESET FUNCTION BELOW FOR DOCUMENTATION OF FIELDS
  this.nextCollectibleNo;
  this.collectibles;

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

  this.nextTerrainLineNo;
  this.terrainLines;
  this.nextPolygonNo;
  this.polygons;

  this.startPoint;



  this.reset();
  


  this.getNextCollectibleNumber       = function () { return this.nextCollectibleNo++;    }
  this.getNextGoalNumber              = function () { return this.nextGoalNo++;           }
  this.getNextGoalLineNumber          = function () { return this.nextGoalLineNo++;       }
  this.getNextCheckpointNumber        = function () { return this.nextCheckpointNo++;     }
  this.getNextCheckpointLineNumber    = function () { return this.nextCheckpointLineNo++; }
  this.getNextKillZoneNumber          = function () { return this.nextCollectibleNo++;    }
  this.getNextKillLineNumber          = function () { return this.nextKillLineNo++;       }
  this.getNextPointNumber             = function () { return this.nextPointNo++;          }
  this.getNextTerrainLineNumber       = function () { return this.nextTerrainLineNo++;    }  
  this.getNextPolygonNumber           = function () { return this.nextPolygonNo++;        }



  /**
	 * checks if a vec2 point is in the pointmap. If it already is, return the linepoint reference. 
	 * if it isnt already in it, create a new linePoint and insert it into pointMap, and then return the LinePoint.
	 * THIS SHOULD BE CALLED ANY TIME NEW POINTS ARE CREATED IN THE EDITOR TO AVOID POINT REPLICATION.
	 */
  this.toLinePoint = function (point) {
    var ps = pointString(point);
    var mapPoint = this.pointMap[ps];
    if (mapPoint) {
      console.log("mapPoint true ", mapPoint);
      return mapPoint;
    } else {
      var newID = this.getNextPointNumber();
      var linePoint = new LinePoint(newID, point.x, point.y);
      this.pointMap[ps] = linePoint;
      console.log("mapPoint false, creating and returning linepoint", linePoint);
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

      nextKillZoneNo: this.nextCheckpointNo,
      nextKillLineNo: this.nextKillLineNo,

      nextPointNo: this.nextPointNo,

      nextTerrainLineNo: this.nextTerrainLineNo,
      nextPolygonNo: this.nextPolygonNo,
    };


    JSONdata.pointMap = this.pointMap;
    JSONdata.goals = this.goals;
    JSONdata.killZones = this.killZones;
    JSONdata.checkpoints = this.checkpoints;
    JSONdata.collectibles = this.collectibles;
    JSONdata.terrainLines = this.terrainLines;
    JSONdata.checkpointLines = this.checkpointLines;
    JSONdata.goalLines = this.goalLines;
    JSONdata.killLines = this.killLines;

    var jsonString = JSON.stringify(JSONdata);
    var jsonTabbed = JSON.stringify(JSONdata, null, 3)
    console.log(jsonTabbed);

    return jsonString;
  }




  this.loadFromJSON = function (data) {  // parses a new terrainManager state from the provided 
    this.reset();
    console.log("loading JSON data into terrainManager. JSON: ")
    var jsonTabbed = JSON.stringify(data, null, 3)

    this.levelName = data.levelName;





    this.isReset = false;
  }

}

TerrainManager.prototype = new Entity();
TerrainManager.constructor = TerrainManager;


/**
 * Clears all the stuff in TerrainManager back to default values.
 */
TerrainManager.prototype.reset = function () {
  this.levelName = null;

  this.nextCollectibleNo = 1;
  this.collectibles = new Array();      // Array of all collectibles indexed by ID that are currently contained in this level.	


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
  this.killZones = new Array();         // the KillZone objects in the level.
  this.nextKillLineNo = 1;
  this.killLines = new Array();         // Array of all KillLines indexed by id 

  this.nextPointNo = 1;
  this.pointMap = {};			              // this is a map of all LinePoints by their position, used to reduce point replication everywhere.
  // should only iterate through it or use this.toLinePoint(point) to modify it.

  this.nextTerrainLineNo = 1;
  this.terrainLines = new Array();		  // Array of all TerrainLines indexed by id that are currently contained in the level.
  this.nextPolygonNo = 1;
  this.polygons = new Array();          // Array of all polygons from ALL the different line types indexed by polyID.


  this.startPoint = new vec2(1, 1);     // the level starting location.

  this.isReset = true;
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
TerrainManager.prototype.addCollectible = function (point) {
  var collectible = new Collectible(this.nextCollectibleNumber(), point.x, point.y, DFLT_collectibleValue);
  if (!this.collectibles[collectible.id]) { this.collectibles[collectible.id] = collectible; } else { throw "wtf yo collectible id already exists";}
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
    throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
  } else {
    this.checkpointLines[first.id] = first;
  }
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.checkpointLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
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

  var goal = new Goal(this.nextGoalNumber());

  if (this.goals[goal.id]) {
    throw "what the hell, already a checkpoint with this id in checkpoints array";
  } else {
    this.goals[goal.id] = goal;
  }

  var first = new GoalLine(this.nextGoalLineNumber(), goal.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);

  if (this.goalLines[first.id]) {
    throw "what the hell, a GoalLine already exists with this ID. Fix yo shit";
  } else {
    this.goalLines[first.id] = first;
  }
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new GoalLine(this.nextGoalLineNumber(), goal.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
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

  var killzone = new KillZone(this.nextKillZoneNumber());

  if (this.killZones[killzone.id]) {
    throw "what the hell, already a checkpoint with this id in checkpoints array";
  } else {
    this.killZones[killzone.id] = killzone;
  }

  var first = new KillZone(this.nextKillLineNumber(), killzone.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);

  if (this.killZones[first.id]) {
    throw "what the hell, a GoalLine already exists with this ID. Fix yo shit";
  } else {
    this.killZones[first.id] = first;
  }
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new KillZone(this.nextKillLineNumber(), killzone.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.killZones[converted.id]) {
      throw "what the hell, a GoalLine already exists with this ID. Fix yo shit";
    }
    this.killZones[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
  this.modified = true;
}












var POINT_COLOR = "#FFFFFF";
var POINT_SIZE = 6;
var DRAW_POINTS = true;

var LINE_WIDTH = 6;
var LINE_JOIN = "round";
var LINE_CAP = "round";

var TERRAIN_LINE_COLOR = "#000000";
var GOAL_LINE_COLOR = "#CCCCCC";
var KILL_LINE_COLOR = "#CC1100";
var CHECKPOINT_LINE_COLOR = "#2222DD";

var CURRENT_LINE_COLOR = "#888800";


TerrainManager.prototype.draw = function (ctx) {

  ctx.miterLimit = 3;
  //  drawLineArray(ctx, this.currentLines, CURRENT_LINE_COLOR, DrawLine.lineWidth, LINE_JOIN, LINE_CAP);

  if (this.terrainList && this.terrainList.length) {
    drawLineArray(ctx, this.terrainList, TERRAIN_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  }

  drawLineArray(ctx, this.terrainLines, TERRAIN_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  drawLineArray(ctx, this.goalLines, GOAL_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  drawLineArray(ctx, this.killLines, KILL_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);
  drawLineArray(ctx, this.checkpointLines, CHECKPOINT_LINE_COLOR, LINE_WIDTH, LINE_JOIN, LINE_CAP);

  drawPointArray(ctx, this.pointMap, POINT_COLOR, POINT_SIZE);

  this.drawCheckpointArray(ctx);
  this.drawStart(ctx);


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
    if (editMode) {
      if (line.normal) {
        var midPoint = line.p0.add(line.p1).divf(2.0);

        var pNormalPosEnd = midPoint.add(line.normal.multf(20));

        line.normalPosCol.x = pNormalPosEnd.x - line.normalPosCol.w / 2;
        line.normalPosCol.y = pNormalPosEnd.y - line.normalPosCol.h / 2;

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
    }
  });

  ctx.stroke();

  ctx.restore();
}






var START_RADIUS = DFLT_radius;
var START_COLOR_LINE = "navy";
var START_COLOR_FILL = "blue";
var START_COLOR_INNER_LINE = "lightblue";
var START_COLOR_INNER_FILL = "lightgreen";

//Draws a circle denoting the set starting position if in edit mode 
TerrainManager.prototype.drawStart = function (ctx) {
  context.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(this.startPoint.x, this.startPoint.y, START_RADIUS, 0, TWO_PI, false);
  ctx.fillStyle = START_COLOR_FILL;
  ctx.fill();
  context.strokeStyle = START_COLOR_LINE;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(this.startPoint.x, this.startPoint.y, START_RADIUS / 2, 0, TWO_PI, false);
  ctx.fillStyle = START_COLOR_INNER_FILL;
  ctx.fill();
  context.strokeStyle = START_COLOR_INNER_LINE;
  ctx.stroke();
}





var CHECKPOINT_RADIUS = DFLT_radius;
var CHECKPOINT_COLOR_LINE = "black";
var CHECKPOINT_COLOR_FILL = "darkgreen";
var CHECKPOINT_COLOR_INNER_LINE = "green";
var CHECKPOINT_COLOR_INNER_FILL = "silver";

//Draws a circle denoting the set checkpoint positions if in edit mode 
TerrainManager.prototype.drawCheckpointArray = function (ctx) {
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (var i = 0; i < this.checkpoints.length; i++) {
    if (this.checkpoints[i]) {
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
      ctx.arc(checkpoint.x, checkpoint.y, CHECKPOINT_RADIUS / 2, 0, TWO_PI, false);
    }
  }
  ctx.fillStyle = CHECKPOINT_COLOR_INNER_FILL;
  ctx.fill();
  ctx.strokeStyle = CHECKPOINT_COLOR_INNER_LINE;
  ctx.stroke();
}




TerrainManager.prototype.loadFromFile = function (id, init, callback) {
  var that = this;


  if (init) init();

  game.settings.get({ "command": "getleveljson", "data": { "levelid": (id || 1) } },
    function (data) {
      var obj = $.parseJSON($.parseJSON(data));
      if (!obj[0].id.toFixed) {      //Ducktyping check, is this an integer? if not this is an old level. 
        that.loadOldLevel(obj);
      }




      gameEngine.initializePhysEng();
    }
  );


  //    gameEngine.initializePhysEng();
  //    gameEngine.physEng.start();
  //    gameEngine.physEng.pause();

};





/**
 * Converts an old level to the new format.
 */
TerrainManager.prototype.loadOldLevel = function (obj) {
  this.reset();
  this.addTerrain(obj);

  var jsonPretty = JSON.stringify(this, null, 4);
  document.getElementById("eklipzConsole").innerHTML = jsonPretty;
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