

var debugMode = true;



/**
 * The player class is the player that is being created, allows manipulation of 
 * the controller which currently has jumping and moving.
 * Written by: Josef Nosov
 */
function Player(x, y, timer) {
    Entity.call(this, null, 0, 0, 0, 0);
    
    this.movingAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 300, 300, 300, 0.05, 11, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 1800, 300, 300, 0.1, 2, true, true);
    this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("assets/HamsterSprites.png"), 0, 0, 300, 300, 0.1, 1, true, true);
    
    this.model = null;
    
    
    this.moving = false;
    this.jumping = false;
    this.numberOfJumps = 0;
    this.hasCollided = false;

    // this.inputs = inputObject;
    this.timer = timer;
}
;



Player.prototype = new Entity();
Player.prototype.update = function() {
    //Entity.prototype.update.call(this);
    // Allows the user to jump.


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

//    if (this.inputs.rightPressed) {
//        this.moveRight();
//        if (this.inputs.rightPressed) {
//            this.movingAnimation.reverse = false;
//        }
//    } else if (this.inputs.leftPressed) {
//        this.moveLeft();
//        if (this.inputs.leftPressed) {
//            this.movingAnimation.reverse = false;
//        }
//    } else if (this.inputs.upPressed) {
//        this.moveUp();
//    } else if (this.inputs.downPressed) {
//        this.moveDown();
//    } else if (this.inputs.jumpKeyPressed) {

//    } else {

//        this.moving = false;
//    }
////    
//    if (this.moving === true) {
//        this.position.x += this.velocity_x;
//        this.position.y += this.velocity_y;
//        //  this.animation.drawFrame(this.timer.gameDelta, this.ctx, this.position.x, this.position.y);

////        screenOffsetX = this.velocity_x; // screen moves with the user.
////          screenOffsetY = this.velocity_y; // screen moves with the user.

//    }

};
Player.prototype.draw = function (ctx) {
  var scaleFactor = this.model.radius * 2 / 300;
  ctx.save();
    if (!this.ctx)
        this.ctx = ctx;
    //var centerX = this.position.x;
    //var centerY = this.position.y;
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.arc(this.model.pos.x, this.model.pos.y, this.model.radius, 0, 2 * Math.PI, false);
    ctx.stroke();
    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.timer.gameDelta
                , ctx, this.model.pos.x - this.jumpAnimation.frameWidth / 2 * scaleFactor, this.model.pos.y - this.jumpAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
    }
    else if (!this.moving && this.jumping) {
        this.movingAnimation.drawFrame(this.timer.gameDelta
                , ctx, this.model.pos.x - this.jumpAnimation.frameWidth / 2 * scaleFactor, this.model.pos.y - this.jumpAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
    }
    else if (this.moving && this.inputs.rightPressed) {
        this.facing = true;
        this.movingAnimation.drawFrame(this.timer.gameDelta
                , ctx, this.model.pos.x - this.movingAnimation.frameWidth / 2 * scaleFactor, this.model.pos.y - this.movingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, true);
    } else if (this.moving && this.inputs.leftPressed) {
        this.facing = false;
        this.movingAnimation.drawFrame(this.timer.gameDelta
                , ctx, this.model.pos.x - this.movingAnimation.frameWidth / 2 * scaleFactor, this.model.pos.y - this.movingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, false);
    }
    else {
            
            this.idleAnimation.drawFrame(0
                    , ctx, this.model.pos.x - this.movingAnimation.frameWidth / 2 * scaleFactor, this.model.pos.y - this.movingAnimation.frameHeight / 2 * scaleFactor, scaleFactor, this.facing);
    }
    // ctx.drawImage(image, this.position.x - this.width/2,  this.position.y -this.height/2, this.width, this.height);



//    
//    if(debugMode === true) {
//        ctx.beginPath();
//        
//        this.position.x = this.x;
//        this.position.y = this.y - this.height/2;
//        this.collider.radius = this.collisionRadius;
//        ctx.arc( this.collider.position.x, this.collider.position.y, this.collider.radius, 0, 2 * Math.PI, false);
//        ctx.lineWidth = 5;
//        ctx.stroke();
//    }
//    

    ctx.restore();
};
//Player.prototype.moveRight = function() {
//    this.moving = true;
//    this.velocity_x = 5;
//    this.velocity_y = 0;

//};

//Player.prototype.moveLeft = function() {
//    this.moving = true;
//    this.velocity_x = -5;
//    this.velocity_y = 0;

//};

//Player.prototype.moveUp = function() {
//    this.moving = true;
//    this.velocity_x = 0;
//    this.velocity_y = -5;
//};

//Player.prototype.moveDown = function() {
//    this.moving = true;
//    this.velocity_x = 0;
//    this.velocity_y = 5;
//};

//Player.prototype.jumpUp = function() {
//    this.moving = true;
//    this.velocity_x = 0;
//    this.velocity_y = 5;
//};