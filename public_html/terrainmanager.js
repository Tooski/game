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
  ctx.beginPath();
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






// returns a string representing a point. Used to key into the terrainManager.pointMap to check if a point already exists.
function pointString(point) {
	return "" + point.x + " " + point.y;
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
TerrainManager.prototype.setStartPoint = function(vecStart) {
	this.startPoint = vecStart;
}

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

  



  ////OLD SHIT
//    if(editMode) {
//        this.terrainList.forEach (function(ter) {
//            //if(!ter.circularID){
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


////////////TerrainLine.prototype.draw = function (ctx) {
////////////  ctx.beginPath();
////////////  ctx.lineWidth = this.lineWidth;
////////////  ctx.lineCap = "round";

////////////  ctx.lineJoin = "round";
////////////  ctx.miterLimit = 3;
////////////  ctx.strokeStyle = "#000000";
////////////  ctx.moveTo(this.p0.x, this.p0.y);
////////////  ctx.lineTo(this.p1.x, this.p1.y);


////////////  //// CODE BELOW ONLY SHOWS IF EDIT MODE IS ENABLED FOR MAP EDITOR!
////////////  if (editMode) {
////////////    //ctx.beginPath();
////////////    ctx.moveTo(this.p0.x, this.p0.y);
////////////    ctx.arc(this.p0.x, this.p0.y, 4, 0, 2 * Math.PI, false);
////////////    //ctx.fillStyle = 'green';
////////////    //ctx.fill();
////////////    ctx.moveTo(this.p1.x, this.p1.y);
////////////    ctx.arc(this.p1.x, this.p1.y, 4, 0, 2 * Math.PI, false);
////////////    //ctx.fillStyle = 'red';
////////////    ctx.fill();

////////////    if (this.normal) {

////////////      var midPoint = this.p0.add(this.p1).divf(2.0);
////////////      //ctx.beginPath();
////////////      //ctx.strokeStyle = "#001133";
////////////      //ctx.lineWidth = 4;
////////////      var pNormalPosEnd = midPoint.add(this.normal.multf(20));

////////////      this.normalPosCol.x = pNormalPosEnd.x - this.normalPosCol.w / 2;
////////////      this.normalPosCol.y = pNormalPosEnd.y - this.normalPosCol.h / 2;



////////////      this.p0edit.x = this.p0.x;
////////////      this.p0edit.y = this.p0.y;

////////////      this.p1edit.x = this.p1.x;
////////////      this.p1edit.y = this.p1.y;



////////////      ctx.moveTo(midPoint.x, midPoint.y);
////////////      ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);
////////////      ctx.stroke();
////////////      ctx.moveTo(this.p0edit.x, this.p0edit.y);

////////////      ctx.arc(this.p0edit.x, this.p0edit.y, 4, 0, 2 * Math.PI, false);
////////////      ctx.fill();

////////////      //ctx.beginPath();


////////////      this.p0edit.x = this.p0.x;
////////////      this.p0edit.y = this.p0.y;

////////////      this.p1edit.x = this.p1.x;
////////////      this.p1edit.y = this.p1.y;



////////////      ctx.moveTo(midPoint.x, midPoint.y);
////////////      ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);
////////////      ctx.stroke();
////////////      ctx.moveTo(this.p0edit.x, this.p0edit.y);

////////////      ctx.arc(this.p0edit.x, this.p0edit.y, 4, 0, 2 * Math.PI, false);
////////////      ctx.fill();

////////////      //ctx.beginPath();

////////////      //ctx.arc(this.normalPosVec.x  , this.normalPosVec.y , this.normalPosCol.w/2, 0, 2 * Math.PI, false);
////////////      //ctx.fillStyle = 'orange';
////////////      //ctx.fill();
////////////      //ctx.stroke();

////////////    } else {

////////////      ctx.stroke();
////////////    }
////////////    if (DEBUG_TERRAIN) {
////////////      this.collidesWith(this.player.model.pos, DFLT_radius, ctx);
////////////    }
////////////  } else {
////////////    ctx.stroke();
////////////  }
////////////};

//Draws a circle denoting the set starting position if in edit mode 
TerrainManager.prototype.drawStart = function(ctx) {
  ctx.beginPath();
	ctx.arc(startPoint.x,startPoint.y,10,0,2*Math.PI,false);
	ctx.fillStyle = "green";
	ctx.fill();
}


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

function TerrainCircular(circular, closedTerrain) {
    //Entity.call();
    this.circular = circular;
    for (var item in this.circular){
        this.circular[item].circularID = this.id;
        
    }
    closedTerrain.push(this);
}

TerrainCircular.prototype = new Entity();

TerrainCircular.prototype.draw = function(ctx) {
    
    var rect = new Rectangle(Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    ctx.save();
    ctx.beginPath();
    
    for (var k in this.circular) {
        this.fillTerrain(ctx, this.circular[k], {}, rect,{});

        break;
    }
    
   
    
    ctx.closePath();
    ctx.clip();
    var img = ASSET_MANAGER.cache["assets/dirt.jpg"];
    for(var x = rect.x1 ; x < rect.x2; x+=img.width) {
        for(var y = rect.y1; y < rect.y2; y+=img.height) {
            ctx.drawImage(img, x, y);
        }
    }
    ctx.restore();
    ctx.lineWidth = this.circular[k].lineWidth;
    ctx.stroke();
    
    
    for(var item in this.circular) {
        var midPoint = this.circular[item].p0.add(this.circular[item].p1).divf(2.0);
        var pNormalPosEnd = midPoint.add(this.circular[item].normal.multf(20));
        this.circular[item].normalPosCol.x = pNormalPosEnd.x - this.circular[item].normalPosCol.w / 2;
        this.circular[item].normalPosCol.y = pNormalPosEnd.y - this.circular[item].normalPosCol.h / 2;
        this.circular[item].p0edit.x = this.circular[item].p0.x;
        this.circular[item].p0edit.y = this.circular[item].p0.y;
        this.circular[item].p1edit.x = this.circular[item].p1.x;
        this.circular[item].p1edit.y = this.circular[item].p1.y;
        ctx.moveTo(midPoint.x, midPoint.y);
        ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);
        ctx.stroke();
    }
};


TerrainCircular.prototype.fillTerrain = function(ctx, terrain, visited, rect, visitedLine) {
        if(rect.x1 > terrain.p0.x) rect.x1 = terrain.p0.x;
        if(rect.x2 < terrain.p0.x) rect.x2 = terrain.p0.x;
        if(rect.y1 > terrain.p0.y) rect.y1 = terrain.p0.y;
        if(rect.y2 < terrain.p0.y) rect.y2 = terrain.p0.y;
        if(rect.x1 > terrain.p1.x) rect.x1 = terrain.p1.x;
        if(rect.x2 < terrain.p1.x) rect.x2 = terrain.p1.x;
        if(rect.y1 > terrain.p1.y) rect.y1 = terrain.p1.y;
        if(rect.y2 < terrain.p1.y) rect.y2 = terrain.p1.y;
        
        
        visitedLine[terrain.id] = true;
        
            var t0 = JSON.stringify( terrain.p0);
            var t1 = JSON.stringify( terrain.p1);
            
            
            if(visited.length === 0) {
                ctx.moveTo(terrain.p0.x,terrain.p0.y);
                visited[t0] = true;
            }
            
                    if(!visited[t0]) ctx.lineTo(terrain.p0.x,terrain.p0.y);
                    else if (!visited[t1]) ctx.lineTo(terrain.p1.x,terrain.p1.y);
            
            if(terrain.adjacent0 && !visitedLine[terrain.adjacent0.id]) {
                var o0 = JSON.stringify( terrain.adjacent0.p0);
                var o1 = JSON.stringify( terrain.adjacent0.p1);
                if(!visited[t0] || !visited[t1]) {

                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
               
                    
                    
                    this.fillTerrain(ctx, terrain.adjacent0, visited, rect, visitedLine);
                }
            }
            if(terrain.adjacent1 && !visitedLine[terrain.adjacent1.id]) {
                
                var o0 = JSON.stringify( terrain.adjacent1.p0);
                var o1 = JSON.stringify( terrain.adjacent1.p1);
                if(!visited[t0] || !visited[t1]) {
                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
                             
            
                    
                    
                    this.fillTerrain(ctx, terrain.adjacent1, visited, rect, visitedLine);
                }
            }
            
};

TerrainManager.prototype.removeFrom = function(terrain) {

        if(terrain.adjacent0){
          if(terrain.adjacent0.adjacent0 === terrain) {
            terrain.adjacent0.adjacent0 = terrain.adjacent0 = null;
          } else if (terrain.adjacent0.adjacent1 === terrain) {
            terrain.adjacent0.adjacent1 = terrain.adjacent0 = null;
          }
        } 
      if(terrain.adjacent1){
          if(terrain.adjacent1.adjacent0 === terrain) {
            terrain.adjacent1.adjacent0 = terrain.adjacent1 = null;
          } else if (terrain.adjacent1.adjacent1 === terrain) {
            terrain.adjacent1.adjacent1 = terrain.adjacent1 = null;
          }
        } 

        if(terrain.p0edit) removeMouseCollideable(terrain.p0edit);
        if(terrain.p1edit) removeMouseCollideable(terrain.p1edit);
        
        return true;
};

function checkBounds (p1, p2) {
    return (p1.x <= p2.x + graceSize && 
           p1.x >= p2.x - graceSize && 
           p1.y <= p2.y + graceSize &&
           p1.y >= p2.y - graceSize);
};

function checkCircular(nextLine, array, original, visited) {
    if(!nextLine.adjacent0 || !nextLine.adjacent1) return false;
    if(nextLine) {
        var t0 = JSON.stringify(nextLine.p0);
        var t1 = JSON.stringify(nextLine.p1);
        if( nextLine.id === original.id) {
            return true;
        } else {
            
            if(nextLine.adjacent0 && !array[nextLine.adjacent0.id]) {
                var o0 = JSON.stringify(nextLine.adjacent0.p0);
                var o1 = JSON.stringify(nextLine.adjacent0.p1);
                
                
                
                if(!visited[t0] || !visited[t1]) {
                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
                    array[nextLine.adjacent0.id] = nextLine.adjacent0;
                    return checkCircular(nextLine.adjacent0, array, original, visited);
                }
            }
            if(nextLine.adjacent1 && !array[nextLine.adjacent1.id]) {
                var o0 = JSON.stringify(nextLine.adjacent1.p0);
                var o1 = JSON.stringify(nextLine.adjacent1.p1);
                if(!visited[t0] || !visited[t1]) {
                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
                    array[nextLine.adjacent1.id] = nextLine.adjacent1;
                    return checkCircular(nextLine.adjacent1, array, original, visited);
                }
            }
            
  
//            if(nextLine.adjacent0) {
//                
//                var o0 = JSON.stringify(nextLine.adjacent0.p0);
//                var o1 = JSON.stringify(nextLine.adjacent0.p1);
//          
//                
//                
//                if(!array[nextLine.adjacent0.id] && (!visited[t0] || !visited[t1]) ) {
//                    if(t0 === o0 || t0 === o1) visited[t0] = true;
//                    else if (t1 === o0 || t1 === t1) visited[t1] = true;
//                    
//                    array[nextLine.adjacent0.id] = nextLine.adjacent0;
//                    return checkCircular(nextLine.adjacent0, array, original, visited);
//                }
//            }
//            if (nextLine.adjacent1 && !array[nextLine.adjacent1.id]  && (!visited[t0] || !visited[t1])) {
//                array[nextLine.adjacent1.id] = nextLine.adjacent1;
//                
//                var o0 = JSON.stringify(nextLine.adjacent1.p0);
//                var o1 = JSON.stringify(nextLine.adjacent1.p1);
//          
//                if(t0 === o0 || t0 === o1) visited[t0] = true;
//                else if (t1 === o0 || t1 === t1) visited[t1] = true;
//                
//                
//                return  checkCircular(nextLine.adjacent1, array, original, visited);
//            }
        }
    }
    return false;
}

function createCurves(ctx, a0, a1, b0, b1, other, check) {
            var midPoint1 = a0.add(a1).divf(2.0);
            var midPoint2 = b0.add(b1).divf(2.0);
            ctx.beginPath();
            ctx.moveTo(check ? midPoint2.x : midPoint1.x, check ? midPoint2.y : midPoint1.y);
            ctx.quadraticCurveTo(check ? a0.x : a1.x, check ? a0.y : a1.y, 
            check ? midPoint1.x : midPoint2.x, check ? midPoint1.y : midPoint2.y);
            ctx.stroke();
            if(!other) {
                ctx.beginPath();
                ctx.moveTo(midPoint1.x,midPoint1.y);
                ctx.lineTo(check ? a1.x : a0.x, check ? a1.y : a0.y);
                ctx.stroke();
            }
}