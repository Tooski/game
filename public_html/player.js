

var debugMode = true;



/**
 * The player class is the player that is being created, allows manipulation of 
 * the controller which currently has jumping and moving.
 * Written by: Josef Nosov
 */
function Player(image, x,y) {
    Entity.call(this, null, 0, 0, -1, -1);

    this.img = image;


    this.x = x - this.width/2;
    this.y = y;
    
    this.moving = false;
    this.jumping = false;
    this.collider  = new Collider();
    
    
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
        if(screenOffsetY - this.velocity_y < groundY - this.y) {
            screenOffsetY -= this.velocity_y;
            this.velocity_y -= gravity;
        } else {  
            screenOffsetY = groundY - this.y;
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
    var image = ASSET_MANAGER.cache[this.img];
    
    if(this.width === -1)
        this.width = image.naturalWidth/4;
    if(this.height  === -1)
        this.height = image.naturalHeight/4;
    if(!this.collisionRadius)
        this.collisionRadius = this.width > this.height ? this.width/2 : this.height/2;
    ctx.drawImage(image, this.x - screenOffsetX - this.width/2, this.y - screenOffsetY - this.height, this.width, this.height);
    
    if(debugMode === true) {
        ctx.beginPath();
        
        this.collider.x = this.x - screenOffsetX;
        this.collider.y = this.y - screenOffsetY - this.height/2;
        this.collider.radius = this.collisionRadius;
        ctx.arc( this.collider.x, this.collider.y, this.collider.radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = 5;
        ctx.stroke();
    }
    
}
