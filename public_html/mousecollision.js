var mouseCollidable = [];


function MouseCollideable(type, x, y, w, h) {
    this.type = type;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
    this.onEditMode = true;
    mouseCollidable.push(this);

}


function removeMouseCollideable(item) {
    var index = mouseCollidable.indexOf(item);
    if (index > -1) {
        mouseCollidable.splice(index, 1);
    }
};


MouseCollideable.onDrag = function(e) { };
MouseCollideable.onClick = function(e) {  };
MouseCollideable.onRelease = function(e) { };

function collides(x, y) {
  var isCollision = false;
    
  for (var i = 0; i < mouseCollidable.length; i++) {
    if ((editMode && mouseCollidable[i].onEditMode) || !mouseCollidable[i].onEditMode) {
      if (collidedWith(mouseCollidable[i], x, y)) {
        isCollision = mouseCollidable[i];
      }
    }
  }
  return isCollision;
}

function collidedWith(value, x, y) {
  var calc =  (initWidth/ctx.canvas.width) / initScale / 2;
  var xInit = x / initScale + player.model.pos.x;
  var yInit = y / initScale + player.model.pos.y;
  return (xInit - calc * ctx.canvas.width <= value.x + value.w &&
            xInit - calc * ctx.canvas.width >= value.x &&
            yInit - calc * ctx.canvas.height <= value.y + value.h &&
            yInit - calc * ctx.canvas.height >= value.y);
}