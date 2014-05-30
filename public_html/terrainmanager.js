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
    var formattedObj = { id: this.id, goalNum: this.goalNum };
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
  this.nextGoalNo;
  this.nextCollectibleNo;
  this.nextCheckpointNo;
  this.nextPointNo;
  this.nextTerrainLineNo;
  this.nextGoalLineNo;
  this.nextCheckpointLineNo;
  this.nextKillLineNo;
  this.nextPolygonNo;
  this.pointMap;
  this.startPoint;
  this.goals;
  this.checkpoints;
  this.collectibles;
  this.terrainLines;
  this.checkpointLines;
  this.goalLines;
  this.killLines;


  this.reset();
  



  this.nextGoalNumber             = function () { return this.nextGoalNo++;           }
  this.nextCheckpointNumber       = function () { return this.nextCheckpointNo++;     }
  this.nextCollectibleNumber      = function () { return this.nextCollectibleNo++;    }
  this.nextPointNumber            = function () { return this.nextPointNo++;          }
  this.nextTerrainLineNumber      = function () { return this.nextTerrainLineNo++;    }
  this.nextGoalLineNumber         = function () { return this.nextGoalLineNo++;       }
  this.nextCheckpointLineNumber   = function () { return this.nextCheckpointLineNo++; }
  this.nextKillLineNumber         = function () { return this.nextKillLineNo++;       }
  this.nextPolygonNumber          = function () { return this.nextPolygonNo++;        }
  this.nextPointNumber            = function () { return this.nextPointNo++;          }



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
      var newID = this.nextPointNumber();
      var linePoint = new LinePoint(newID, point.x, point.y);
      this.pointMap[ps] = linePoint;
      return linePoint;
    }
  }


  // function that clears all the stuff in this terrainmanager. 
  this.reset = function () {
    this.levelName = null;

    this.nextGoalNo = 1;
    this.nextCollectibleNo = 1;
    this.nextCheckpointNo = 1;
    this.nextPointNo = 1;
    this.nextTerrainLineNo = 1;
    this.nextGoalLineNo = 1;
    this.nextCheckpointLineNo = 1;
    this.nextKillLineNo = 1;
    this.nextPolygonNo = 1;


    this.pointMap = new Array();			    // this is a map of all LinePoints by their ID, used to reduce point replication everywhere.
                                          // should only iterate through it or use this.toLinePoint(point) to modify it.

    this.startPoint = new vec2(1, 1);     // the level starting location.

    this.goals = new Array();     	      // map of goals by ID that are currently contained in this level.	 /NOT THE GOAL LINES/
                                          // goalID's is a number assigned to goalLines that link to the same goal, and also used for determining
                                          // what leaderboard to put the players score on.

    this.checkpoints = new Array();		    // map of checkpoints by ID.	 /NOT THE CHECKPOINT LINES/

    this.collectibles = new Array();      // map of all collectibles by ID. 


    this.terrainLines = new Array();		  // map of TerrainLines by ID that are currently contained in this level.

    this.checkpointLines = new Array();	  // ^ but CheckpointLines

    this.goalLines = new Array();         // ^ but GoalLines

    this.killLines = new Array();         // ^ but KillLines

    this.isReset = true;
  }


  this.toJSON = function () {					    // gets the JSON version of this manager.
    var JSONdata = {
      levelName: this.levelName,
      startPoint: this.startPoint,

      nextGoalNo: this.nextGoalNo, 
      nextCollectibleNo: this.nextCollectibleNo,
      nextCheckpointNo: this.nextCheckpointNo,
      nextPointNo: this.nextPointNo, 
      nextTerrainLineNo: this.nextTerrainLineNo, 
      nextGoalLineNo: this.nextGoalLineNo, 
      nextCheckpointLineNo: this.nextCheckpointLineNo, 
      nextKillLineNo: this.nextKillLineNo, 
      nextPolygonNo: this.nextPolygonNo, 
    };


    JSONdata.pointMap = this.pointMap;
    JSONdata.goals = this.goals;
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

//Adding of other elements
TerrainManager.prototype.setStart = function (point) {
  this.startPoint = point;
}

TerrainManager.prototype.addCollectible = function (point) {
  if (!this.collectibles[collectible.id]) this.collectibles[collectible.id] = collectible;
}




/**
 * Eats editor lines that have normals, adds them to the real level.
 */
TerrainManager.prototype.addTerrainLines = function (editorLineArray) {
  var lines = editorLineArray;

  var first = new TerrainLine(this.getNextTerrainLineNumber(), this.getNextPolygonNumber(), this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null, lines[0].normal);
  this.terrainLines[first.id] = first;
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
}




/**
 * Eats editor lines and a checkpoint position, adds checkpoint / checkpointLines to the real level.
 */
TerrainManager.prototype.addCheckpointAndLines = function (checkpointPos, editorLineArray) {

  var lines = editorLineArray;

  var checkpoint = new Checkpoint(this.getNextCheckpointNumber(), checkpointPos.x, checkpointPos.y);

  this.checkpoints[checkpoint.id] = checkpoint;

  var first = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);
  this.checkpointLines[first.id] = first;
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.checkpointLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
    }
    this.terrainLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
}




/**
 * Eats editor lines and a checkpoint position, adds checkpoint / checkpointLines to the real level.
 */
TerrainManager.prototype.addGoalAndLines = function (editorLineArray) {

  var lines = editorLineArray;

  var goal = new Goal(

  this.checkpoints[checkpoint.id] = checkpoint;

  var first = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);
  this.checkpointLines[first.id] = first;
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.checkpointLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
    }
    this.terrainLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
}





TerrainManager.prototype.addCheckpointAndLines = function (checkpointPos, editorLineArray) {

  var lines = editorLineArray;

  var checkpoint = new Checkpoint(this.getNextCheckpointNumber(), checkpointPos.x, checkpointPos.y);

  this.checkpoints[checkpoint.id] = checkpoint;

  var first = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);
  this.checkpointLines[first.id] = first;
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.checkpointLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
    }
    this.terrainLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
}




TerrainManager.prototype.addCheckpointAndLines = function (checkpointPos, editorLineArray) {

  var lines = editorLineArray;

  var checkpoint = new Checkpoint(this.getNextCheckpointNumber(), checkpointPos.x, checkpointPos.y);

  this.checkpoints[checkpoint.id] = checkpoint;

  var first = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[0].p0), this.toLinePoint(lines[0].p1), null, null);
  this.checkpointLines[first.id] = first;
  var prev = first;

  for (var i = 1; i < lines.length; i++) {
    var converted = new CheckpointLine(this.getNextCheckpointLineNumber(), checkpoint.id, this.toLinePoint(lines[i].p0), this.toLinePoint(lines[i].p1), prev, null);
    prev.adjacent1 = converted;
    if (this.checkpointLines[converted.id]) {
      throw "what the hell, a TerrainLine already exists with this ID. Fix yo shit";
    }
    this.terrainLines[converted.id] = converted;
    prev = converted;
    //this.terrainLines
  }
  first.adjacent0 = prev;
  prev.adjacent1 = first;
}



TerrainManager.prototype.addCheckpoint = function (checkpoint) {
  if (!this.checkpoints[checkpoint.id]) this.checkpoints[checkpoint.id] = checkpoint;
}

TerrainManager.prototype.addGoal = function (goal) {
  if (!this.goals[goal.id]) this.goals[goal.id] = goal;
}

TerrainManager.prototype.pushGoalLine = function (goalLine) {
  if (!this.goalLines[goalLine.id]) this.goalLines[goalLine.id] = goalLine;
}

TerrainManager.prototype.pushKillLine = function (killLine) {
  if (!this.killLines[killLine.id]) this.killLines[killLine.id] = killLine;
}

TerrainManager.prototype.pushCheckpointLine = function (checkpointLine) {
  if (!this.checkpointLines[checkpointLine.id]) this.checkpointLines[checkpointLine.id] = checkpointLine;
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

  this.terrainList = new Array();
  this.levelByID = {};

  if (init) init();
  game.settings.get({ "command": "getleveljson", "data": { "levelid": (id || 1) } },
    function (data) {
      var obj = $.parseJSON($.parseJSON(data));
      for (var i = 0; i < obj.length; i++) {
        var ter = new TerrainLine(new vec2(obj[i].p0.x, obj[i].p0.y), new vec2(obj[i].p1.x, obj[i].p1.y));
        ter.id = obj[i].id;
        ter.normal = new vec2(obj[i].normal.x, obj[i].normal.y);
        that.levelByID[obj[i].id] = ter;
      }
      // Adds neighbors to the object.
      for (var i = 0; i < obj.length; i++) {
        if (obj[i].adjacent0 && that.levelByID[obj[i].adjacent0]) that.levelByID[obj[i].id].adjacent0 = that.levelByID[obj[i].adjacent0];
        if (obj[i].adjacent1 && that.levelByID[obj[i].adjacent1]) that.levelByID[obj[i].id].adjacent1 = that.levelByID[obj[i].adjacent1];
        that.pushTerrain(that.levelByID[obj[i].id], that.levelByID);

      }
      gameEngine.initializePhysEng();
    }
  );


  //    gameEngine.initializePhysEng();
  //    gameEngine.physEng.start();
  //    gameEngine.physEng.pause();

};



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