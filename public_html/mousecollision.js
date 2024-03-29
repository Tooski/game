var mouseCollidable = [];

    var prevScale = 1;

function MouseCollideable(onGUILayer, x, y, w, h) {
    this.onGUILayer = onGUILayer;
    this.ix = this.x = x || 0;
    this.iy = this.y = y || 0;
    this.iw = this.w = w || 0;
    this.ih = this.h = h || 0;
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
  
  
//      if(prevScale !== (canvas.width / initWidth)) {
//          prevScale =(canvas.width / initWidth);
//            for (var i = 0; i < mouseCollidable.length; i++) {
//
//                mouseCollidable[i].x = mouseCollidable[i].ix * prevScale;
//                mouseCollidable[i].y = mouseCollidable[i].iy * prevScale;
//                mouseCollidable[i].w = mouseCollidable[i].iw * prevScale;
//                mouseCollidable[i].h = mouseCollidable[i].ih * prevScale;
//                            console.log(mouseCollidable[i].h);
//
//            }
//            
//            
//          
//          
//    }
    
    
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
    if(value.onGUILayer) {
        
    
        return (x <= (value.x + value.w) &&
            x >= value.x &&
            y  <= value.y + value.h &&
            y >= value.y);
    } else {
  
        var xInit = localToWorld (x, "x") ;
        var yInit = localToWorld (y, "y") ;
              
        return (xInit <= (value.x + value.w) &&
                  xInit >= value.x &&
                  yInit  <= value.y + value.h &&
                  yInit >= value.y);
    }
}
