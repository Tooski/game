// classes


	
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
function Collectible (id, x, y, pointValue) {		
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

Collectible.prototype.draw = function(ctx) {
	ctx.beginPath():
	ctx.arc(x,y,20,0,2*Math.PI,false);
	ctx.fillStyle = "orange";
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "000000";
	ctx.stroke();
}

	
// object that represents a specific goal. this is different from a GoalLine
// goalNum = terrainmanager.nextGoalNumber();
// id = "goal " + this.goalNum;       		
function Goal (id, goalNum){			// ensure you terrainmanager.nextGoalNumber++; after passing in nextGoalNumber.
	this.goalNum = goalNum;					// sets this goals number to a new goal number. 
													        // used to determine what goal the player completed at the end of the level,
												          // and used to determine the leaderboard to submit to.
	
	this.id = id;


	this.toJSON = function () {
	  var formattedObj = { id: this.id, goalNum: this.goalNum };
	  return JSON.stringify(formattedObj);
	}
}	




		//NOW FOR LINE STUFF

// point class to make storing points less string intensive.
// __EVERY POINT IN ANY LINE CLASS MUST BE REPLACED WITH THESE__  Use terrainManager.toLinePoint(point) to get a point converted to a LinePoint with an ID.
// id = terrainmanager.nextPointNumber();      
function LinePoint(id, x, y) {
  if (!id || id < 0) {
    console.log("_+_+_+_bad LinePoint id, id: " + id);
    throw "_+_+_+_bad id for LinePoint, see above";
  }
  if (!(x || x === 0) && !(y || y === 0)) {
    console.log("_+_+_+_bad LinePoint x or y.  x " + x + ", y " + y);
    throw "_+_+_+_bad x or y in LinePoint, see above";
  }
	vec2.apply(this, [x, y]); 		 // initializes this as a vec2 with parameters x and y.  this.x is now x, this.y is now y
	this.id = id;
	
	
	
	this.collidesWith = function (point, radius) {
	  var toReturn = false;
	  var radSQ = radius * radius;
		if (point.subtract(this).lengthsq() < radSQ) {
			return true;
		} 
		return toReturn;
	}



	this.toJSON = function () {
	  var formattedObj = { id: this.id, x: this.x, y: this.y };
	  return JSON.stringify(formattedObj);
	}
}
LinePoint.prototype = new vec2();





//GoalLine basically the same as terrainLine but with the below changes.
function GoalLine() {
  // this.p0            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  // this.p1            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
	//this.id               // hopefully already set uniquely by the copied terrainLine code? if not, generate an ID.
	//this.goalID           // the ID of the goal object this goal line links to. This ID /MUST/ map to a goal that exists in terrainManager.goals
	
	//this.collidesWith()   //clone from terrainLine code, already done I'm assuming
  //this.collidesData()   //clone from terrainLine code, already done I'm assuming

  this.toJSON = function () {
    var formattedObj = { id: this.id, goalID: this.goalID };
    formattedObj = formatLineToJSON(this, formattedObj);
    return JSON.stringify(formattedObj);
  }
}




//CheckpointLine basically the same as terrainLine but with the below changes.
function CheckpointLine() {
  // this.p0            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  // this.p1            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  //this.id               // hopefully already set uniquely by the copied terrainLine code? if not, generate an ID.
  //this.checkpointID     // the ID of the Checkpoint object this CheckpointLine links to. This ID /MUST/ map to a Checkpoint that exists in terrainManager.checkpoints

  //this.collidesWith()   //clone from terrainLine code, already done I'm assuming
  //this.collidesData()   //clone from terrainLine code, already done I'm assuming


  this.toJSON = function () {
    var formattedObj = { id: this.id, checkpointID: this.checkpointID };
    formattedObj = formatLineToJSON(this, formattedObj);
    return JSON.stringify(formattedObj);
  }
}




//CheckpointLine basically the same as terrainLine but with the below changes.
function KillLine() {
  // this.p0            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  // this.p1            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  //this.id               // hopefully already set uniquely by the copied terrainLine code? if not, generate an ID.

  //this.collidesWith()   //clone from terrainLine code, already done I'm assuming
  //this.collidesData()   //clone from terrainLine code, already done I'm assuming


  this.toJSON = function () {
    var formattedObj = { id: this.id };
    formattedObj = formatLineToJSON(this, formattedObj);
    return JSON.stringify(formattedObj);
  }
}



//TerrainLine modifications
function TerrainLine(point0, point1, player, adjacent0, adjacent1, normal) {
  // this.p0            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  // this.p1            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.


  this.toJSON = function () {
    var formattedObj = { id: this.id };
    formattedObj = formatLineToJSON(this, formattedObj);

    formattedObj.normal = this.normal;
    return JSON.stringify(formattedObj);;
  }
}



// returns a string representing a point. Used to key into the terrainManager.pointMap to check if a point already exists.
function pointString(point) {
	return "" + point.x + " " + point.y;
}



// helper method to get the line part of any of the above things that are lines, and terrainLines.
// objectToAppendTo is an object that is passed in 
function formatLineToJSON (line, objectToAppendTo) { 	
	var obj = objectToAppendTo;
	obj.p0id = line.p0.id;
	obj.p1id = line.p1.id;
	obj.adj0id = line.adjacent0.id;
	obj.adj1id = line.adjacent1.id;
}
	
	
	
	
//TerrainManager itself
 
 
function TerrainManager () {
	//The two fields below are initially 0 because this is a blank level, currently. They /MUST/ be loaded from JSON any time a level is loaded.
  this.levelName = null;
  this.nextGoalNo = 1; // the next goal ID number. This must be saved along with the rest of the level.
	this.nextPointNo = 1; // the next point ID number. This must be saved along with the rest of the level.
	
	this.pointMap = {};			// this is a map of all LinePoints by their ID, used to reduce point replication everywhere.
                          // should only iterate through it or use this.toLinePoint(point) to modify it.

	this.startPoint = new vec2(1, 1);      		// the level starting location.
	
  this.goals  = {};     	     // map of goals by ID that are currently contained in this level.	 /NOT THE GOAL LINES/
								               // goalID's is a number assigned to goalLines that link to the same goal, and also used for determining
								               // what leaderboard to put the players score on.
	
	this.checkpoints = {};		   // map of checkpoints by ID.	 /NOT THE CHECKPOINT LINES/

	this.collectibles = {};      // map of all collectibles by ID. 
	
	
	this.terrainLines = {};		   // map of TerrainLines by ID that are currently contained in this level.
	
	this.checkpointLines = {};	 // ^ but CheckpointLines
	
	this.goalLines = {};         // ^ but GoalLines

	this.killLines = {};         // ^ but KillLines

	
	this.isReset = true;
	
	
	
	this.nextGoalNumber = function() {
		return this.nextGoalNo++;
	}
	
	
	this.nextPointNumber = function() {
		return this.nextPointNo++;
	}
	
	
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
		this.nextPointNo = 1; 
		this.pointMap = {};	
		this.startPoint = new vec2(1, 1); 
		this.goals  = {};
		this.checkpoints = {};
		this.collectibles = {};
		this.terrainLines = {};	
		this.checkpointLines = {};
		this.goalLines = {};
		this.killLines = {};  
		this.isReset = true;
	}
	
	
	this.toJSON = function () {					// gets the JSON version of this manager.
		var JSONdata = { levelName: this.levelName, nextGoalNo: this.nextGoalNo, nextPointNo: this.nextPointNo, startPoint: this.startPoint };
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

TerrainManager.prototype.pushTerrain = function(terrain, list) {
    this.createTerrainPoints(terrain);
    this.snapTo(terrain);
    this.terrainList.push(terrain);
    if (!this.levelByID[terrain.id]) this.levelByID[terrain.id] = terrain;
};

//Adding of other elements
TerrainManager.prototype.addCollectible = function(collectible) {
	if (!this.collectibles[collectible.id]) this.collectibles[collectible.id] = collectible;
}

TerrainManager.prototype.addCheckpoint = function(checkpoint) {
	if (!this.checkpoints[checkpoint.id]) this.checkpoints[checkpoint.id] = terrain;
}

TerrainManager.prototype.addGoal = function(goal) {
	if (!this.goals[goal.id]) this.goals[goal.id] = goal;
}

TerrainManager.prototype.pushGoalLine = function(goalLine) {
	if (!this.goalLines[goalLine.id]) this.goalLines[goalLine.id] = goalLine;
}

TerrainManager.prototype.pushKillLine = function(killLine) {
	if (!this.killLines[killLine.id]) this.killLines[killLine.id] = killLine;
}

TerrainManager.prototype.pushCheckpointLine = function(checkpointLine) {
	if (!this.checkpointLines[checkpointLine.id]) this.checkpointLines[checkpointLine.id] = terrain;
}

TerrainManager.prototype.draw = function(ctx) {

    if(editMode) {
        this.terrainList.forEach (function(ter) {
            //if(!ter.circularID){
                ter.draw(ctx);
            //}
        });
        //for(var i = 0; i < this.closedTerrain.length; i++) {
        //    this.closedTerrain[i].draw(ctx);
        //}
        //console.log(this.closedTerrain.length);
    } else {
        this.lineDraw = {};
     for(var i = 0; i < this.terrainList.length; i++) {
        if(!this.terrainList[i].adjacent0 && !this.terrainList[i].adjacent1) {
            this.terrainList[i].draw(ctx);
        } else {
        ctx.lineWidth = this.terrainList[i].lineWidth;
        if(this.terrainList[i].adjacent0) {

             createCurves(ctx, this.terrainList[i].p0, this.terrainList[i].p1, 
             this.terrainList[i].adjacent0.p0, this.terrainList[i].adjacent0.p1, 
             this.terrainList[i].adjacent1, true);
        }
         
        if(this.terrainList[i].adjacent1) {

            createCurves(ctx, this.terrainList[i].p0, this.terrainList[i].p1, 
            this.terrainList[i].adjacent1.p0, this.terrainList[i].adjacent1.p1,
            this.terrainList[i].adjacent0, false);
        }
    }
	//Draw other elements
  }
}
};

TerrainManager.prototype.loadFromFile = function(id, init, callback) {
    var that = this;
    
    this.terrainList = [];
    this.levelByID = {};

     if(init) init();
     game.settings.get({ "command": "getleveljson", "data": { "levelid": (id || 1) } }, this.parseFromJSON(data));

  
//    gameEngine.initializePhysEng();
//    gameEngine.physEng.start();
//    gameEngine.physEng.pause();
    
};

TerrainManager.prototype.parseFromJSON = function(data) {
  var obj = $.parseJSON($.parseJSON( data ));
  for(var i = 0; i < obj.length; i++) {
    var ter = new TerrainLine(new vec2(obj[i].p0.x, obj[i].p0.y), new vec2(obj[i].p1.x, obj[i].p1.y));
    ter.id = obj[i].id;
    ter.normal = new vec2(obj[i].normal.x, obj[i].normal.y);
    that.levelByID[obj[i].id] = ter;
  }
  // Adds neighbors to the object.
  for(var i = 0; i < obj.length; i++) {
    if (obj[i].adjacent0 && that.levelByID[obj[i].adjacent0]) that.levelByID[obj[i].id].adjacent0 = that.levelByID[obj[i].adjacent0];
    if (obj[i].adjacent1 && that.levelByID[obj[i].adjacent1]) that.levelByID[obj[i].id].adjacent1 = that.levelByID[obj[i].adjacent1];
    that.pushTerrain(that.levelByID[obj[i].id], that.levelByID);

  }
  gameEngine.initializePhysEng();
}

TerrainManager.prototype.createTerrainPoints = function(terrain) {
    var that = this;
//    if(editMode) {
      var wh = 10;
      terrain.p0edit = new MouseCollideable(false, terrain.p0.x - wh, terrain.p0.y - wh, wh*2, wh*2);
      
      terrain.p0edit.onDrag = function(e) {
        var xOffset = localToWorld(e.offsetX* (initWidth/ctx.canvas.width), "x");
        var yOffset = localToWorld(e.offsetY* (initWidth/ctx.canvas.width), "y");

        terrain.x = (terrain.p0.x = xOffset) - wh;
        terrain.y = (terrain.p0.y = yOffset) - wh;
        normalDrag(terrain);
        if(terrain.adjacent0) {
            if(terrain.adjacent0.adjacent1 === terrain) {
                terrain.adjacent0.p1edit.x = (terrain.adjacent0.p1.x = xOffset) - wh;
                terrain.adjacent0.p1edit.y = (terrain.adjacent0.p1.y = yOffset) - wh;
                normalDrag(terrain.adjacent0);
            } else if (terrain.adjacent0.adjacent0 === terrain) {
                terrain.adjacent0.p0edit.x = (terrain.adjacent0.p0.x = xOffset) - wh;
                terrain.adjacent0.p0edit.y = (terrain.adjacent0.p0.y = yOffset) - wh;
                normalDrag(terrain.adjacent0);
            }
        }
      };
      terrain.p0edit.onRelease = function(e) {
          that.snapTo(terrain);
      };
      terrain.p1edit = new MouseCollideable(false, terrain.p1.x - wh, terrain.p1.y - wh, wh*2, wh*2);
      terrain.p1edit.onDrag = function(e) {
        var xOffset = localToWorld(e.offsetX* (initWidth/ctx.canvas.width), "x");
        var yOffset = localToWorld(e.offsetY* (initWidth/ctx.canvas.width), "y");
          
        terrain.x = (terrain.p1.x = xOffset) - wh;
        terrain.y = (terrain.p1.y = yOffset) - wh;
        normalDrag(terrain);
        if(terrain.adjacent1) {
            if(terrain.adjacent1.adjacent1 === terrain) {
                terrain.adjacent1.p1edit.x = (terrain.adjacent1.p1.x = xOffset) - wh;
                terrain.adjacent1.p1edit.y = (terrain.adjacent1.p1.y = yOffset) - wh;
                normalDrag(terrain.adjacent1);
            } else if (terrain.adjacent1.adjacent0 === terrain) {
                terrain.adjacent1.p0edit.x = (terrain.adjacent1.p0.x = xOffset) - wh;
                terrain.adjacent1.p0edit.y = (terrain.adjacent1.p0.y = yOffset) - wh;
                normalDrag(terrain.adjacent1);
            }
        }
   
      };
      terrain.p1edit.onRelease = function(e) {
          that.snapTo(terrain);
      };
     
      terrain.normalPosVec = new vec2(terrain.p0.x, terrain.p0.y);
      terrain.normalPosCol = new MouseCollideable(false, terrain.p0.x - wh, terrain.p0.y - wh, wh*2, wh*2);
      terrain.normalPosCol.onDrag = function(e) {
          if(terrain.normal) {
          var point = findNormalByMouse(e, terrain);
          

          terrain.normal.x = point.x;
          terrain.normal.y = point.y;
          
        }
      };
      
//    }
};

TerrainManager.prototype.snapTo = function(terrain) {
       for(var i = 0; i < this.terrainList.length; i++) {
           if (terrain !== this.terrainList[i]){
        if(!this.terrainList[i].adjacent0 && checkBounds (terrain.p0, this.terrainList[i].p0)){
            terrain.p0.x = this.terrainList[i].p0.x = (terrain.p0.x + this.terrainList[i].p0.x)/2;
            terrain.p0.y = this.terrainList[i].p0.y = (terrain.p0.y + this.terrainList[i].p0.y)/2;
            this.terrainList[i].adjacent0 = terrain;
            terrain.adjacent0 = this.terrainList[i];
            break;
        } else if (!this.terrainList[i].adjacent1 && checkBounds (terrain.p0, this.terrainList[i].p1)) {
            terrain.p0.x = this.terrainList[i].p1.x = (terrain.p0.x + this.terrainList[i].p1.x)/2;
            terrain.p0.y = this.terrainList[i].p1.y = (terrain.p0.y + this.terrainList[i].p1.y)/2;
            this.terrainList[i].adjacent1 = terrain;
            terrain.adjacent0 = this.terrainList[i];
            break;
        } else if(!this.terrainList[i].adjacent0 && checkBounds (terrain.p1, this.terrainList[i].p0)){
            terrain.p1.x = this.terrainList[i].p0.x = (terrain.p1.x + this.terrainList[i].p0.x)/2;
            terrain.p1.y = this.terrainList[i].p0.y = (terrain.p1.y + this.terrainList[i].p0.y)/2;
            this.terrainList[i].adjacent0 = terrain;
            terrain.adjacent1 = this.terrainList[i];
            break;
        } else if (!this.terrainList[i].adjacent1 && checkBounds (terrain.p1, this.terrainList[i].p1)) {
            terrain.p1.x = this.terrainList[i].p1.x = (terrain.p1.x + this.terrainList[i].p1.x)/2;
            terrain.p1.y = this.terrainList[i].p1.y = (terrain.p1.y + this.terrainList[i].p1.y)/2;
            this.terrainList[i].adjacent1 = terrain;
            terrain.adjacent1 = this.terrainList[i];
            break;
        }
    }
    }
    
    var circular = {};
        if(terrain.adjacent0) {
        circular[terrain.adjacent0.id] = terrain.adjacent0;
        var d = checkCircular(terrain.adjacent0, circular, terrain, {});


        if(!terrain.circularID && d) {

            var c = new TerrainCircular(circular, this.closedTerrain);

        }
    }
};