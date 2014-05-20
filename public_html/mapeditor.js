
var buttonSize = 75;


var button;
var buttonList = [];

// Button dimensions, if user is clicking in this area it will check to see
// if a button has been clicked.
var buttonListStart = new vec2(0,0), buttonListEnd = new vec2(0,0);
function MapEditorButton(name, x, y, w, h) {
    
    
    
    this.name = name;
    this.parent;
    this.ix = this.x = x;
    this.iy = this.y = y;
    this.iw = this.w = w;
    this.ih = this.h = h;
    this.isSelected = false;
    this.collider = new MouseCollideable(true, this.x,this.y,this.w,this.h );

    if(buttonListStart.x > this.x) buttonListStart.x = this.x;
    if(buttonListEnd.x < this.x + this.w) buttonListEnd.x = this.x + this.w;
    if(buttonListStart.y > this.y) buttonListStart.y = this.y;
    if(buttonListEnd.y < this.y + this.h) buttonListEnd.y = this.y + this.h;
    buttonList.push(this);
}


MapEditorButton.onClick = function(e){};
MapEditorButton.onDrag = function(e){};
MapEditorButton.onRelease = function(e){};
MapEditorButton.prototype.draw = function(ctx) {
  
        
        var v = (canvas.width/initWidth) * initScale;
        if(ctx.initScale !== v) {
            ctx.initScale = v;
            ctx.canvas.width = buttonListEnd.x * ctx.initScale;
            ctx.canvas.height = buttonListEnd.y * ctx.initScale;
            ctx.scale(ctx.initScale,ctx.initScale);
         
      
        }
        this.collider.w = (this.w = this.iw) * v;
        this.collider.h = (this.h = this.ih) * v;
        this.collider.x = (this.x = this.ix) * v;
        this.collider.y = (this.y = this.iy) * v;
        
        ctx.beginPath();
        ctx.fillStyle = this.isSelected ? "#00FF00" : "#FF0000";
        ctx.fillRect(this.x,this.y, this.w, this.h);

        ctx.stroke();

        var size = 16;
        ctx.fillStyle = "black";
        ctx.font = "bold "+size+"px Arial";
        ctx.textAlign="center"; 
        ctx.fillText(this.name, this.x +  this.w/2, this.y  + this.h/2 + size/2);        
        //    }
};

function MapEditor(level, editMode) {
    this.level = level;
    var c = new CanvasFactory({id : "mapEditor"});
    this.ctx = c.getContext('2d');
    this.ctx.canvas = c;
   
    this.ctx.initScale = 1/(initWidth/c.width) * initScale;
    this.ctx.scale(this.ctx.initScale, this.ctx.initScale);
    this.editMode = editMode || true ;
    this.createEditModeButton();
    this.createLineButton(this.ctx);
    this.createEraseButton();
    this.createLoadButton(this.ctx);
    this.createSaveButton(this.ctx);
    var that = this;
    c.addEventListener('mousedown', function(e) {

       var foundButton = false;
        for(var i = 0; i < buttonList.length; i++) {
            var h = collidedWith(buttonList[i].collider,e.offsetX,e.offsetY); 
            buttonList[i].isSelected = buttonList[i].isSelected ? false : h;
            button = buttonList[i];
            buttonList[i].draw(that.ctx);
            if(h) {
                foundButton = true;
                break;
            } 
        } 
       console.log(button);
        if(button && button.onClick) {
            
            button.onClick(e);
            
        }
    }, false);
     c.addEventListener("mousemove", function(e){
        if(button && !button.isSelected && button.onDrag)  {
            button.onDrag(e);
        }
    }, false);

     c.addEventListener("mouseup", function(e){
        if(button && button.onRelease)  {
            button.onRelease(e);
        }
    }, false);
    
    
    
    
    canvas.addEventListener('mousedown', function(e) {

        if(button && button.onClick) {
            
            button.onClick(e);
            
        }
    }, false);
     canvas.addEventListener("mousemove", function(e){
        if(button && !button.isSelected && button.onDrag)  {
            button.onDrag(e);
        }
    }, false);

     canvas.addEventListener("mouseup", function(e){
        if(button && button.onRelease)  {
            button.onRelease(e);
        }
    }, false);
    
    
    

    
    c.width  = buttonListEnd.x;
    c.height = buttonListEnd.y;
    
    this.draw(this.ctx);
 
}




MapEditor.prototype = new GUIEntity();
MapEditor.constructor = MapEditor;


MapEditor.prototype.draw = function(ctxGUI) {
    
        for(var i = 0; i < buttonList.length; i++) {
            buttonList[i].draw(ctxGUI);
      
        }
};







function getMousePos( evt) {
        var rect = canvas.getBoundingClientRect();
        
        return { 
            x: localToWorld((evt.clientX - rect.left), "x"), 
            y: localToWorld((evt.clientY - rect.top), "y")
        };
      }



MapEditor.prototype.createLineButton = function(ctx) {
    var line = new MapEditorButton("Lines", 0, (buttonSize + 5) , buttonSize, buttonSize);
    var that = this;
        line.collider.onClick = function(e) {
        if(button !== that) {
            that.isSelected = button ? !(button.isSelected = false) : true;
            button = that;
        } else {
            that.isSelected = false;
            button = null;
        }
    };
    





    line.onClick = function(e) {


 
         console.log(document.activeElement);
        if(!this.line && !this.normal) {
        if(document.activeElement !== ctx.canvas) {
     
            var xposition = localToWorld(e.offsetX, "x");
            var yposition = localToWorld(e.offsetY, "y");
            
            this.line = new TerrainLine(
                    new vec2(xposition, yposition),
                    new vec2(xposition, yposition));
             that.level.pushTerrain(this.line);
               
            button.isSelected = false;
        }
            
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
            
             console.log(this.line);
            this.line = null;
        } else if (!this.line && this.normal) {
            this.normal = null;
            button.isSelected = true;
            this.draw(ctx);
        }
    
    };
    line.onDrag = function(e) {
        
       console.log(e);
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
    erase.collider.onClick = function(e) {
        if(button !== that) {
            that.isSelected = button ? !(button.isSelected = false) : true;
            button = that;
        } else {
            that.isSelected = false;
            button = null;
        }
    };
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


MapEditor.prototype.createLoadButton = function(ctx) {
    var erase = new MapEditorButton("Load", 0, (buttonSize + 5) * 3, buttonSize, buttonSize);
    var that = this;
     erase.onRelease = function(e) {
       //that.level.loadFromFile();

       
  
        if(!this.load) this.load = new Load(that.level, ctx);
        gameEngine.menu =this.load;
        gameEngine.menu.focus();
       this.isSelected = button = null;

    };

};




MapEditor.prototype.createSaveButton = function(ctx) {
    
    
    var save = new MapEditorButton("Save", 0, (buttonSize + 5) * 4, buttonSize, buttonSize);
    var that = this;
    save.onRelease = function(e) {
        console.log(e);
        
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


   if(!this.save ) this.save = new Save(that.level.terrainList, ctx);

        gameEngine.menu = this.save ;
        gameEngine.menu.focus();
        console.log(gameEngine.menu);
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


