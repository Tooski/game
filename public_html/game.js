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
var imagePaths = ["assets/backgroundTile.png", "assets/midground-Tile-150x150.png", "assets/Megaman8bit.jpg", "assets/enemy.jpg"];

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
    groundY = canvas.height/2;
    var gameboard = new GameBoard();
    var player = new Player("assets/Megaman8bit.jpg",canvas.width/2, canvas.height/2);
    for (var i = 0; i < enemy.length; i++) {

        gameEngine.addEntity(new Unit("assets/enemy.jpg", enemy[i][0],enemy[i][1]));
    }

    gameEngine.addEntity(gameboard);
    gameEngine.addEntity(player);
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





