
var buttonSize = 75;


var button;
var buttonList = [];

// Button dimensions, if user is clicking in this area it will check to see
// if a button has been clicked.
var buttonListStart = new vec2(0,0), buttonListEnd = new vec2(0,0);
function RemappingButton(name, x, y, w, h) {
    this.name = name;

    this.ix = this.x = x;
    this.iy = this.y = y;
    this.iw = this.w = w;
    this.ih = this.h = h;
    this.isSelected = false;
    this.collider = new MouseCollideable("button", this.x,this.y,this.w,this.h);
    var that = this;
    this.collider.onClick = function(e) {
        if(button !== that) {
            that.isSelected = button ? !(button.isSelected = false) : true;
            button = that;
        } else {
            that.isSelected = false;
            button = null;
        }
    };
    if(buttonListStart.x > this.x) buttonListStart.x = this.x;
    if(buttonListEnd.x < this.x + this.w) buttonListEnd.x = this.x + this.w;
    if(buttonListStart.y > this.y) buttonListStart.y = this.y;
    if(buttonListEnd.y < this.y + this.h) buttonListEnd.y = this.y + this.h;
    buttonList.push(this);
}

RemappingButton.onClick = function(e){};
RemappingButton.onDrag = function(e){};
RemappingButton.onRelease = function(e){};

function KeyRemapping(gameEngine) {
	this.engine = gameEngine;
	this.defaultButton(engine);
	this.leftButton(engine);
	this.rightButton(engine);

	canvas.addEventListener('mousedown', function(e) {
        if(buttonListStart.x < e.offsetX && buttonListEnd.x > e.offsetX &&
           buttonListStart.y < e.offsetY && buttonListEnd.y > e.offsetY) {
       var foundButton = false;
        for(var i = 0; i < buttonList.length; i++) {
            if(collidedWith(buttonList[i],e.offsetX,e.offsetY)) {
                foundButton = true;
                break;
                }
            }
        }
        if(!foundButton && button && button.onClick) button.onClick(e);
    }, false);
    canvas.addEventListener("mousemove", function(e){
        if(button && !button.isSelected && button.onDrag) button.onDrag(e);
    }, false);

    canvas.addEventListener("mouseup", function(e){
        if(button && button.onRelease) button.onRelease(e);
    }, false);
}
KeyRemapping.prototype = new Entity();
KeyRemapping.constructor = KeyRemapping;

KeyRemapping.prototype.defaultButton(gameEngine) {
  var reset = new RemappingButton("Reset", 100, (buttonSize + 5) , buttonSize, buttonSize);
  reset.onRelease() = function(e) {
    gameEngine.resetDeafults();
  }
}

KeyRemapping.prototype.leftButton(gameEngine) {
  var left = new RemappingButton("Left", 100, (buttonSize + 5) * 2, buttonSize, buttonSize);
  left.onRelease() = function(e) {
    gameEngine.changeKey("LEFT");
  }
}
KeyRemapping.prototype.rightButton(gameEngine) {
  var right = new RemappingButton("Right", 100, (buttonSize + 5) * 3, buttonSize, buttonSize);
  right.onRelease() = function(e) {
    gameEngine.changeKey("RIGHT");
  }
}



