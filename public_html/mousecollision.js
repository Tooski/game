var mouseCollidable = [];


function MouseCollideable(type, x, y, w, h) {
    this.type = type;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 0;
    this.h = h || 0;
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
    if(editMode)
    for (var i = 0; i < mouseCollidable.length; i++) {
        if (collidedWith(mouseCollidable[i], x, y)) {
            isCollision = mouseCollidable[i];
        }
    }
    return isCollision;
}

function collidedWith(value, x, y) {
    return (x/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 
                    + player.position.x  <= value.x + value.w &&
                x/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 
                    + player.position.x  >= value.x && 
                y/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 
                    + player.position.y <= value.y + value.h  && 
                y/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 
                    + player.position.y >= value.y );
}