// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

/*
var DFLT_gravity = 450;        // FORCE EXERTED BY GRAVITY IS 400 ADDITIONAL UNITS OF VELOCITY DOWNWARD PER SECOND. 

var DFLT_JUMP_HOLD_TIME = 0.15; // To jump full height, jump must be held for this long. Anything less creates a fraction of the jump height based on the fraction of the full time the button was held. TODO implement.

// CONST ACCEL INPUTS
var DFLT_gLRaccel = 500;
var DFLT_aLRaccel = 300;
var DFLT_aUaccel = 50;
var DFLT_aDaccel = 100;
var DFLT_gUaccel = 75;
var DFLT_gDaccel = 100;
var DFLT_gBoostLRvel = 700;
var DFLT_aBoostLRvel = 700;
var DFLT_aBoostDownVel = 500;

// CONST PULSE INPUTS
var DFLT_jumpVelNormPulse = 900;
var DFLT_doubleJumpVelYPulse = 900;
var DFLT_doubleJumpVelYMin = 900;

// OTHER CHAR DEFAULTS
var DFLT_numAirCharges = 1;
var DFLT_radius = 1920 / 16;

// CONST RATIOS
var DFLT_jumpSurfaceSpeedLossRatio = 0.7;   // When jumping from the ground, the characters velocity vector is decreased by this ratio before jump pulse is added. 
*/
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function(path) {
    console.log(path.toString());
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function(callback) {
    if (this.downloadQueue.length === 0)
        window.setTimeout(callback, 100);
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function() {
            console.log("dun: " + this.src.toString());
            that.successCount += 1;
            if (that.isDone()) {
                callback();
            }
        });
        img.addEventListener("error", function() {
            that.errorCount += 1;
            if (that.isDone()) {
                callback();
            }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function(path) {
    //console.log(path.toString());
    return this.cache[path];
}



function InputObject() {
  this.jumpKey = 65;
  this.boostKey = 83;
  this.leftKey = 37;
  this.rightKey = 39;
  this.downKey = 40;
  this.upKey = 38;
  this.lockKey = 68;
  this.pauseKey = 80;

  this.jumpPressed = false;
  this.jumpPressedTimestamp = 0;
  this.boostPressed = false;
  this.boostPressedTimestamp = 0;
  this.leftPressed = false;
  this.leftPressedTimestamp = 0;
  this.rightPressed = false;
  this.rightPressedTimestamp = 0;
  this.upPressed = false;
  this.upPressedTimestamp = 0;
  this.downPressed = false;
  this.downPressedTimestamp = 0;
  this.lockPressed = false;
  this.lockPressedTimestamp = 0;
  this.pausePressed = false;
  this.pausePressedTimestamp = 0;

  this.editKeys = false;
  this.keyVal = null;
}


function GameEngine(player) {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.player = player;
    this.input = new InputObject;
    this.player.inputs = this.input;


    this.physParams = new PhysParams(DFLT_gravity);
    this.controlParams = new ControlParams(DFLT_gLRaccel, DFLT_aLRaccel, DFLT_aUaccel, DFLT_aDaccel, DFLT_gUaccel, DFLT_gDaccel, DFLT_gBoostLRvel, DFLT_aBoostLRvel, DFLT_aBoostDownVel, DFLT_jumpVelNormPulse, DFLT_doubleJumpVelYPulse, DFLT_doubleJumpVelYMin, DFLT_numAirCharges, 0.0, 100000000, 2, DFLT_jumpSurfaceSpeedLossRatio);
    this.playerModel = new PlayerModel(this.controlParams, DFLT_radius, new vec2(800, -400), null);
    this.physEng = new PhysEng(this.physParams, this.playerModel);
    this.player.model = this.playerModel;              // backwards add a playerModel to player.
    this.eventsSinceLastFrame = [];
    this.lastFrameTime = performance.now();
}

GameEngine.prototype.init = function(ctx) {
    this.ctx = ctx;

    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.ctx.canvas.setAttribute('tabindex', '0');
    this.ctx.canvas.focus();
    this.startInput();

	gamepadSupport.init(this); //Initialize gamepad support
    console.log('game initialized');
}

GameEngine.prototype.start = function() {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}



GameEngine.prototype.startInput = function() {
    console.log('Starting input');

    var getXandY = function(e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return {x: x, y: y};
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function(e) {
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function(e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function(e) {
        that.wheel = e;
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
      if (gameEngine.input.editKeys) {
        console.log("why are we editing?");
          if (gameEngine.input.selectedKeyVal === "LEFT") {
            gameEngine.input.leftKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "RIGHT") {
            gameEngine.input.rightKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "UP") {
            gameEngine.input.upKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "DOWN") {
            gameEngine.input.downKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "JUMP") {
            gameEngine.input.jumpKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "LOCK") {
            gameEngine.input.lockKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "BOOST") {
            gameEngine.input.boostKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          } else if (gameEngine.input.selectedKeyVal === "PAUSE") {
            gameEngine.input.pauseKey = e.keyCode;
            gameEngine.input.selectedKeyVal = null;
            gameEngine.input.editKeys = false;
          }
      } else {
        //console.log(e.keyCode);
        //console.log(gameEngine.input);
        if (e.keyCode === gameEngine.input.leftKey && gameEngine.input.leftPressed === false) {
            gameEngine.setLeft(true, performance.now());
            //console.log("Left pressed");
          } else if (e.keyCode === gameEngine.input.upKey && gameEngine.input.upPressed === false) {
            gameEngine.setUp(true, performance.now());
            //console.log("Up pressed");
          } else if (e.keyCode === gameEngine.input.rightKey && gameEngine.input.rightPressed === false) {
            gameEngine.setRight(true, performance.now());
            //console.log("Right pressed");
          } else if (e.keyCode === gameEngine.input.downKey && gameEngine.input.downPressed === false) {
            gameEngine.setDown(true, performance.now());
            //console.log("Down pressed");
          } else if (e.keyCode === gameEngine.input.jumpKey && gameEngine.input.jumpPressed === false) {
            gameEngine.setJump(true, performance.now());
            //console.log("Jump pressed");
          } else if (e.keyCode === gameEngine.input.boostKey && gameEngine.input.boostPressed === false) {
            gameEngine.setBoost(true, performance.now());
            //console.log("Boost pressed");
          } else if (e.keyCode === gameEngine.input.lockKey && gameEngine.input.lockPressed === false) {
            gameEngine.setLock(true, performance.now());
            //console.log("Lock pressed");
          } else if (e.keyCode === gameEngine.input.pauseKey && gameEngine.input.pausePressed === false) {
            gameEngine.setPause(true, performance.now());
            //console.log("Pause pressed");
			    }
        }
        //e.preventDefault();
    }, false);
    
    this.ctx.canvas.addEventListener("keyup", function (e) {
      if (e.keyCode === gameEngine.input.leftKey && gameEngine.input.leftPressed === true) {
        gameEngine.setLeft(false, performance.now());
      } else if (e.keyCode === gameEngine.input.upKey && gameEngine.input.upPressed === true) {
        gameEngine.setUp(false, performance.now());
      } else if (e.keyCode === gameEngine.input.rightKey && gameEngine.input.rightPressed === true) {
        gameEngine.setRight(false, performance.now());
      } else if (e.keyCode === gameEngine.input.downKey && gameEngine.input.downPressed === true) {
        gameEngine.setDown(false, performance.now());
      } else if (e.keyCode === gameEngine.input.jumpKey && gameEngine.input.jumpPressed === true) {
        gameEngine.setJump(false, performance.now());
      } else if (e.keyCode === gameEngine.input.boostKey && gameEngine.input.boostPressed === true) {
        gameEngine.setBoost(false, performance.now());
      } else if (e.keyCode === gameEngine.input.lockKey && gameEngine.input.lockPressed === true) {
        gameEngine.setLock(false, performance.now());
      } else if (e.keyCode === gameEngine.input.pauseKey && gameEngine.input.pausePressed === true) {
        gameEngine.setPause(false, performance.now());
      }
      //e.preventDefault();
    }, false);
    
    //console.log('Input started');
}

//Setter functions to allow gamepad functionality
GameEngine.prototype.setUp = function (upOrDown, time) {
  //console.log('   setUp');
  if (this.input.upPressed !== upOrDown) {
    this.input.upPressed = upOrDown;
    this.input.upPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventUp((time - this.lastFrameTime) / 1000, upOrDown));
  }
}

GameEngine.prototype.setDown = function (upOrDown, time) {
  if (this.input.downPressed !== upOrDown) {
    this.input.downPressed = upOrDown;
    this.input.downPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventDown((time - this.lastFrameTime) / 1000, upOrDown));
  }
}

GameEngine.prototype.setLeft = function (upOrDown, time) {
  if (this.input.leftPressed !== upOrDown) {
    this.input.leftPressed = upOrDown;
    this.input.leftPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventLeft((time - this.lastFrameTime) / 1000, upOrDown));
  } 
}

GameEngine.prototype.setRight = function (upOrDown, time) {
  if (this.input.rightPressed !== upOrDown) {
    this.input.rightPressed = upOrDown;
    this.input.rightPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventRight((time - this.lastFrameTime) / 1000, upOrDown));
  } 
}

GameEngine.prototype.setJump = function (upOrDown, time) {
  if (this.input.jumpPressed !== upOrDown) {
    this.input.jumpPressed = upOrDown;
    this.input.jumpPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventJump((time - this.lastFrameTime) / 1000, upOrDown));
  } 
}

GameEngine.prototype.setLock = function (upOrDown, time) {
  if (this.input.lockPressed !== upOrDown) {
    this.input.lockPressed = upOrDown;
    this.input.lockPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventLock((time - this.lastFrameTime) / 1000, upOrDown));
  } 
}

GameEngine.prototype.setBoost = function (upOrDown, time) {
  if (this.input.boostPressed !== upOrDown) {
    this.input.boostPressed = upOrDown;
    this.input.boostPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventBoost((time - this.lastFrameTime) / 1000, upOrDown));
  } 
}

GameEngine.prototype.setPause = function (upOrDown, time) {
  if (this.input.pausePressed !== upOrDown) {
    this.input.pausePressed = pressed;
    this.input.pausePressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventPause((time - this.lastFrameTime) / 1000, upOrDown));
  } 
}

//Function that allows the changing of the control mapping
GameEngine.prototype.changeKey = function(keyType) {
    this.input.selectedKeyVal = keyType;
    this.input.editKeys = true;
}

//When called resets defaults control settings
GameEngine.prototype.resetDefaults = function() {
  this.input.jumpKey = 65;
  this.input.boostKey = 83;
  this.input.leftKey = 37;
  this.input.rightKey = 39;
  this.input.downKey = 40;
  this.input.upKey = 38;
  this.input.lockKey = 68;
  this.input.pauseKey = 80;
}

GameEngine.prototype.addEntity = function(entity) {
    console.log('added entity');
    this.entities.push(entity);
}


/**
 * The parallax allows background to move with the user. This is being updated
 * once a frame.
 * Written by: Josef Nosov
 * 
 * @param {Canvas} ctx the canvas that is being drawn on.
 * @param {Image} backgroundImage the background image.
 * @param {double} offsetSpeed the speed offset, smaller value if you want
 * it to be slower, larger value if you want it to be faster.
 * @returns nothing.
 */
function parallax(ctx, backgroundImage, offsetSpeed, position) {
    var w = -position.x*offsetSpeed - backgroundImage.width ;
    var movePositionX =  backgroundImage.width * Math.floor((w / backgroundImage.width) + 1)  - position.x;
   
   
    var scale =  canvas.width/ initWidth * (initScale !== 0 ? initScale : 1) ;
    for (w -= movePositionX; w < canvas.width / scale - position.x*offsetSpeed - movePositionX; w += backgroundImage.width) {
        var h = -canvas.height * scale/2-position.y*offsetSpeed - backgroundImage.height;
        var movePositionY =  backgroundImage.height * Math.floor((h / backgroundImage.height) + 1) -  position.y;
        for (h -= movePositionY; h < canvas.height / scale - position.y*offsetSpeed - movePositionY; h  += backgroundImage.height) {
            ctx.drawImage(backgroundImage, w - canvas.width / scale/2,  h-canvas.height / scale/2);
        }
    }
}


GameEngine.prototype.draw = function(drawCallback) {
  
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  ctx.lineCap = "round";

  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
    this.ctx.save();

    if(initScale !== 0) {
    
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // initScale is the window's width / 16 / player width. this should allow everything to scale down
        // the player will be 1/16 the width of the window at all times and everything will scale with him.
        ctx.scale(initScale * canvas.width / initWidth, initScale * canvas.width / initWidth);
  
  
        // Adjusts the canvas' move position as well as the post scaling.
        this.ctx.translate(
        (initWidth/this.ctx.canvas.width) * this.ctx.canvas.width / initScale / 2 - this.player.model.pos.x,  
        (initWidth/this.ctx.canvas.width) * this.ctx.canvas.height / initScale / 2 - this.player.model.pos.y);
        parallax(this.ctx, ASSET_MANAGER.cache[imagePaths[0]], 1 / 4, this.player.model.pos);
        parallax(this.ctx, ASSET_MANAGER.cache[imagePaths[1]], 1 / 2, this.player.model.pos);
    }



    
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
       
    for(var i = 0; i < buttonList.length; i++) {
        if(!mouseCollidable[i].onEditMode || (mouseCollidable[i].onEditMode && editMode)) {
        buttonList[i].collider.x = buttonList[i].x = buttonList[i].ix + player.model.pos.x - (initWidth/ctx.canvas.width) * (ctx.canvas.width/ initScale / 2);
        buttonList[i].collider.y = buttonList[i].y = buttonList[i].iy + player.model.pos.y - (initWidth/ctx.canvas.width) * (ctx.canvas.height/ initScale / 2) ;

        

        this.ctx.fillStyle = buttonList[i].isSelected ? "#00FF00" : "#FF0000";
        this.ctx.fillRect(buttonList[i].x,buttonList[i].y, buttonList[i].w, buttonList[i].h);
        var size = 16;
        this.ctx.fillStyle = "black";
        this.ctx.font = "bold "+size+"px Arial";
        this.ctx.textAlign="center"; 
        this.ctx.fillText(buttonList[i].name, buttonList[i].x +  buttonList[i].w/2, buttonList[i].y  + buttonList[i].h/2 + size/2);
        //this.ctx.fillStyle = "orange";
        //this.ctx.drawRect( buttonList[i].collider.x, buttonList[i].collider.y , buttonList[i].collider.w , buttonList[i].collider.h );
// ctx.beginPath();
//      ctx.rect(xx, yy, 60,60);
//
//      ctx.lineWidth = 7;
//      ctx.strokeStyle = 'black';
//      ctx.stroke();
     
        
        }
    } 
    this.ctx.restore();
    if (drawCallback) {
      drawCallback(this);
    }
}

GameEngine.prototype.update = function() {
    var entitiesCount = this.entities.length;
    var thisFrameTime = performance.now();
    var timeDelta = thisFrameTime - this.lastFrameTime;
    this.lastFrameTime = thisFrameTime;
  //console.log("");
    if (this.eventsSinceLastFrame.length > 0) {
      console.log("we have events");
    }
    this.physEng.update(timeDelta / 1000, this.eventsSinceLastFrame);

    this.eventsSinceLastFrame = [];
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function() {
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
}


// GameBoard code below

function GameBoard() {

    Entity.call(this, null, 0, 0);
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function() {
    Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function(ctx) {

}



/**
 * QuadTree is used to create an efficient collision detection.
 * Splits the canvas into seperate partitions.
 * @returns {undefined}
 */
function QuadTree (boundingBox) {
    var boundingBox = boundingBox;
    
}





// the "main" code begins here


// The gravity, changes the gravity when the user jumps. 
var gravity = 0.21875;



// The groundY position. Will be replaced in the future.
var groundY = 0;

var canvas;
var initWidth;
var initHeight;
var ctx;
var initScale = 0;
// The assets
var imagePaths = ["assets/backgroundTile.png", "assets/midground-Tile-150x150.png", "assets/Megaman8bit.jpg", "assets/enemy.jpg", "assets/HamsterSprites.png"];

var ASSET_MANAGER = new AssetManager();
var gameEngine;
var player;

var currentLevel;
for(var i = 0; i < imagePaths.length; i++) {
    ASSET_MANAGER.queueDownload(imagePaths[i]);
}
ASSET_MANAGER.downloadAll(function() {
    console.log("starting up da sheild");
    canvas = document.getElementById('gameWorld');
     ctx = canvas.getContext('2d');
          var timer = new Timer();
     player  = new Player(canvas.width/2, canvas.height/2, timer);
    canvas.tabIndex = 1;
   
    initHeight =canvas.height = window.innerHeight;
    initWidth = canvas.width = window.innerWidth;

    initScale = initWidth / 1920;

    gameEngine = new GameEngine(player);
    gameEngine.addEntity(timer);
    groundY = canvas.height/2;
    var gameboard = new GameBoard();
    for (var i = 0; i < enemy.length; i++) {

        gameEngine.addEntity(new Unit("assets/enemy.jpg", enemy[i][0],enemy[i][1]));
    }
    //    gameEngine.addEntity(new TerrainLine(new vec2(200,200+50), new vec2(200+250,200+150), player));
    currentLevel = new TerrainManager();
    
    gameEngine.addEntity(currentLevel);
    new MapEditor(currentLevel);
   //  gameEngine.addEntity(new BezierCurve(40,100,80,20,150,180,260,100));
    gameEngine.addEntity(gameboard);
    gameEngine.addEntity(player);
    gameEngine.init(ctx);
    gameEngine.start();
   // gameEngine.startInput();




  
    var selectedItem;
    canvas.addEventListener('mousedown', function(e) {
        selectedItem = collides( e.offsetX, e.offsetY);
        if (selectedItem && selectedItem.onClick) {
            selectedItem.onClick(e);
        }
    }, false);
    canvas.addEventListener("mousemove", function(e){
//        var v =  getMousePos( e);
//        
//         xx = e.offsetX/ initScale* (initWidth/ctx.canvas.width)
//            -ctx.canvas.width/initScale/2* (initWidth/ctx.canvas.width) + player.model.pos.x ;
//       yy = e.offsetY/ initScale* (initWidth/ctx.canvas.width)- 
//            ctx.canvas.height/initScale/2* (initWidth/ctx.canvas.width)  + player.model.pos.y;
//       
        
        if (selectedItem && selectedItem.onDrag) {
            selectedItem.onDrag(e);
        }
    }, false);
    canvas.addEventListener("mouseup", function(e){
        if (selectedItem && selectedItem.onRelease) {
            selectedItem.onRelease(e);
        }
        selectedItem = null;
    }, false);
    
});



var enemy = [
    [10,10], [30,30], [50,50]
];


function localToWorld(value, dimension) {
    var scale =  canvas.width/ initWidth * (initScale !== 0 ? initScale : 1) ;

    if(dimension === "x")
        return value / initScale - (initWidth/ctx.canvas.width) * 
            ctx.canvas.width / initScale / 2 + player.model.pos.x;
    else if (dimension === "y") {
        return value / initScale - (initWidth/ctx.canvas.width) * 
            ctx.canvas.height / initScale / 2 + player.model.pos.y;
    }
}

