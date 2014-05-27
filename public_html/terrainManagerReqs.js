// classes


	
//object that represents a checkpoint. this is entirely different from a CheckpointLine.
// id = "checkpoint " + x + " " + y;
function Checkpoint(id, x, y) {
  if (!id) {
    console.log("_+_+_+_bad id, id: " + id);
    //throw "_+_+_+_bad id for Checkpoint, see above";
  }
  if (!(x || x === 0) || !(y || y === 0)) {
    console.log("_+_+_+_bad x or y.  x " + x + ", y " + y);
    //throw "_+_+_+_bad x or y in Checkpoint, see above";
  }
	vec2.apply(this, [x, y]); 		 // initializes this as a vec2 with parameters x and y.  this.x is now x, this.y is now y
	this.id = id;  
}	

	
//object that represents a collectible.
// id = "Collectible " + x + " " + y;
function Collectible (id, x, y, pointValue) {		
  if (!id) {
    console.log("_+_+_+_bad id, id: " + id);
    //throw "_+_+_+_bad id for Collectible, see above";
  }
  if (!(x || x === 0) || !(y || y === 0)) {
    console.log("_+_+_+_bad x or y.  x " + x + ", y " + y);
    //throw "_+_+_+_bad x or y in Collectible, see above";
  }
  if (!pointValue && !pointValue === 0) {

    console.log("_+_+_+_bad pointValue, " + pointValue);
    //throw "_+_+_+_bad point value in Collectible, see above";
  }
	vec2.apply(this, [x, y]); 		 // initializes this as a vec2 with parameters x and y.  this.x is now x, this.y is now y
	this.pointValue = pointValue;	 // the value of this collectible? may not need
	this.id = id;  
}	


	
// object that represents a specific goal. this is different from a GoalLine
// goalNum = terrainmanager.nextGoalNumber();
// id = "goal " + this.goalNum;       		
function Goal (id, goalNum){			// ensure you terrainmanager.nextGoalNumber++; after passing in nextGoalNumber.
	this.goalNum = goalNum;					// sets this goals number to a new goal number. 
													        // used to determine what goal the player completed at the end of the level,
												          // and used to determine the leaderboard to submit to.
	
	this.id = id;    
}	




		//NOW FOR LINE STUFF

// point class to make storing points less string intensive.
// __EVERY POINT IN ANY LINE CLASS MUST BE REPLACED WITH THESE__  Use terrainManager.toLinePoint(point) to get a point converted to a LinePoint with an ID.
// id = terrainmanager.nextPointNumber();      
function LinePoint(id, x, y) {
  if (!id || id < 0) {
    console.log("_+_+_+_bad id, id: " + id);
    throw "_+_+_+_bad id for LinePoint, see above";
  }
  if (!(x || x === 0) && !(y || y === 0)) {
    console.log("_+_+_+_bad x or y.  x " + x + ", y " + y);
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
}
	



//CheckpointLine basically the same as terrainLine but with the below changes.
function CheckpointLine() {
  // this.p0            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  // this.p1            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
	//this.id               // hopefully already set uniquely by the copied terrainLine code? if not, generate an ID.
	//this.checkpointID     // the ID of the Checkpoint object this CheckpointLine links to. This ID /MUST/ map to a Checkpoint that exists in terrainManager.checkpoints
	
	//this.collidesWith()   //clone from terrainLine code, already done I'm assuming
	//this.collidesData()   //clone from terrainLine code, already done I'm assuming
	
}	



//TerrainLine modifications
function TerrainLine(point0, point1, player, adjacent0, adjacent1, normal) {
  // this.p0            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.
  // this.p1            // MUST BE LinePoints. Enforced with throw in TerrainSurface constructor.


  this.jsonObj = function () {
    var formattedObj = { id: this.id, checkpointID: this.checkPointID };
    formattedObj = formatLineToJSON(this, formattedObj);

    formattedObj.normal = line.normal;
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
		this.isReset = true;
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
		this.isReset = true;
	}
	
	
	this.getJSON = function () {					// gets the JSON version of this manager.
		var JSONdata;
		
		
		
		return JSONdata;
	}
	
	this.loadJSON = function (data) {  // parses a new terrainManager state from the provided 
		this.reset();
		this.isReset = false;
	}
	
}