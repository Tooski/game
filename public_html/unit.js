/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


// Unit
function Unit(img, x, y) {
    Entity.call(this, null, 0, 0, 16, 16);
    this.img = img;
    this.x = x;
    this.y = y;
    this.velocity_y = 5;
    this.velocity_x = 5;
}
Unit.prototype = new Entity();
Unit.prototype.update = function() {
    Entity.prototype.update.call(this);
}
Unit.prototype.update = function() {
        if(this.y - this.velocity_y < groundY) {
            this.y -= this.velocity_y;
            this.velocity_y -= gravity;
        } else {
            this.y = groundY;
        }
    
}


Unit.prototype.draw = function(ctx) {
    var image = ASSET_MANAGER.cache[this.img];
    var width = image.naturalWidth/4;
    var height = image.naturalHeight/4;
    ctx.drawImage(image, this.x  - width/2, this.y  - height, width, height);
   
}