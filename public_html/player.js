

/**
 * The player class is the player that is being created, allows manipulation of 
 * the controller which currently has jumping and moving.
 * Written by: Josef Nosov
 */
var HAMSTER_BALL_COLOR = "#000000";

function Player(x, y, timer) {
    Entity.call(this, null, 0, 0, 0, 0);
    this.walkingSpeed = 0.10;
    this.runningSpeed = 0.01;
    this.boostSpeed = 0.06;
    this.jumpSpeed = 0.7;
    this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("assets/Spritesheet2.png"), 0, 0, 300, 300, 0.1, 1, true, false);
    this.walkingAnimation = new Animation(ASSET_MANAGER.getAsset("assets/Spritesheet2.png"), 0, 300, 300, 300, this.walkingSpeed, 11, true, false);
    this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 600, 300, 300, this.runningSpeed, 8, true, false);
    this.groundBoostAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 900, 300, 300, this.boostSpeed, 4, false, false);
    this.jumpingAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 1800, 300, 300, this.jumpSpeed, 2, false, false);
    this.airJumpAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 1800, 300, 300, this.jumpSpeed, 2, false, false);
    this.downBoostAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 1800, 300, 300, this.jumpSpeed, 2, false, false);


    this.fallingAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 600, 900, 300, 300, 0.05, 1, true, false);
    this.boostTime = 0;
    this.facing = true;
    this.model = null;
    this.timer = timer;

  //  this.airJumpImage = new Animation(ASSET_MANAGER.getAsset("img/airJump.png"),0,0,300,300);
 //   this.boostImage = new Animation(ASSET_MANAGER.getAsset("img/boost.png"),0,0,300,300);
 //   this.groundJumpImage = new Animation(ASSET_MANAGER.getAsset("img/groundJump.png"),0,0,300,300);
 //   this.downBoostImage = new Animation(ASSET_MANAGER.getAsset("img/downBoost.png"),0,0,300,300);
}
;



Player.prototype = new Entity();
Player.prototype.update = function() {

    //console.log(this.model.animationSpeed);
    //console.log(this.model.animationAngle);
    if (this.model.animationSpeed <= 0) {
        this.model.animationStanding = true;
    } else {
        this.model.animationStanding = false;
    }

    if (this.inputs.leftPressed) {

        this.model.animationStanding = false;
        this.facing = false;
        if (this.model.animationSpeed <= 1000) {
            this.model.animationWalking = true;
            this.model.animationRunning = false;
        }
        else {
            this.model.animationRunning = true;
            console.log(this.model.animationRunning);
            this.model.animationWalking = false;
        }
    }

    if (this.inputs.rightPressed) {
        this.model.animationStanding = false;
        this.model.animationFacing = "right";
        this.facing = true;
        if (this.model.animationSpeed <= 1000) {
            this.model.animationWalking = true;
            this.model.animationRunning = false;
        } else {
            this.model.animationRunning = true;
            this.model.animationWalking = false;
        }

    }

    if (this.inputs.boostPressed || this.model.animationBoosting) {
        console.log("boostPressed " + this.inputs.boostPressed);
        this.boostTime += this.timer.gameDelta;
        this.model.animationBoosting = true;
        this.model.animationWalking = false;
        this.model.animationStanding = false;
        this.model.animationRunning = false;

        //boost durration
        if (this.boostTime > 2) {
            this.boostTime = 0;
            this.groundBoostAnimation.elapsedTime = 0;
            this.model.animationBoosting = false;
            this.model.animationWalking = true;
            this.model.animationRunning = false;
            this.model.animationStanding = false;
        }
    } else {
        //so it returns to walking and not standing
        this.groundBoostAnimation.elapsedTime = 0;
        this.model.animationBoosting = false;
        this.model.animationWalking = true;
        this.model.animationRunning = false;
        this.model.animationStanding = false;


    }


    if (this.inputs.jumpPressed) {
        console.log(this.inputs.jumpPressed);
        this.model.animationGroundJumping = true;
        this.model.animationWalking = false;
        //if(collision with ground)
        //this.model.an
        //this.model.animationRunning = false;

    }
    if (this.model.animationGroundJumping) {
        if (this.jumpingAnimation.isDone()) {
            falling = true;
            this.jumpingAnimation.elapsedTime = 0;
        }
    }
    if (falling) {
        this.model.animationGroundJumping = false;
        this.model.animationWalking = false;
        this.model.animationRunning = false;
    }
    if (this.model.surface) {
        this.model.animationGroundJumping = false;
        this.model.animationWalking = true;
        falling = false;
        this.model.animationRunning = false;
    }

};
var falling = false;

var SPRITE_WIDTH_AND_HEIGHT_IN_PX = 300;
Player.prototype.draw = function(ctx) {
    var scaleFactor = this.model.radius * 2 / SPRITE_WIDTH_AND_HEIGHT_IN_PX;
    ctx.save();
    if (!this.ctx)
        this.ctx = ctx;
    ctx.beginPath();
    ctx.strokeStyle = HAMSTER_BALL_COLOR;
    ctx.lineWidth = 8;
    ctx.arc(this.model.pos.x, this.model.pos.y, this.model.radius, 0, 2 * Math.PI, false);
    ctx.stroke();

    if (this.model.animationFacing === "left") {
        if (this.model.animationStanding) {
            this.idle(ctx, scaleFactor);
        } else if (this.model.animationGroundJumping) {
            this.groundJumping(ctx, scaleFactor);
        }
        else if (this.model.animationBoosting) {
            this.groundBoost(ctx, scaleFactor);
        } else if (this.model.animationWalking) {
            this.walking(ctx, scaleFactor);
        } else if (this.model.animationRunning) {
            this.running(ctx, scaleFactor);
        } else if (falling) {
            this.freeFall(ctx, scaleFactor);

        }

    }
    //need to add falling flag
    if (this.model.animationFacing === "right") {
        if (this.model.animationStanding) {
            this.idle(ctx, scaleFactor);
        } else if (this.model.animationGroundJumping) {
            this.groundJumping(ctx, scaleFactor);
        } else if (this.model.animationBoosting) {
            this.groundBoost(ctx, scaleFactor);
        } else if (this.model.animationWalking) {
            this.walking(ctx, scaleFactor);
        } else if (this.model.animationRunning) {
            this.running(ctx, scaleFactor);
        } else if (falling) {
            this.freeFall(ctx, scaleFactor);

        }

    }

    ctx.restore();
};

/**
 * player function to draw the frames for walking animation.
 * @param {type} ctx
 * @param {type} scaleFactor
 * @returns {undefined}
 */
Player.prototype.walking = function(ctx, scaleFactor) {

    this.walkingAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.walkingAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.walkingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};

/**
 * player function to draw frame for standing animation.
 * @param {type} ctx
 * @param {type} scaleFactor
 * @returns {undefined}
 */
Player.prototype.idle = function(ctx, scaleFactor) {
    this.idleAnimation.drawFrame(0
            , ctx, this.model.pos.x - this.idleAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.idleAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};

/**
 * player function to draw frames for running animation.
 * @param {type} ctx
 * @param {type} scaleFactor
 * @returns {undefined}
 */
Player.prototype.running = function(ctx, scaleFactor) {
    this.runningAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.runningAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.runningAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};

/**
 * player function to draw frames for ground boost animation.  no looping
 * @param {type} ctx
 * @param {type} scaleFactor
 * @returns {undefined}
 */
Player.prototype.groundBoost = function(ctx, scaleFactor) {
    //console.log(" start y" + this.groundBoostAnimation.startY +", start x" + this.groundBoostAnimation.startX);
    this.groundBoostAnimation.drawFrameFreeze(this.timer.gameDelta, ctx, this.model.pos.x - this.groundBoostAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.groundBoostAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
	
};
/**
 * player function to drwa frames for jumping from a surface animation.
 * @param {type} ctx
 * @param {type} scaleFactor
 * @returns {undefined}
 */
Player.prototype.groundJumping = function(ctx, scaleFactor) {
    this.jumpingAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.jumpingAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.jumpingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};

Player.prototype.freeFall = function(ctx, scaleFactor) {

    this.fallingAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.fallingAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.fallingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};

//airjump
Player.prototype.airJump = function(ctx, scalFactor){
    this.airJumpAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.airJumpAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.airJumpAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};

//downboost
Player.prototype.downBoost = function(ctx, scalFactor){
    this.downBoostAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.downBoostAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.downBoostAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing, this.model.animationAngle);
};
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
Player.prototype.checkSpeed = function() {
    if (this.model.animationSpeed >= 1000) {
        this.model.animationWalking = true;
        this.model.animationRunning = false;
    }
    else {
        this.model.animationWalking = false;
        this.model.animationRunning = true;
    }
};

