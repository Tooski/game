/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*beginning of the animation class*/

/*constructor for the animationclass
 * 
 * */
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse){
    //source of the sprite sheet
    this.spriteSheet = spriteSheet;
    //x value for top left corner of sheet
    this.startX = startX;
    //y value for the to left corner of sheet
    this.startY = startY;
    //width of each frame within the animation cycle
    this.frameWidth = frameWidth;
    //height of each frame within the animation cycle
    this.frameHeight = frameHeight;
    //frame speed
    this.frameDuration = frameDuration;
    //number of frames in the animation
    this.frames = frames;
    //total time calculated by multiplying the frame rate elapse by frame
    this.totalTime = frameDuration * frames;
    //times elapsed based on clock tick from game engine
    this.elapsedTime = 0;
    //boolean is looping?
    this.loop = loop;
    //boolean reverse animation?
    this.reverse = reverse;
}

//@param tick - game engine has clockTick from timer object in constructor and tick method returns gameDelta (change in step)
//@param ctx - content of the canvas
//@param x - up/down location of frame
//@param y - forward/backword location of frame
//@param scaleBy - the scale of frame
Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy, flip, rotateBy) {
    
    
    
    var scaleBy = scaleBy || 1;
    var flip = flip ? -1 : 1;
    //track each change in step
    this.elapsedTime += tick;
    
    //looping through the frames - true when pressing left or right key
    if (this.loop) {
        //when elapsed time >= to totaltime(frameDuration * # of frames)
        //but loop is still running
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
        //loop is done and elapsed time >= to totaltime
    } else if (this.isDone()) {
        return;
    }
    //if reverse true then frames-currentFrame() else currentFrame()
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    //if framewidth + start is greater than width of spritesheet then dropdown to next row
    if ((index+1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    if(rotateBy) { 
        //ctx.translate(this.frameWidth, this.frameHeight);
        ctx.rotate(rotateBy); }
    ctx.save();
    ctx.scale(flip, 1);
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth  + offset , vindex*this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX  * flip - (flip === -1 ? this.frameWidth*scaleBy : 0) , locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
    ctx.restore();
    if(rotateBy) { 
     //   ctx.translate(-this.frameWidth/2, -this.frameHeight/2);
        ctx.rotate(-rotateBy);}
};

Animation.prototype.drawFrameFreeze = function (tick, ctx, x, y, scaleBy, flip, rotateBy) {
    
    
    
    var scaleBy = scaleBy || 1;
    var flip = flip ? -1 : 1;
    //track each change in step
    this.elapsedTime += tick;
    //var is_done = false;
    //looping through the frames - true when pressing left or right key
    if (this.loop) {
        //when elapsed time >= to totaltime(frameDuration * # of frames)
        //but loop is still running
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
        //loop is done and elapsed time >= to totaltime
    } else if (this.isDone()) {
       // return;
       console.log(this.elapsedTime );
  //     is_done = true;
      this.elapsedTime  = this.totalTime-tick;
    }
    //if reverse true then frames-currentFrame() else currentFrame()
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    //if framewidth + start is greater than width of spritesheet then dropdown to next row
    if ((index+1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    if(rotateBy) { 
        //ctx.translate(this.frameWidth, this.frameHeight);
        ctx.rotate(rotateBy); }
    ctx.save();
    ctx.scale(flip, 1);
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth  + offset , vindex*this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX  * flip - (flip === -1 ? this.frameWidth*scaleBy : 0) , locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
    ctx.restore();
    if(rotateBy) { 
     //   ctx.translate(-this.frameWidth/2, -this.frameHeight/2);
        ctx.rotate(-rotateBy);}
//    if(is_done){
//      this.elapsedTime  = this.totalTime;
//    }

};
//total elapsed time / time for each frame gets and returns the current frame
Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

//when elapsedTiem is equal or greater than totalTime animation is done
Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};


Animation.prototype.Rotation = function(ctx,x, y, angleInRadians){
    var locX = x;
    var locY = y;
    ctx.translate(locX, locY);
    ctx.rotate(angleInRadians);
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex*this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
    ctx.rotate(-angleInRadians);
    ctx.translate(-locX, -locY);
    
};

/*ending of the animation class*/