
var buttonSize = 75;

var terrainList = [];

var button;
var buttonList = [];

// Button dimensions, if user is clicking in this area it will check to see
// if a button has been clicked.
var buttonListStart = new vec2(0,0), buttonListEnd = new vec2(0,0);
function MapEditorButton(name, x, y, w, h) {
    this.name = name;
    this.ix = x;
    this.iy = y;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.isSelected = false;

    var that = this;
    new MouseCollideable("button", this.x,this.y,this.w,this.h).onClick = function(e) {
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
    if(buttonListStart.y > this.y) buttonListStart.x = this.x;
    if(buttonListEnd.y < this.y + this.h) buttonListEnd.y = this.y + this.h;
    buttonList.push(this);
}



MapEditorButton.onClick = function(e){};
MapEditorButton.onDrag = function(e){};
MapEditorButton.onRelease = function(e){};

function MapEditor() {
    createLineButton();
    createEraseButton();
    createLoadButton();
    createSaveButton();



//    var t1 = new TerrainLine(new vec2(200,200+50), new vec2(200+250,200+150));
//    var t2 = new TerrainLine(new vec2(200,200+50), new vec2(200+250,200-150));
//
//    pushTerrain(t1);
//    pushTerrain(t2);

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

function getMousePos( evt) {
        var rect = canvas.getBoundingClientRect();
        
        return { 
            x: (evt.clientX - rect.left)/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 
                    + player.position.x, y: (evt.clientY - rect.top)/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 
                    + player.position.y};
      }

MapEditor.prototype = new Entity();


MapEditor.prototype.update = function() {
    for(var i = 0; i < buttonList.length; i++) {
//        buttonList[i].x  = buttonList[i].ix/initScale - (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 + player.position.x;
//        buttonList[i].y = buttonList[i].iy/initScale - (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 + player.position.y;
    }
};

MapEditor.prototype.draw = function(ctx) {

    terrainList.forEach (function(ter) {
        ter.draw(ctx);
    });

    for(var i = 0; i < buttonList.length; i++) {

        ctx.fillStyle = buttonList[i].isSelected ? "#00FF00" : "#FF0000";
        ctx.fillRect(buttonList[i].x,buttonList[i].y, buttonList[i].w, buttonList[i].h);
        var size = 16;
        ctx.fillStyle = "black";
        ctx.font = "bold "+size+"px Arial";
        ctx.textAlign="center"; 
        ctx.fillText(buttonList[i].name, buttonList[i].x +  buttonList[i].w/2, buttonList[i].y  + buttonList[i].h/2 + size/2);
    }

};

function createLineButton() {
    var line = new MapEditorButton("Lines", 0, 0, buttonSize, buttonSize);

    line.onClick = function(e) {
        if(!this.line && !this.normal) {
            this.line = new TerrainLine(new vec2(e.offsetX/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 
                    + player.position.x ,e.offsetY/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 
                    + player.position.y), new vec2(e.offsetX/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 
                    + player.position.x,e.offsetY/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 
                    + player.position.y));
            pushTerrain(this.line);
            button.isSelected = false;
        } else if (this.line && !this.normal) {
            snapTo(this.line);

            this.normal = this.line;
            if(!this.normal.normal) {
                this.normal.normal = new vec2(0,0);
            }
            this.line = null;
        } else if (!this.line && this.normal) {
            button = this.normal = null;
        }
    };
    line.onDrag = function(e) {
        if(this.line) {
           var mousePos = getMousePos(e);
           this.line.p1edit.x = (this.line.p1.x = mousePos.x) - this.line.p1edit.w/2;
           this.line.p1edit.y = (this.line.p1.y = mousePos.y) - this.line.p1edit.h/2;
           
        }
        if(this.normal) {
            var oneNormal = findNormalByMouse(e, this.normal);
            this.normal.normal.x =  oneNormal.x;
            this.normal.normal.y =  oneNormal.y;

        }
    };
    line.onRelease = function(e) {
        if(this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {
             if (this.line && !this.normal) {
                snapTo(this.line);

                this.normal = this.line;
                if(!this.normal.normal) {
                    this.normal.normal = new vec2(0,0);
                }
             } 
            this.line = null;

        }
    };
}

function createEraseButton() {
    var erase = new MapEditorButton("Erase", 0, buttonSize + 5, buttonSize, buttonSize);

    erase.onClick = function(e) {
        var position = new vec2(e.offsetX/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 
                    + player.position.x, e.offsetY/ initScale - 
                    (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 
                    + player.position.y);
        for(var i = 0; i < terrainList.length; i++) {
            if(terrainList[i].collidesWith(position, 10)) {
                removeFrom(terrainList[i]);
                terrainList.splice(i, 1);
            }
        }
    };

}

function createLoadButton() {
    var erase = new MapEditorButton("Load", 0, (buttonSize + 5) * 2, buttonSize, buttonSize);

     erase.onRelease = function(e) {
        terrainList = [];
        var obj = JSON.parse(localStorage.getItem('terraindata'));
        for(var i = 0; i < obj.length; i++) {
            var ter = new TerrainLine(new vec2(obj[i].p0.x, obj[i].p0.y), new vec2(obj[i].p1.x, obj[i].p1.y));
            ter.id = obj[i].id;
            ter.normal = new vec2(obj[i].normal.x, obj[i].normal.y);
            pushTerrain (ter);
        }
        


        this.isSelected = button = null;
    };

}


function createSaveButton() {
    var save = new MapEditorButton("Save", 0, (buttonSize + 5) * 3, buttonSize, buttonSize);
    
    save.onRelease = function(e) {
        var terrain = [];
        terrainList.forEach (function(ter) {
            
            if(ter.adjacent0) var adj0 = ter.adjacent0.id.toString();
            if(ter.adjacent1) var adj1 = ter.adjacent1.id.toString();
            if(ter.normal) var norm = ter.normal;
            terrain.push({
                "id" : terrain.id,
                "p0" : { "x" : ter.p0.x, "y" : ter.p0.y },
                "p1" : { "x" : ter.p1.x, "y" : ter.p1.y },
                "normal" : { "x" : norm.x, "y" : norm.y },
                "adjacent0" : adj0,
                "adjacent1" : adj1 }
                );
            }
        );
        localStorage.setItem('terraindata', JSON.stringify(terrain));
        this.isSelected = button = null;

    };

}

var graceSize = 20;

function pushTerrain (terrain) {
    
    snapTo(terrain);

    terrainList.push(terrain);

}

function snapTo(terrain) {
       for(var i = 0; i < terrainList.length; i++) {
           if (terrain !== terrainList[i]){
        if(!terrainList[i].adjacent0 && checkBounds (terrain.p0, terrainList[i].p0)){
            terrain.p0.x = terrainList[i].p0.x = (terrain.p0.x + terrainList[i].p0.x)/2;
            terrain.p0.y = terrainList[i].p0.y = (terrain.p0.y + terrainList[i].p0.y)/2;
            terrainList[i].adjacent0 = terrain;
            terrain.adjacent0 = terrainList[i];
            break;
        } else if (!terrainList[i].adjacent1 && checkBounds (terrain.p0, terrainList[i].p1)) {
            terrain.p0.x = terrainList[i].p1.x = (terrain.p0.x + terrainList[i].p1.x)/2;
            terrain.p0.y = terrainList[i].p1.y = (terrain.p0.y + terrainList[i].p1.y)/2;
            terrainList[i].adjacent1 = terrain;
            terrain.adjacent0 = terrainList[i];
            break;
        } else if(!terrainList[i].adjacent0 && checkBounds (terrain.p1, terrainList[i].p0)){
            terrain.p1.x = terrainList[i].p0.x = (terrain.p1.x + terrainList[i].p0.x)/2;
            terrain.p1.y = terrainList[i].p0.y = (terrain.p1.y + terrainList[i].p0.y)/2;
            terrainList[i].adjacent0 = terrain;
            terrain.adjacent1 = terrainList[i];
            break;
        } else if (!terrainList[i].adjacent1 && checkBounds (terrain.p1, terrainList[i].p1)) {
            terrain.p1.x = terrainList[i].p1.x = (terrain.p1.x + terrainList[i].p1.x)/2;
            terrain.p1.y = terrainList[i].p1.y = (terrain.p1.y + terrainList[i].p1.y)/2;
            terrainList[i].adjacent1 = terrain;
            terrain.adjacent1 = terrainList[i];
            break;
        }
    }
    }

}


function removeFrom(terrain) {

        if(terrain.adjacent0){
          if(terrain.adjacent0.adjacent0 === terrain) {
            terrain.adjacent0.adjacent0 = terrain.adjacent0 = null;
          } else if (terrain.adjacent0.adjacent1 === terrain) {
            terrain.adjacent0.adjacent1 = terrain.adjacent0 = null;
          }
        } 
      if(terrain.adjacent1){
          if(terrain.adjacent1.adjacent0 === terrain) {
            terrain.adjacent1.adjacent0 = terrain.adjacent1 = null;
          } else if (terrain.adjacent1.adjacent1 === terrain) {
            terrain.adjacent1.adjacent1 = terrain.adjacent1 = null;
          }
        } 

        if(terrain.p0edit) removeMouseCollideable(terrain.p0edit);
        if(terrain.p1edit) removeMouseCollideable(terrain.p1edit);
}

function checkBounds (p1, p2) {
    return (p1.x <= p2.x + graceSize && 
           p1.x >= p2.x - graceSize && 
           p1.y <= p2.y + graceSize &&
           p1.y >= p2.y - graceSize);
}

