

/**
 * The player class is the player that is being created, allows manipulation of 
 * the controller which currently has jumping and moving.
 * Written by: Josef Nosov
 */
function Player(x, y, timer) {
    Entity.call(this, null, 0, 0, 0, 0);
    this.walkingSpeed = 0.10;
    this.runningSpeed = 0.04;
    this.boostSpeed = 0.06;
    this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 0, 300, 300, 0.1, 1, true, true);
    this.walkingAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 300, 300, 300, this.walkingSpeed, 11, true, false);
    this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 600, 300, 300, this.runningSpeed, 11, true, false);
    this.groundBoostAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 900, 300, 300, this.boostSpeed, 4, false, false);
    this.jumpingAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 1800, 300, 300, 0.1, 2, true, true);
    this.airBoostAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 300, 300, 300, 0.05, 11, true, false);
this.boostTime = 0;
    this.facing = true;
    this.model = null;
    this.timer = timer;
}
;



Player.prototype = new Entity();
Player.prototype.update = function() {
    //console.log(" speed " + this.model.animationSpeed);

    if (this.model.animationSpeed === 0) {
        this.model.animationStanding = true;
    } else {
        this.model.animationStanding = false;
    }
    if (this.inputs.leftPressed) {

        this.model.animationStanding = false;
        this.facing = false;
        if (this.model.animationSpeed <= 3000) {
            this.model.animationWalking = true;
            this.model.animationRunning = false;
        } else {
            this.model.animationRunning = true;
            this.model.animationWalking = false;
        }
    }

    if (this.inputs.rightPressed) {
        this.model.animationStanding = false;
        this.model.animationFacing = "right";

        this.facing = true;
        if (this.model.animationSpeed <= 3000) {
            this.model.animationWalking = true;
            this.model.animationRunning = false;
        } else {
            this.model.animationRunning = true;
            this.model.animationWalking = false;
        }

    }

    if (this.inputs.boostPressed || this.model.animationBoosting) {
        this.boostTime += this.timer.gameDelta;
        this.model.animationBoosting = true;
        this.model.animationWalking = false;
        this.model.animationStanding = false;
        this.model.animationRunning = false;
        console.log(this.boostTime);
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
    
};


var SPRITE_WIDTH_AND_HEIGHT_IN_PX = 300;
Player.prototype.draw = function(ctx) {




    var scaleFactor = this.model.radius * 2 / SPRITE_WIDTH_AND_HEIGHT_IN_PX;
    ctx.save();
    if (!this.ctx)
        this.ctx = ctx;
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.arc(this.model.pos.x, this.model.pos.y, this.model.radius, 0, 2 * Math.PI, false);
    ctx.stroke();

    if (this.model.animationFacing === "left") {
        if (this.model.animationStanding) {
            this.idle(ctx, scaleFactor);
        } else
        if (this.model.animationWalking) {
            this.walking(ctx, scaleFactor);
        } else
        if (this.model.animationRunning) {
            this.running(ctx, scaleFactor);
        } else
        if (this.model.animationBoosting === true) {
            this.groundBoost(ctx, scaleFactor);
        }

    }
    if (this.model.animationFacing === "right") {
        if (this.model.animationStanding) {
            this.idle(ctx, scaleFactor);
        } else
        if (this.model.animationWalking) {
            this.walking(ctx, scaleFactor);
        } else
        if (this.model.animationRunning) {
            this.running(ctx, scaleFactor);
        } else

        if (this.model.animationBoosting) {
            this.groundBoost(ctx, scaleFactor);
        }

    }

    ctx.restore();
};


//Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy, flip, rotateBy)
Player.prototype.walking = function(ctx, scaleFactor) {

    this.walkingAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.walkingAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.walkingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);

};


Player.prototype.idle = function(ctx, scaleFactor) {
    this.idleAnimation.drawFrame(0
            , ctx, this.model.pos.x - this.idleAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.idleAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
};

Player.prototype.running = function(ctx, scaleFactor) {
    this.runningAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.runningAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.runningAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
};

Player.prototype.groundBoost = function(ctx, scaleFactor) {
    //console.log(" start y" + this.groundBoostAnimation.startY +", start x" + this.groundBoostAnimation.startX);
    this.groundBoostAnimation.drawFrameFreeze(this.timer.gameDelta, ctx, this.model.pos.x - this.groundBoostAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.groundBoostAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
};

Player.prototype.groundJumping = function(ctx, scaleFactor) {
    this.jumpingAnimation.drawFrame(this.timer.gameDelta, ctx, this.model.pos.x - this.jumpingAnimation.frameWidth / 2 * scaleFactor,
            this.model.pos.y - this.jumpingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
};


