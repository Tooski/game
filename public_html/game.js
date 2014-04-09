// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

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


function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function(ctx) {
    this.ctx = ctx;

    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();

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

    console.log('Input started');
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
 * @returns {undefined}
 */
function parallax(ctx, backgroundImage, offsetSpeed) {

    var w = -screenOffsetX*offsetSpeed - backgroundImage.width;
    var movePositionX =  backgroundImage.width * Math.floor((w / backgroundImage.width) + 1);

    for (w -= movePositionX; w < canvas.width - screenOffsetX*offsetSpeed - movePositionX; w += backgroundImage.width) {
        var h = -screenOffsetY*offsetSpeed - backgroundImage.height;
        var movePositionY =  backgroundImage.height * Math.floor((h / backgroundImage.height) + 1);
        for (h -= movePositionY; h < canvas.height - screenOffsetY*offsetSpeed - movePositionY; h  += backgroundImage.height) {
            ctx.drawImage(backgroundImage, w, h);
      
        }
    }

}


GameEngine.prototype.draw = function(drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();

    parallax(this.ctx, ASSET_MANAGER.cache[imagePaths[0]], 1/4);
    parallax(this.ctx, ASSET_MANAGER.cache[imagePaths[1]], 1/2);
    
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function() {
    var entitiesCount = this.entities.length;

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

function Entity(game, x, y, width, height) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.removeFromWorld = false;
}

Entity.prototype.update = function() {
}

Entity.prototype.draw = function(ctx) {
    if (this.game.showOutlines && this.radius) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function(image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
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
    ctx.translate(screenOffsetX, screenOffsetY);

}

// Unit
function Unit(x, y) {
    Entity.call(this, null, 0, 0, 16, 16);

    this.x = x;
    this.y = y;
}
Unit.prototype = new Entity();
Unit.prototype.update = function() {
    Entity.prototype.update.call(this);
}
Unit.prototype.draw = function(ctx) {

       ctx.fillStyle = "#FF0000";
       ctx.fillRect(this.x - screenOffsetX, this.y - screenOffsetY, this.width, this.height);
   
}



/**
 * The player class is the player that is being created, allows manipulation of 
 * the controller which currently has jumping and moving.
 * Written by: Josef Nosov
 */
function Player(x,y) {
    Entity.call(this, null, 0, 0, 16, 16);
    this.x = x - this.width/2;
    this.y = y - this.height;
    groundY = 0;
    this.moving = false;
    this.jumping = false;
    this.velocity_y = 0;
    this.velocity_x = 0;
}
Player.prototype = new Entity();
Player.prototype.update = function() {
    Entity.prototype.update.call(this);
    
    // Allows the user to jump.
 
    if(!this.jumping && jumpKeyPressed) {
        this.velocity_y = 5;
        this.jumping = true;
    } 
    if (this.jumping) {
        if(screenOffsetY - this.velocity_y < groundY) {
            screenOffsetY -= this.velocity_y;
            this.velocity_y -= gravity;
        } else {  
            this.jumping = false;
        }
    } 

    // The code below doesn't allow the camera to follow the user as they jump
    // change groundY to y in order for this to work properly.
    /*
    if(!this.jumping && jumpKeyPressed) {
        this.velocity_y = 5;
        this.jumping = true;
    } 
    if (this.jumping) {
        if(this.y - this.velocity_y < groundY) {
            this.y  -= this.velocity_y;
            this.velocity_y -= gravity;
        } else {  
            this.jumping = false;
        }
    } 
    */
    
   
    if(!this.moving && rightKeyPressed) {
        this.moving = true;
        this.velocity_x = -5;
    } else if (!this.moving && leftKeyPressed) {
        this.moving = true;
        this.velocity_x = 5;
    } else {
        this.moving = false;
    }
    if(this.moving === true) {
        screenOffsetX += this.velocity_x; // screen moves with the user.
    }
        
}
Player.prototype.draw = function(ctx) {

    ctx.fillStyle = "#00FF00";
    ctx.fillRect(this.x - screenOffsetX, this.y - screenOffsetY, this.width, this.height);
    

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


// The X screen offset based on characters position
var screenOffsetX = 0;

// The Y screen offset based on characters position
var screenOffsetY = 0;

// The gravity, changes the gravity when the user jumps. 
var gravity = 0.21875;

// Key pressed, may be replaced in the future.
var jumpKeyPressed = false;
var leftKeyPressed = false;
var rightKeyPressed = false;


// The groundY position. Will be replaced in the future.
var groundY = 0;

var canvas;


// The assets
var imagePaths = ["assets/backgroundTile.png", "assets/midground-Tile-150x150.png"];

var ASSET_MANAGER = new AssetManager();

for(var i = 0; i < imagePaths.length; i++) {
    ASSET_MANAGER.queueDownload(imagePaths[i]);
}
ASSET_MANAGER.downloadAll(function() {
    console.log("starting up da sheild");
    canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var gameEngine = new GameEngine();
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight -20;
    var gameboard = new GameBoard();
    var unit = new Player(canvas.width/2, canvas.height/2);
    for (var i = 0; i < enemy.length; i++) {

        gameEngine.addEntity(new Unit(enemy[i][0],enemy[i][1]));
    }

    gameEngine.addEntity(gameboard);
    gameEngine.addEntity(unit);
    gameEngine.init(ctx);
    gameEngine.start();
    contoller(canvas);


});






/**
 * Will be changed later, this is a controller for the user.
 * Josef Nosov
 * @param {type} canvas
 * @returns {undefined}
 */
function contoller(canvas) {
    canvas.tabIndex = 1;
    canvas.addEventListener('keydown', function(e) {
        
        if (e.keyCode === 37) {
            rightKeyPressed = true;
        } else if (e.keyCode === 39) {
            leftKeyPressed = true;
        }
        if (e.keyCode === 32) {
            jumpKeyPressed = true;
        }
    }, false);
        canvas.addEventListener('keyup', function(e) {
          if (e.keyCode === 37) {
            rightKeyPressed = false;
        } else if (e.keyCode === 39) {
            leftKeyPressed = false;
        }
        if (e.keyCode === 32) {
            jumpKeyPressed = false;
        }
    }, false);
}











var enemy = [
    [10,10], [30,30], [50,50]
];





