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

var DEBUG_KEY = 191; //BACKSPACE DEBUGSTEP

var editMovementSpeed = 50;

window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
          };
})();

function AssetManager() {
  this.successCount = 0;
  this.errorCount = 0;
  this.cache = [];
  this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
  console.log(path.toString());
  this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
  return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
  if (this.downloadQueue.length === 0)
    window.setTimeout(callback, 100);
  for (var i = 0; i < this.downloadQueue.length; i++) {
    var path = this.downloadQueue[i];
    var img = new Image();
    var that = this;
    img.addEventListener("load", function () {
      console.log("dun: " + this.src.toString());
      that.successCount += 1;
      if (that.isDone()) {
        callback();
      }
    });
    img.addEventListener("error", function () {
      that.errorCount += 1;
      if (that.isDone()) {
        callback();
      }
    });
    img.src = path;
    this.cache[path] = img;
  }
}

AssetManager.prototype.getAsset = function (path) {
  //console.log(path.toString());
  return this.cache[path];
}



function InputObject() {// NAME THESE IN VARIABLES THAT TELL WHIH KEY THEY ARE. EG
  // UP_ARROW = 38; this.upkey = UP_ARROW;  //etc
  this.jumpKey = 32;
  this.boostKey = 70;
  this.leftKey = 37;
  this.rightKey = 39;
  this.downKey = 40;
  this.upKey = 38;
  this.lockKey = 68;
  this.pauseKey = 27;

  this.jumpString = 'Space';
  this.boostString = 'F';
  this.lockString = 'D';
  this.pauseString = 'Esc';
  this.leftString = '<-';
  this.rightString = '->';

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
  this.entitiesGUI = [];
  this.menu;
  this.ctx = null;
  this.click = null;
  this.mouse = null;
  this.wheel = null;
  this.surfaceWidth = null;
  this.surfaceHeight = null;
  this.player = player;
  this.input = new InputObject;
  this.player.inputs = this.input;
  this.editPos = new vec2(0, 0);


  //this.physParams = new PhysParams(DFLT_gravity);
  //this.controlParams = new ControlParams(DFLT_gLRaccel, DFLT_aLRaccel, DFLT_aUaccel, DFLT_aDaccel, DFLT_gUaccel, DFLT_gDaccel, DFLT_gBoostLRvel, DFLT_aBoostLRvel, DFLT_aBoostDownVel, DFLT_jumpVelNormPulse, DFLT_doubleJumpVelYPulse, DFLT_doubleJumpVelYMin, DFLT_numAirCharges, 0.0, 100000000, 2, DFLT_jumpSurfaceSpeedLossRatio);
  //this.playerModel = new PlayerModel(this.controlParams, DFLT_radius, new vec2(800, -400), null);
  //this.physEng = new PhysEng(this.physParams, this.playerModel);
  //this.player.model = this.playerModel;              // backwards add a playerModel to player.


  this.lastFrameTime = performance.now();
};



GameEngine.prototype.initializePhysEng = function () {
  this.physParams = new PhysParams(DFLT_gravity, DFLT_lockThreshold, DFLT_autoLockThreshold, DFLT_surfaceSnapAngle, DFLT_pointLockRoundMinAngle, DFLT_bounceSpeedLossRatio);
  this.controlParams = new ControlParams(DFLT_gLRaccel, DFLT_aLRaccel, DFLT_aUaccel, DFLT_aDaccel, DFLT_gUaccel, DFLT_gDaccel, DFLT_gBoostLRvel, DFLT_aBoostLRvel, DFLT_aBoostDownVel, DFLT_jumpVelNormPulse, DFLT_doubleJumpVelYPulse, DFLT_doubleJumpVelYMin, DFLT_numAirCharges, 0.0, 100000000, 2, DFLT_jumpSurfaceSpeedLossRatio, DFLT_reverseAirJumpSpeed);
  this.playerModel = new PlayerModel(this.controlParams, this.physParams, 0.0, DFLT_radius, new vec2(0, 0), new vec2(0, -0), new vec2(0, -0), null);
  this.physEng = new PhysEng(this, this.playerModel);





  this.player.model = this.playerModel;              // backwards add a playerModel to player.
  this.player.model.pos = currentLevel.startPoint;

  this.eventsSinceLastFrame = [];

  this.start();
};



GameEngine.prototype.init = function (ctx) {
  this.ctx = ctx;

  this.surfaceWidth = this.ctx.canvas.width;
  this.surfaceHeight = this.ctx.canvas.height;
  this.ctx.canvas.setAttribute('tabindex', '0');
  this.ctx.canvas.focus();
  this.startInput();

  gamepadSupport.init(this); //Initialize gamepad support
  console.log('game initialized');
}



GameEngine.prototype.start = function () {
  console.log("starting game");
  //var lastTime = performance.now();
  //var newTime;
  this.physEng.start();

  var that = this;
  (function gameLoop() {
    that.loop();
    //newTime = performance.now();
    //console.log(newTime - lastTime);
    //lastTime = newTime;
    requestAnimFrame(gameLoop, that.ctx.canvas);
  })();
}

var showPause = false;
var check = false;

GameEngine.prototype.startInput = function () {
  console.log('Starting input');

  var getXandY = function (e) {
    var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
    var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

    if (x < 1024) {
      x = Math.floor(x / 32);
      y = Math.floor(y / 32);
    }

    return { x: x, y: y };
  }

  var that = this;

  this.ctx.canvas.addEventListener("click", function (e) {
    that.click = getXandY(e);
  }, false);

  this.ctx.canvas.addEventListener("mousemove", function (e) {
    that.mouse = getXandY(e);
  }, false);

  this.ctx.canvas.addEventListener("mousewheel", function (e) {
    that.wheel = e;
  }, false);

  this.ctx.canvas.addEventListener("keydown", function (e) {
    if (!editMode) {
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
    } else {
      if (e.keyCode === gameEngine.input.leftKey) {
        that.editPos.x -= editMovementSpeed;

      } if (e.keyCode === gameEngine.input.rightKey) {
        that.editPos.x += editMovementSpeed;
      }

      if (e.keyCode === gameEngine.input.upKey) {
        that.editPos.y -= editMovementSpeed;
      }
      if (e.keyCode === gameEngine.input.downKey) {
        that.editPos.y += editMovementSpeed;
      }
    }
    //e.preventDefault();
  }, false);

  this.ctx.canvas.addEventListener("keyup", function (e) {
    if (e.keyCode === DEBUG_KEY) {
      e.preventDefault();
      gameEngine.physEng.stepDebug();
    } else if (e.keyCode === gameEngine.input.leftKey && gameEngine.input.leftPressed === true) {
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
      if (!check) {
        check = true;
      } else {
        check = false;
      }
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
    this.eventsSinceLastFrame.push(new InputEventUp((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setDown = function (upOrDown, time) {
  if (this.input.downPressed !== upOrDown) {
    this.input.downPressed = upOrDown;
    this.input.downPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventDown((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setLeft = function (upOrDown, time) {
  if (this.input.leftPressed !== upOrDown) {
    this.input.leftPressed = upOrDown;
    this.input.leftPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventLeft((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setRight = function (upOrDown, time) {
  if (this.input.rightPressed !== upOrDown) {
    this.input.rightPressed = upOrDown;
    this.input.rightPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventRight((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setJump = function (upOrDown, time) {
  if (this.input.jumpPressed !== upOrDown) {
    this.input.jumpPressed = upOrDown;
    this.input.jumpPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventJump((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setLock = function (upOrDown, time) {
  if (this.input.lockPressed !== upOrDown) {
    this.input.lockPressed = upOrDown;
    this.input.lockPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventLock((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setBoost = function (upOrDown, time) {
  if (this.input.boostPressed !== upOrDown) {
    this.input.boostPressed = upOrDown;
    this.input.boostPressedTimestamp = time;
    this.eventsSinceLastFrame.push(new InputEventBoost((time) / 1000, upOrDown));
  }
}

GameEngine.prototype.setPause = function (upOrDown, time) {
  if (this.input.pausePressed !== upOrDown) {
    this.input.pausePressed = upOrDown;
    this.input.pausePressedTimestamp = time;
  }
  var time = performance.now();
  if (upOrDown) {
    if (!showPause) {
      this.eventsSinceLastFrame.push(new PauseEvent((time) / 1000));
      var pause = document.getElementById('pause');
      pause.style.display = '';
      showPause = true;
    }
    else {
      this.eventsSinceLastFrame.push(new UnpauseEvent((time) / 1000));
      var pause = document.getElementById('pause');
      pause.style.display = 'none';
      showPause = false;
    }
  }
}

//Function that allows the changing of the control mapping
GameEngine.prototype.changeKey = function (keyType) {
  this.input.selectedKeyVal = keyType;
  this.input.editKeys = true;
}

//When called resets defaults control settings
GameEngine.prototype.resetDefaults = function () {
  this.input.jumpString = 'Space';
  this.input.boostString = 'F';
  this.input.lockString = 'D';
  this.input.pauseString = 'Esc';
  this.input.leftString = '<-';
  this.input.rightString = '->';
  this.input.jumpKey = 32;
  this.input.boostKey = 70;
  this.input.leftKey = 37;
  this.input.rightKey = 39;
  this.input.downKey = 40;
  this.input.upKey = 38;
  this.input.lockKey = 68;
  this.input.pauseKey = 27;
}

//Reset control flags and time values, to be used with level restarting
GameEngine.prototype.controlReset = function () {
  this.input.jumpPressed = false;
  this.input.jumpPressedTimestamp = 0;
  this.input.boostPressed = false;
  this.input.boostPressedTimestamp = 0;
  this.input.leftPressed = false;
  this.input.leftPressedTimestamp = 0;
  this.input.rightPressed = false;
  this.input.rightPressedTimestamp = 0;
  this.input.upPressed = false;
  this.input.upPressedTimestamp = 0;
  this.input.downPressed = false;
  this.input.downPressedTimestamp = 0;
  this.input.lockPressed = false;
  this.input.lockPressedTimestamp = 0;
  this.input.pausePressed = false;
  this.input.pausePressedTimestamp = 0;
}

GameEngine.prototype.addEntity = function (entity) {
  console.log('added entity');
  if (entity instanceof GUIEntity) {

    this.entitiesGUI.push(entity);
  } else if (entity instanceof Entity) {
    this.entities.push(entity);
  }
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
  var w = -position.x / (editMode ? scaleSize : 1) * offsetSpeed - backgroundImage.width;
  var movePositionX = backgroundImage.width * Math.floor((w / backgroundImage.width) + 1) - position.x / (editMode ? scaleSize : 1);


  var scale = canvas.width / initWidth * (initScale !== 0 ? initScale : 1);
  for (w -= movePositionX; w < canvas.width / scale / (editMode ? scaleSize : 1) - position.x / (editMode ? scaleSize : 1) * offsetSpeed - movePositionX; w += backgroundImage.width) {
    var h = -canvas.height * scale / 2 - position.y / (editMode ? scaleSize : 1) * offsetSpeed - backgroundImage.height;
    var movePositionY = backgroundImage.height * Math.floor((h / backgroundImage.height) + 1) - position.y / (editMode ? scaleSize : 1);
    for (h -= movePositionY; h < canvas.height / scale / (editMode ? scaleSize : 1) - position.y / (editMode ? scaleSize : 1) * offsetSpeed - movePositionY; h += backgroundImage.height) {
      ctx.drawImage(backgroundImage, w - canvas.width / scale / 2, h - canvas.height / scale / 2);
    }
  }
}


GameEngine.prototype.draw = function (drawCallback) {

  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  ctx.lineCap = "round";

  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  this.ctx.save();


  if (initScale !== 0) {
    var hasNotChanged = canvas.width === window.innerWidth && canvas.height === window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!hasNotChanged) {
      (ctx4.canvas.style.left = (canvas.width / 2 - ctx4.canvas.width / 2));
      (ctx4.canvas.style.top = (canvas.height / 2 - ctx4.canvas.height / 2));
      (ctx2.canvas.style.left = parseInt(ctx.canvas.width) - guiPadding - ctx2.canvas.width);
      (ctx2.canvas.style.top = guiPadding);

      var item = document.getElementById('mapEditor');

      if (item) {

        var ctxGUI = item.getContext('2d');

        ctxGUI.clearRect(0, 0, ctxGUI.canvas.width, ctxGUI.canvas.height);


        for (var i = 0; i < this.entitiesGUI.length; i++) {
          this.entitiesGUI[i].draw(ctxGUI);
        }
      }

    }

    // initScale is the window's width / 16 / player width. this should allow everything to scale down
    // the player will be 1/16 the width of the window at all times and everything will scale with him.

    //  ctx.translate(   (initWidth/this.ctx.canvas.width) *this.ctx.canvas.width / 2/ initScale ,   (initWidth/this.ctx.canvas.width) * this.ctx.canvas.height / 2 / initScale );
    ctx.scale((initScale * canvas.width / initWidth) * (editMode ? scaleSize : 1), (initScale * canvas.width / initWidth) * (editMode ? scaleSize : 1));
    //  ctxGUI.scale(initScale * canvas.width / initWidth, initScale * canvas.width / initWidth);
    //     ctx.translate( (initWidth/this.ctx.canvas.width) *-this.ctx.canvas.width/ initScale,  (initWidth/this.ctx.canvas.width) *-  this.ctx.canvas.height / initScale);
    var pos = this.player.model.pos;
    if (!editMode) {
      // Adjusts the canvas' move position as well as the post scaling.

      this.editPos = new vec2(currentLevel.startPoint.x,currentLevel.startPoint.y );
      this.ctx.translate(
      (initWidth / this.ctx.canvas.width) * this.ctx.canvas.width / initScale / 2 - this.player.model.pos.x,
      (initWidth / this.ctx.canvas.width) * this.ctx.canvas.height / initScale / 2 - this.player.model.pos.y);

    } else {
      pos = this.editPos;
      this.ctx.translate(
             (initWidth / this.ctx.canvas.width) * this.ctx.canvas.width / initScale / 2 - this.editPos.x / (editMode ? scaleSize : 1),
             (initWidth / this.ctx.canvas.width) * this.ctx.canvas.height / initScale / 2 - this.editPos.y / (editMode ? scaleSize : 1));
    }
    parallax(this.ctx, ASSET_MANAGER.cache[imagePaths[0]], 1 / 4, pos);
    parallax(this.ctx, ASSET_MANAGER.cache[imagePaths[1]], 1 / 2, pos);
  }
  for (var i = 0; i < this.entities.length; i++) {
    this.entities[i].draw(this.ctx);
  }

  //    for(var i = 0; i < buttonList.length; i++) {
  //        if(!mouseCollidable[i].onEditMode || (mouseCollidable[i].onEditMode && editMode)) {
  //        buttonList[i].collider.x = buttonList[i].x = buttonList[i].ix + player.model.pos.x - (initWidth/ctx.canvas.width) * (ctx.canvas.width/ initScale / 2);
  //        buttonList[i].collider.y = buttonList[i].y = buttonList[i].iy + player.model.pos.y - (initWidth/ctx.canvas.width) * (ctx.canvas.height/ initScale / 2) ;
  //
  //
  //        this.ctx.beginPath();
  //        this.ctx.fillStyle = buttonList[i].isSelected ? "#00FF00" : "#FF0000";
  //        this.ctx.fillRect(buttonList[i].x,buttonList[i].y, buttonList[i].w, buttonList[i].h);
  //         this.ctx.stroke();
  //
  //        var size = 16;
  //        this.ctx.fillStyle = "black";
  //        this.ctx.font = "bold "+size+"px Arial";
  //        this.ctx.textAlign="center"; 
  //        this.ctx.fillText(buttonList[i].name, buttonList[i].x +  buttonList[i].w/2, buttonList[i].y  + buttonList[i].h/2 + size/2);
  //        //this.ctx.fillStyle = "orange";
  //        //this.ctx.drawRect( buttonList[i].collider.x, buttonList[i].collider.y , buttonList[i].collider.w , buttonList[i].collider.h );
  //// ctx.beginPath();
  ////      ctx.rect(xx, yy, 60,60);
  ////
  ////      ctx.lineWidth = 7;
  ////      ctx.strokeStyle = 'black';
  ////      ctx.stroke();
  //     
  //        
  //        }
  //    } 
  //    
  if (this.menu && this.menu instanceof Menu) this.menu.draw(ctxGUI);
  //this.ctx.font = "30px Arial";
  //this.ctx.fillText(player.model.pos,200 + player.model.pos.x - (initWidth/ctx.canvas.width) * (ctx.canvas.width/ initScale / 2),100 + player.model.pos.y - (initWidth/ctx.canvas.width) * (ctx.canvas.height/ initScale / 2) );
  drawDebug(this.ctx);
  this.physEng.drawDebug(this.ctx);
  this.ctx.restore();
  if (drawCallback) {
    drawCallback(this);
  }
}
GameEngine.prototype.update = function () {



  if (this.menu && this.menu instanceof Menu) {
    this.menu.update();
  } else {
    var entitiesCount = this.entities.length;
    var thisFrameTime = performance.now();
    var timeDelta = thisFrameTime - this.lastFrameTime;
    this.lastFrameTime = thisFrameTime;
    //console.log("");
    if (this.eventsSinceLastFrame.length > 0) {
      //console.log("we have events");
    }

    //results = { finished: true or false, timeFinished: timeFinished, numCollectibles: number of collectibles collected, score: points acquired, numDeaths: number of respawns from checkpoints, replay: replay JSON string }
    var results = this.physEng.update(thisFrameTime / 1000, this.eventsSinceLastFrame);

    // IF GAME OVER, CALL gameOver(the_score, the_time, the_jason, the_collect, the_num_death)



    //console.log("Time = " + this.physEng.getTime());
    //console.log(this.physEng.timeMgr.time);

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

  var x = canvas2.width / 2;
  var y = (canvas2.height / 2) + 7;
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  //timeTest(ctx2);
  ctx2.font = "20px Arial";
  var time = this.physEng.timeMgr.time;
  //var display = time.toFixed(2);
  var convertMinute = time / 60;
  var min = Math.floor(convertMinute);
  var sec = Math.floor(time) - (60 * min);
  var convertMilli = time - Math.floor(time);
  var milli = convertMilli.toFixed(2);
  var milli = milli.substring(2,4);
  var add = "";
  if (sec < 10)
  {
    add = "0"
  } 
  else
  {
    add = "";
  }
  //console.log(min + ":" + add + sec + ":" + milli);
  var format = min + ":" + add + sec + ":" + milli;
  //ctx.fillText(min + ":" + add + sec,30,35);
  ctx2.textAlign = 'center';
  ctx2.fillText(format, x, y);

  x = canvas3.width / 2;
  y = (canvas3.height / 2) + 7;
  ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
  ctx3.font = "20px Arial";
  var scoreDisplay = results.score;
  ctx3.textAlign = 'center';
  ctx3.fillText(scoreDisplay, x, y);

  
  if (!editMode) {
    var score = document.getElementById('score');
    score.style.display = '';
  }
  else {
	var score = document.getElementById('score');
    score.style.display = 'none';
  }
};

GameEngine.prototype.loop = function () {
  if (canvas.style.display === "block") { // by.min. i did this for make more faster for other cavnas.
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
  }
}

//Create pause menu buttons
var mouseX;
var mouseY;
var resumeButton;
var restartButton;
var optionsButton;
var quitButton;

GameEngine.prototype.pauseFill = function(ctx) {
    var button_height = (ctx4.canvas.height - 125) / 4;
    var button_width = ctx4.canvas.width * 0.6;
    var button_x = ctx4.canvas.width / 5;
    var button_y = ctx4.canvas.height / 21;

	resumeButton = new Button("Resume",button_x,button_width,button_y,button_height);
	ctx.beginPath();
    ctx.fillStyle="blue";
    ctx.fillRect(button_x,button_y,button_width,button_height);
    ctx.stroke();
	ctx.fillStyle="white";
	ctx.font =  "40px Arial";
    ctx.fillText("Resume",100,100);

	restartButton = new Button("Restart",button_x,button_width,button_y * 6,button_height);
	ctx.beginPath();
    ctx.fillStyle="blue";
    ctx.fillRect(button_x,button_y * 6,button_width,button_height);
    ctx.stroke();
	ctx.fillStyle="white";
	ctx.font =  "40px Arial";
    ctx.fillText("Restart",110,210);

	optionsButton = new Button("Options",button_x,button_width,button_y * 11,button_height);
	ctx.beginPath();
    ctx.fillStyle="blue";
    ctx.fillRect(button_x,button_y * 11,button_width,button_height);
    ctx.stroke();
	ctx.fillStyle="white";
	ctx.font =  "40px Arial";
    ctx.fillText("Options",110,335);

	quitButton = new Button("Quit",button_x,button_width,button_y * 16,button_height);
	ctx.beginPath();
    ctx.fillStyle="blue";
    ctx.fillRect(button_x,button_y * 16,button_width,button_height);
    ctx.stroke();
	ctx.fillStyle="white";
	ctx.font =  "40px Arial";
    ctx.fillText("Quit",135,450);
}

var backButton;
var resetButton;
var jumpButton;
var boostButton;
var lockButton;
var pauseButton;
var leftButton;
var rightButton;

/*
var returnButton = new Button("Return", 475, 825, 125, 215);
var jumpButton = new Button("Jump", 500, 650, 215, 265);
var boostButton = new Button("Boost", 500, 650, 290, 340);
var lockButton = new Button("Lock", 500, 650, 365, 415);
var pauseButton = new Button("Pause", 500, 650, 440, 490);
var leftButton = new Button("Left", 500, 650, 515, 565);
var rightButton = new Button("Right", 500, 650, 590, 640);
*/

GameEngine.prototype.remapFill = function (ctx) {
    var button_height = ctx5.canvas.height / 11;
    var button_width = (ctx5.canvas.width - 75) /2;
    var button_x = ctx5.canvas.width / 15;
    var button_y = ctx5.canvas.height / 22;

	console.log("Check val: " + button_width + ", " + button_x + ", " + button_height + ", " + button_y);
/*
  ctx.fillStyle = "blue";
  ctx.font = "40px Arial";
  ctx.fillText("Remap Keys", 60, 60);*/

  backButton = new Button("Back",button_x, button_width, button_y, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Back", 65, 60);

  resetButton = new Button("Reset",button_x * 8, button_width, button_y, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x * 8, button_y, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Reset", 235, 60);

  jumpButton = new Button("Jump",button_x, button_width, button_y * 4, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y * 4, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Jump", 60, 135);
  ctx.fillStyle = "blue";
  ctx.font = "30px Arial";
  ctx.fillText(gameEngine.input.jumpString, 200, 135);

  boostButton = new Button("Boost",button_x, button_width, button_y * 7, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y * 7, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Boost", 60, 210);
  ctx.fillStyle = "blue";
  ctx.font = "30px Arial";
  ctx.fillText(gameEngine.input.boostString, 200, 210);

  lockButton = new Button("Lock",button_x, button_width, button_y * 10, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y * 10, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Lock", 60, 285);
  ctx.fillStyle = "blue";
  ctx.font = "30px Arial";
  ctx.fillText(gameEngine.input.lockString, 200, 285);

  pauseButton = new Button("Pause",button_x, button_width, button_y * 13, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y * 13, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Pause", 60, 360);
  ctx.fillStyle = "blue";
  ctx.font = "30px Arial";
  ctx.fillText(gameEngine.input.pauseString, 200, 360);

  leftButton = new Button("Left",button_x, button_width, button_y * 16, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y * 16, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Left", 60, 435);
  ctx.fillStyle = "blue";
  ctx.font = "30px Arial";
  ctx.fillText(gameEngine.input.leftString, 200, 435);

  rightButton = new Button("Right",button_x, button_width, button_y * 19, button_height);
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.fillRect(button_x, button_y * 19, button_width, button_height);
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Right", 60, 510);
  ctx.fillStyle = "blue";
  ctx.font = "30px Arial";
  ctx.fillText(gameEngine.input.rightString, 200, 510);
}

//Button objects
function Button (name,x,w,y,h) {
	this.name = name;
	this.x = parseInt(x);
	this.w = parseInt(w);
	this.y = parseInt(y);
	this.h = parseInt(h);
	console.log("Initialized. Name: " + this.name + ", X: " + this.x +", Y: " + this.y + ", W: " + this.w + ", H: " + this.h);
}

Button.prototype.checkClicked = function() {
        console.log(mouseX, mouseY);

	var left = this.x;
	var right = this.x + this.w;
	var top = this.y;
	var bottom = this.y + this.h;

	if (mouseX < this.x + this.w && mouseX > this.x && mouseY < this.y + this.h && mouseY > this.y) {
		return true;
	}
	else {
		console.log("xL: " + this.x + ", xR: " + (this.x + this.w )+ ", yT: " + this.y + ", yB: " + (this.y + this.h ));
		return false;
	}
};


function pauseClicked(e) {
  mouseX = e.clientX - ctx4.canvas.getBoundingClientRect().left;
  mouseY = e.clientY - ctx4.canvas.getBoundingClientRect().top;
  console.log("X: " + mouseX + ", Y: " + mouseY + ", Result: " + optionsButton.checkClicked());
  //If statements to test for the different buttons
  if (optionsButton.checkClicked()) {
    console.log("Options!");
    var remap = document.getElementById('remap');
    remap.style.display = '';
    ctx5.canvas.addEventListener('click', remapClicked, false);
    ctx5.canvas.addEventListener('keydown', setKeys, false);
    ctx5.canvas.setAttribute('tabindex', '1');
    ctx5.canvas.focus();
    var pause = document.getElementById('pause');
    pause.style.display = 'none';
    ctx4.canvas.removeEventListener('click', pauseClicked, false);
  } else if (resumeButton.checkClicked()) {
    console.log("Resume!");
    //Fix bug
    gameEngine.setPause(true, performance.now());
  } else if (restartButton.checkClicked()) {
    // written by Min -----
    currentLevel.loadFromFile(my_g_level_id);
    canvas3.style.display = "none";
    canvas4.style.display = "none";
    //---------------
    console.log("Restart!");
  } else if (quitButton.checkClicked()) {
    // written by Min -----
    var array = [1234, 5.34, 12, 3];
    displayLeaderBoard(array);
    canvas3.style.display = "none";
    canvas4.style.display = "none";
    //---------------
    console.log("Quit!");
  }
}

function remapClicked(e) {
  mouseX = e.clientX - ctx5.canvas.getBoundingClientRect().left;
  mouseY = e.clientY - ctx5.canvas.getBoundingClientRect().top;
  console.log("X: " + mouseX + ", Y: " + mouseY + ", Result: " + optionsButton.checkClicked());
  if (backButton.checkClicked()) {
    console.log("Return!");
    var pause = document.getElementById('pause');
    pause.style.display = '';
    ctx4.canvas.addEventListener('click', pauseClicked, false);
    var remap = document.getElementById('remap');
    remap.style.display = 'none';
    ctx5.canvas.removeEventListener('click', remapClicked, false);
    ctx5.canvas.removeEventListener('keydown', setKeys, false);
  } else if (jumpButton.checkClicked()) {
    console.log("Jump!");
    gameEngine.input.editKeys = true;
    gameEngine.input.selectedKeyVal = "JUMP";
  } else if (boostButton.checkClicked()) {
    console.log("Boost!");
    gameEngine.input.editKeys = true;
    gameEngine.input.selectedKeyVal = "BOOST";
  } else if (lockButton.checkClicked()) {
    console.log("Lock!");
    gameEngine.input.editKeys = true;
    gameEngine.input.selectedKeyVal = "LOCK";
  } else if (pauseButton.checkClicked()) {
    console.log("Pause!");
    gameEngine.input.editKeys = true;
    gameEngine.input.selectedKeyVal = "PAUSE";
  } else if (leftButton.checkClicked()) {
    console.log("Left!");
    gameEngine.input.editKeys = true;
    gameEngine.input.selectedKeyVal = "LEFT";
  } else if (rightButton.checkClicked()) {
    console.log("Right!");
    gameEngine.input.editKeys = true;
    gameEngine.input.selectedKeyVal = "RIGHT";
  } else if (resetButton.checkClicked()) {
    gameEngine.resetDefaults();
	ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
	gameEngine.remapFill(ctx5);
	alert("Controls have been reset to the default mappings");
  }
}

function setKeys(e) {
  console.log("Inside!");
  if (gameEngine.input.editKeys) {
    console.log("why are we editing?");
    if (gameEngine.input.selectedKeyVal === "LEFT") {
      gameEngine.input.leftKey = e.keyCode;
      gameEngine.input.leftString = String.fromCharCode(e.keyCode);
      alert("Left movement has been remapped");
      ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
      gameEngine.remapFill(ctx5);
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "RIGHT") {
      gameEngine.input.rightKey = e.keyCode;
      gameEngine.input.rightString = String.fromCharCode(e.keyCode);
      alert("Right movement has been remapped");
      ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
      gameEngine.remapFill(ctx5);
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "UP") {
      gameEngine.input.upKey = e.keyCode;
      alert("Upward movement has been remapped");
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "DOWN") {
      gameEngine.input.downKey = e.keyCode;
      alert("Downward movement has been remapped");
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "JUMP") {
      gameEngine.input.jumpKey = e.keyCode;
      gameEngine.input.jumpString = String.fromCharCode(e.keyCode);
      alert("Jump has been remapped");
      ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
      gameEngine.remapFill(ctx5);
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "LOCK") {
      gameEngine.input.lockKey = e.keyCode;
      gameEngine.input.lockString = String.fromCharCode(e.keyCode);
      alert("Lock has been remapped");
      ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
      gameEngine.remapFill(ctx5);
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "BOOST") {
      gameEngine.input.boostKey = e.keyCode;
      gameEngine.input.boostString = String.fromCharCode(e.keyCode);
      alert("Boost has been remapped");
      ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
      gameEngine.remapFill(ctx5);
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    } else if (gameEngine.input.selectedKeyVal === "PAUSE") {
      gameEngine.input.pauseKey = e.keyCode;
      gameEngine.input.pauseString = String.fromCharCode(e.keyCode);
      alert("Pause has been remapped");
      ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
      gameEngine.remapFill(ctx5);
      gameEngine.input.selectedKeyVal = null;
      gameEngine.input.editKeys = false;
    }
  }
}

// GameBoard code below

function GameBoard() {

  Entity.call(this, null, 0, 0);
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function () {
  Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function (ctx) {

}

// the "main" code begins here


var canvas;
var canvas2;
var canvas3;
var canvas4;
var canvas5;
var initWidth;
var initHeight;
var ctx;
var ctx2;
var ctx3;
var ctx4;
var ctx5;
var levelTime;
var initScale = 0;
// The assets
var imagePaths = ["assets/backgroundTile.png", "assets/midground-Tile-150x150.png", "assets/Megaman8bit.jpg", "assets/enemy.jpg", "assets/HamsterSprites.png", "assets/dirt.jpg"];

var ASSET_MANAGER = new AssetManager();
var gameEngine;
var player;
var main;
var stage;

var currentLevel = new TerrainManager();
for (var i = 0; i < imagePaths.length; i++) {
  ASSET_MANAGER.queueDownload(imagePaths[i]);
}


// array of game canvas...
var GameCanvas = [];

var guiPadding = 20;
//--------------------------------
ASSET_MANAGER.downloadAll(function () {


  console.log("starting up da sheild");
  canvas = document.getElementById('gameWorld');
  ctx = canvas.getContext('2d');
  canvas2 = document.getElementById('time');
  ctx2 = canvas2.getContext('2d');

  canvas3 = document.getElementById('score');
  ctx3 = canvas3.getContext('2d');
  (ctx3.canvas.style.left = guiPadding);
  (ctx3.canvas.style.top = guiPadding);
  canvas4 = document.getElementById('pause');
  ctx4 = canvas4.getContext('2d');
  ctx4.canvas.addEventListener('click', pauseClicked, false);

  canvas5 = document.getElementById('remap');
  ctx5 = canvas5.getContext('2d');
  main = document.getElementById('game_manu_board').getContext('2d');
  stage = document.getElementById('stage_board').getContext('2d');

  GameCanvas.push(canvas);
  GameCanvas.push(canvas2);
  GameCanvas.push(canvas3);
  //GameCanvas.push(canvas4);
  //GameCanvas.push(canvas5);
  //ctx5.canvas.addEventListener('click',remapClicked,false);

  initHeight = canvas.height = window.innerHeight;
  initWidth = canvas.width = window.innerWidth;





  initScale = initWidth / 1920;
  var pX = function () {
    return (canvas.width / 2 - ctx4.canvas.width / 2);
  };
  var pY = function () {
    return (canvas.height / 2 - ctx4.canvas.height / 2);
  };
  var item = { x: ctx4.canvas.style.left, y: ctx4.canvas.style.top };
  console.log(item);


  (ctx2.canvas.style.left = parseInt(ctx.canvas.width) - guiPadding - ctx2.canvas.width);
  (ctx2.canvas.style.top = guiPadding);
  (ctx4.canvas.style.left = (canvas.width / 2 - ctx4.canvas.width / 2));
  (ctx4.canvas.style.top = (canvas.height / 2 - ctx4.canvas.height / 2));
  (ctx5.canvas.style.left = (canvas.width / 2 - ctx4.canvas.width / 2));
  (ctx5.canvas.style.top = (canvas.height / 2 - ctx4.canvas.height / 2));
  (stage.canvas.style.left = (canvas.width / 2 - stage.canvas.width / 2));
  (stage.canvas.style.top = (canvas.height / 2 - stage.canvas.height / 2));
  (main.canvas.style.left = (canvas.width / 2 - main.canvas.width / 2));
  (main.canvas.style.top = (canvas.height / 2 - main.canvas.height / 2));

  loadingScreen(ctx);
  //scoreTest(ctx3);

  game.settings.query(function () { // if callback is returned, run the application.


    var timer = new Timer();
    player = new Player(canvas.width / 2, canvas.height / 2, timer);
    canvas.tabIndex = 1;



    gameEngine = new GameEngine(player);
    gameEngine.addEntity(timer);
    //groundY = canvas.height/2;
    var gameboard = new GameBoard();
    //for (var i = 0; i < enemy.length; i++) {

    //    gameEngine.addEntity(new Unit("assets/enemy.jpg", enemy[i][0],enemy[i][1]));
    //}
    //    gameEngine.addEntity(new TerrainLine(new vec2(200,200+50), new vec2(200+250,200+150), player));

    gameEngine.addEntity(currentLevel);
    gameEngine.addEntity(new MapEditor(currentLevel));


    //new KeyMapping(gameEngine);
    //  gameEngine.addEntity(new BezierCurve(40,100,80,20,150,180,260,100));
    gameEngine.addEntity(gameboard);
    gameEngine.addEntity(player);
    gameEngine.pauseFill(ctx4);
    gameEngine.remapFill(ctx5); //Change
    gameEngine.init(ctx);




    var selectedItem;
    canvas.addEventListener('mousedown', function (e) {
      selectedItem = collides(e.offsetX, e.offsetY);
      if ((!button || (button && button.isSelected)) && selectedItem && selectedItem.onClick) {

        selectedItem.onClick(e);
      }
    }, false);
    canvas.addEventListener("mousemove", function (e) {


      if ((!button || (button && button.isSelected)) && selectedItem && selectedItem.onDrag) {
        selectedItem.onDrag(e);
      }
    }, false);
    canvas.addEventListener("mouseup", function (e) {
      if ((!button || (button && button.isSelected)) && selectedItem && selectedItem.onRelease) {

        selectedItem.onRelease(e);
      }
      selectedItem = null;
    }, false);

    $(canvas).bind('mousewheel', function (event) {
      if (editMode) {
        if (event.originalEvent.wheelDelta >= 0) {
          scaleSize += 0.1;


        }
        else {

          scaleSize -= 0.1;

          if (scaleSize <= 0.25) scaleSize = 0.25;

        }

      }
    });


  });
});
var scaleSize = 1;

var enemy = [
    [10, 10], [30, 30], [50, 50]
];

window.onresize = function () {
  console.log("test");
  (stage.canvas.style.left = (window.innerWidth / 2 - stage.canvas.width / 2));
  (stage.canvas.style.top = (window.innerHeight / 2 - stage.canvas.height / 2));
  (ctx5.canvas.style.left = (window.innerWidth / 2 - stage.canvas.width / 2));
  (ctx5.canvas.style.top = (window.innerHeight / 2 - stage.canvas.height / 2));
  (main.canvas.style.left = (window.innerWidth / 2 - main.canvas.width / 2));
  (main.canvas.style.top = (window.innerHeight / 2 - main.canvas.height / 2));
}

function localToWorld(value, dimension) {



  if (dimension === "x")
    return (value / initScale / (editMode ? scaleSize : 1) - (initWidth / ctx.canvas.width) *
        ctx.canvas.width / initScale / 2 + gameEngine.editPos.x / (editMode ? scaleSize : 1));
  else if (dimension === "y") {
    return (value / initScale / (editMode ? scaleSize : 1) - (initWidth / ctx.canvas.width) *
        ctx.canvas.height / initScale / 2 + gameEngine.editPos.y / (editMode ? scaleSize : 1));
  }
}

function loadingScreen(ctx) {
  var px = 30;
  ctx.font = (px) + "px Arial";
  ctx.fillText("Loading", canvas.width / 2, canvas.height / 2);
}

function scoreTest(ctx) {
  ctx.font = "10px Arial";
  ctx.fillText("HOLD \"D\" Key!", 20, 35);
}

function Rectangle(x1, y1, x2, y2) {
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2;
};

