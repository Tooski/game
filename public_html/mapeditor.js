
var buttonSize = 75;


var button;
var buttonList = [];

// Button dimensions, if user is clicking in this area it will check to see
// if a button has been clicked.
var buttonListStart = new vec2(0,0), buttonListEnd = new vec2(0,0);
function MapEditorButton(name, x, y, w, h) {
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


MapEditorButton.onClick = function(e){};
MapEditorButton.onDrag = function(e){};
MapEditorButton.onRelease = function(e){};

function MapEditor(level, editMode) {
    this.level = level;
    this.editMode = editMode;
    this.createEditModeButton();
    this.createLineButton();
    this.createEraseButton();
    this.createLoadButton();
    this.createSaveButton();

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
MapEditor.prototype = new Entity();
MapEditor.constructor = MapEditor;
function getMousePos( evt) {
        var rect = canvas.getBoundingClientRect();
        
        return { 
            x: localToWorld((evt.clientX - rect.left), "x"), 
            y: localToWorld((evt.clientY - rect.top), "y")
        };
      }



MapEditor.prototype.createLineButton = function() {
    var line = new MapEditorButton("Lines", 0, (buttonSize + 5) , buttonSize, buttonSize);
    var that = this;

    line.onClick = function(e) {
        if(!this.line && !this.normal) {
            var xposition = localToWorld(e.offsetX, "x");
            var yposition = localToWorld(e.offsetY, "y");

            this.line = new TerrainLine(
                    new vec2(xposition, yposition),
                    new vec2(xposition, yposition));
             that.level.pushTerrain(this.line);
            button.isSelected = false;
        } else if (this.line && !this.normal) {
            that.level.snapTo(this.line);

            this.normal = this.line;
            if(!this.normal.normal) {
              this.normal.normal = new vec2(0, 0);
//              if (this.line.length() !== 1.0) {
//                console.log("normal length: ", this.line.length());
//                throw "ERRORRRRRRRRRRR";
//              }
            }
            this.line = null;
        } else if (!this.line && this.normal) {
            this.normal = null;
            button.isSelected = true;
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
                that.level.snapTo(this.line);

                this.normal = this.line;
                if(!this.normal.normal) {
                  this.normal.normal = new vec2(0, 0);
//                  if (this.line.length() !== 1.0) {
//                    console.log("normal length: ", this.line.length());
//                    throw "ERRORRRRRRRRRRR";
//                  }
                }
             } 
            this.line = null;

        }
    };
};

MapEditor.prototype.createEraseButton = function() {
    var erase = new MapEditorButton("Erase", 0, (buttonSize + 5) * 2, buttonSize, buttonSize);
    var that = this;

    erase.onClick = function(e) {
        var position = new vec2(localToWorld(e.offsetX, "x"), localToWorld(e.offsetY, "y"));
        for(var i = 0; i <  that.level.terrainList.length; i++) {
            if(that.level.terrainList[i].collidesWith(position, 10)) {
                that.level.removeFrom(that.level.terrainList[i]);
                that.level.terrainList.splice(i, 1);
            }
        }
    };

};


MapEditor.prototype.createLoadButton = function() {
    var erase = new MapEditorButton("Load", 0, (buttonSize + 5) * 3, buttonSize, buttonSize);
    var that = this;
     erase.onRelease = function(e) {
       //that.level.loadFromFile();
           gameEngine.menu = new Load(that.level);

       this.isSelected = button = null;

    };

};




MapEditor.prototype.createSaveButton = function() {
    var save = new MapEditorButton("Save", 0, (buttonSize + 5) * 4, buttonSize, buttonSize);
    var that = this;
    save.onRelease = function(e) {
//        var terrain = [];
//        that.level.terrainList.forEach (function(ter) {
//            
//            if(ter.adjacent0) var adj0 = ter.adjacent0.id.toString();
//            if(ter.adjacent1) var adj1 = ter.adjacent1.id.toString();
//            if(ter.normal) var norm = ter.normal;
//            terrain.push({
//                "id" : ter.id,
//                "p0" : { "x" : ter.p0.x, "y" : ter.p0.y },
//                "p1" : { "x" : ter.p1.x, "y" : ter.p1.y },
//                "normal" : { "x" : norm.x, "y" : norm.y },
//                "adjacent0" : adj0,
//                "adjacent1" : adj1 }
//                );
//            }
//        );
//    game.settings.post({"data" : JSON.stringify(terrain)});
console.log(that.level.terrainList);
    gameEngine.menu = new Save(that.level.terrainList);
        this.isSelected = button = null;

    };

};
MapEditor.prototype.createEditModeButton = function() {
    var editmode = new MapEditorButton("Edit Mode", 0, 0, buttonSize, buttonSize);
    editmode.collider.onEditMode = false;
    editmode.onRelease = function(e) {
        editMode = !editMode;
        this.isSelected = button = null;

    };
};


