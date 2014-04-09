/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * The player class is the player that is being created, allows manipulation of 
 * the controller which currently has jumping and moving.
 * Written by: Josef Nosov
 */


function Player(image, x,y) {
    Entity.call(this, null, 0, 0, 16, 16);
    this.x = x - this.width/2;
    this.y = y;
    this.img = image;

    this.velocity_y = 0;
    this.velocity_x = 0;
    
    this.moving = false;
    this.jumping = false;
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
    var width = image.naturalWidth/4;
    var height = image.naturalHeight/4;
    ctx.drawImage(image, this.x - screenOffsetX - width/2, this.y - screenOffsetY - height, width, height);
}
