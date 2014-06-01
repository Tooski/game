
var buttonSize = 75;


var button;
var buttonList = [];

// Button dimensions, if user is clicking in this area it will check to see
// if a button has been clicked.
var buttonListStart = new vec2(0, 0), buttonListEnd = new vec2(0, 0);
function MapEditorButton(name, x, y, w, h) {



  this.name = name;
  this.parent;
  this.ix = this.x = x;
  this.iy = this.y = y;
  this.iw = this.w = w;
  this.ih = this.h = h;
  this.isSelected = false;
  this.collider = new MouseCollideable(true, this.x, this.y, this.w, this.h);
  var that = this;
  this.trigger = function (e) {

    if (button !== that) {
      that.isSelected = button ? !(button.isSelected = false) : true;
      button = that;
    } else {

      that.isSelected = false;
      button = undefined;
    }

  };

  if (buttonListStart.x > this.x) buttonListStart.x = this.x;
  if (buttonListEnd.x < this.x + this.w) buttonListEnd.x = this.x + this.w;
  if (buttonListStart.y > this.y) buttonListStart.y = this.y;
  if (buttonListEnd.y < this.y + this.h) buttonListEnd.y = this.y + this.h;
  buttonList.push(this);
}


MapEditorButton.onClick = function (e) { };
MapEditorButton.onDrag = function (e) { };
MapEditorButton.onRelease = function (e) { };
MapEditorButton.prototype.draw = function (ctx) {


  var v = (canvas.width / initWidth) * initScale;
  if (ctx.initScale !== v) {
    ctx.initScale = v;
    ctx.canvas.width = buttonListEnd.x * ctx.initScale;
    ctx.canvas.height = buttonListEnd.y * ctx.initScale;
    ctx.scale(ctx.initScale, ctx.initScale);


  }
  this.collider.w = (this.w = this.iw) * v;
  this.collider.h = (this.h = this.ih) * v;
  this.collider.x = (this.x = this.ix) * v;
  this.collider.y = (this.y = this.iy) * v;

  ctx.beginPath();
  ctx.fillStyle = this.isSelected ? "#00FF00" : "#FF0000";
  ctx.fillRect(this.x, this.y, this.w, this.h);

  ctx.stroke();

  var size = 16;
  ctx.fillStyle = "black";
  ctx.font = "bold " + size + "px Arial";
  ctx.textAlign = "center";
  ctx.fillText(this.name, this.x + this.w / 2, this.y + this.h / 2 + size / 2);
  //    }
};

function MapEditor(level, editMode) {
  this.level = level;
  var c = new CanvasFactory({ id: "mapEditor" });
  this.ctx = c.getContext('2d');
  this.ctx.canvas = c;

  this.ctx.initScale = 1 / (initWidth / c.width) * initScale;
  this.ctx.scale(this.ctx.initScale, this.ctx.initScale);
  this.editMode = editMode || true;
  this.createEditModeButton();
  this.createLineButton(this.ctx);
  this.createGoalLineButton(this.ctx);
  this.createEraseButton();
  this.createLoadButton(this.ctx);
  this.createSaveButton(this.ctx);
  this.createCheckpointLineButton(this.ctx);
  this.createCollectibleButton(this.ctx);
  this.createStartPointButton(this.ctx);
  var that = this;
  c.addEventListener('mousedown', function (e) {

    for (var i = 0; i < buttonList.length; i++) {


      if (collidedWith(buttonList[i].collider, e.offsetX, e.offsetY)) {

        buttonList[i].trigger();
        break;
      }
    }
    for (var i = 0; i < buttonList.length; i++) {
      buttonList[i].draw(that.ctx);
    }

    if (button && button.onClick) {

      button.onClick(e);


    }
    for (var i = 0; i < buttonList.length; i++) {
      buttonList[i].draw(that.ctx);
    }
  }, false);
  c.addEventListener("mousemove", function (e) {

    if (button && !button.isSelected && button.onDrag) {
      button.onDrag(e);
    }

  }, false);

  c.addEventListener("mouseup", function (e) {

    if (button && button.onRelease) {
      button.onRelease(e);
    }
    for (var i = 0; i < buttonList.length; i++) {
      buttonList[i].draw(that.ctx);
    }
  }, false);




  canvas.addEventListener('mousedown', function (e) {

    if (button && button.onClick) {

      button.onClick(e);

    }
  }, false);
  canvas.addEventListener("mousemove", function (e) {
    if (button && !button.isSelected && button.onDrag) {
      button.onDrag(e);
    }
  }, false);

  canvas.addEventListener("mouseup", function (e) {
    if (button && button.onRelease) {
      button.onRelease(e);
    }
  }, false);





  c.width = buttonListEnd.x;
  c.height = buttonListEnd.y;

  this.draw(this.ctx);

}




MapEditor.prototype = new GUIEntity();
MapEditor.constructor = MapEditor;


MapEditor.prototype.draw = function (ctxGUI) {

  for (var i = 0; i < buttonList.length; i++) {
    buttonList[i].draw(ctxGUI);

  }
};







function getMousePos(evt) {
  var rect = canvas.getBoundingClientRect();

  return {
    x: localToWorld((evt.clientX - rect.left), "x"),
    y: localToWorld((evt.clientY - rect.top), "y")
  };
}



MapEditor.prototype.createLineButton = function (ctx) {
  var line = new MapEditorButton("Lines", 0, (buttonSize + 5), buttonSize, buttonSize);
  var that = this;

  //        line.collider.onClick = function(e) {
  //        if(button !== that) {
  //            line.isSelected = button ? !(button.isSelected = false) : true;
  //            button = that;
  //        } else {
  //            line.isSelected = false;
  //            button = null;
  //        }
  //    };






  line.onClick = function (e) {

    var left = parseInt(that.ctx.canvas.style.left);
    var top = parseInt(that.ctx.canvas.style.top);
    if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
       e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
      if (!this.line) {
        if (!this.prev || (this.prev && !this.prev.circularID)) {
          var xposition = localToWorld(e.offsetX, "x");
          var yposition = localToWorld(e.offsetY, "y");

          this.locked = this.line = new TerrainLine(
                  new vec2(xposition, yposition),
                  new vec2(xposition, yposition));
          that.level.pushTerrain(this.line);

          button.isSelected = false;
        }
      }
    }

    //
    // 
    //        if(!this.line && !this.normal) {
    //        if(document.activeElement !== ctx.canvas) {
    //     
    //            var xposition = localToWorld(e.offsetX, "x");
    //            var yposition = localToWorld(e.offsetY, "y");
    //            
    //            this.line = new TerrainLine(
    //                    new vec2(xposition, yposition),
    //                    new vec2(xposition, yposition));
    //             that.level.pushTerrain(this.line);
    //               
    //            button.isSelected = false;
    //        }
    //            
    //        } else if (this.line && !this.normal) {
    //            that.level.snapTo(this.line);
    //            this.normal = this.line;
    //            if(!this.normal.normal) {
    //              this.normal.normal = new vec2(0, 0);
    //            }
    //            this.line = null;
    //        } else if (!this.line && this.normal) {
    //           if(!this.normal.circularID) {
    //            var xposition = this.normal.p1.x;
    //            var yposition = this.normal.p1.y;
    //            
    //            this.line = new TerrainLine(
    //                    new vec2(xposition, yposition),
    //                    new vec2(xposition, yposition));
    //             that.level.pushTerrain(this.line);
    //         }
    //             this.normal = null;
    //             
    //            this.draw(ctx);
    //        }

  };
  line.onDrag = function (e) {




    if (this.line) {
      var mousePos = getMousePos(e);
      this.line.p1edit.x = (this.line.p1.x = mousePos.x) - this.line.p1edit.w / 2;
      this.line.p1edit.y = (this.line.p1.y = mousePos.y) - this.line.p1edit.h / 2;

      //console.log(this.line.p1edit);

    }

    if (this.setNormals) {
      var itr = this.prev;
      itr.normal = findNormalByMouse(e, itr);

      while (itr.adjacent1 !== this.prev) {
        var selected = itr;
        var selectedVec = selected.p0.subtract(selected.p1).normalize();
        itr = itr.adjacent1;
        var nextVec = selected.adjacent1.p1.subtract(selected.adjacent1.p0).normalize();
        var potentialNormal = nextVec.perp();
        var negPotentialNormal = potentialNormal.negate();
        var h = Math.acos(selectedVec.dot(nextVec));
        if (h > HALF_PI) {
          itr.normal = (selected.normal.dot(potentialNormal) < selected.normal.dot(negPotentialNormal) ? negPotentialNormal : potentialNormal);
        } else {
          itr.normal = (selected.normal.dot(potentialNormal) < selected.normal.dot(negPotentialNormal) ? potentialNormal : negPotentialNormal);
        }
      }
    }

  };
  line.onRelease = function (e) {

    if (this.setNormals) {
      this.locked = this.setNormals = this.prev = null;
    }


    if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {

      that.level.snapTo(this.line);
      this.locked = this.prev = this.line;



      if (!this.prev.circularID) {

        var xposition = localToWorld(e.offsetX, "x");
        var yposition = localToWorld(e.offsetY, "y");

        if (!checkBounds(this.line.p0, new vec2(xposition, yposition))) {



          this.line = new TerrainLine(
                  new vec2(this.prev.p1.x, this.prev.p1.y),
                  new vec2(xposition, yposition));

          that.level.pushTerrain(this.line);
        }
      } else {


        this.setNormals = this.line.adjacent1;
        this.line = null;

      }


    }
  };
};

MapEditor.prototype.createStartPointButton = function (ctx) {
  var line = new MapEditorButton("Start", 0, (buttonSize + 5) * 2, buttonSize, buttonSize);
  var that = this;
}

MapEditor.prototype.createCheckpointLineButton = function (ctx) {
  var line = new MapEditorButton("Check", 0, (buttonSize + 5) * 3, buttonSize, buttonSize);
  var that = this;

  line.onClick = function (e) {

    var left = parseInt(that.ctx.canvas.style.left);
    var top = parseInt(that.ctx.canvas.style.top);
    if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
       e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
      if (!this.line) {
        if (!this.prev || (this.prev && !this.prev.circularID)) {
          var xposition = localToWorld(e.offsetX, "x");
          var yposition = localToWorld(e.offsetY, "y");

          this.locked = this.line = new CheckpointLines(
                  new vec2(xposition, yposition),
                  new vec2(xposition, yposition));
          that.level.pushTerrain(this.line);

          button.isSelected = false;
        }
      }
    }
  };
  line.onDrag = function (e) {
    if (this.line) {
      var mousePos = getMousePos(e);
      this.line.p1edit.x = (this.line.p1.x = mousePos.x) - this.line.p1edit.w / 2;
      this.line.p1edit.y = (this.line.p1.y = mousePos.y) - this.line.p1edit.h / 2;
      //console.log(this.line.p1edit);
    }
  };
  line.onRelease = function (e) {
    if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {
      that.level.snapTo(this.line);
      this.locked = this.prev = this.line;
      this.setNormals = this.line.adjacent1;
      this.line = null;
    }
  };

};

MapEditor.prototype.createGoalLineButton = function (ctx) {
  var line = new MapEditorButton("Goal", 0, (buttonSize + 5) * 4, buttonSize, buttonSize);
  var that = this;

  line.onClick = function (e) {

    var left = parseInt(that.ctx.canvas.style.left);
    var top = parseInt(that.ctx.canvas.style.top);
    if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
       e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
      if (!this.line) {
        if (!this.prev || (this.prev && !this.prev.circularID)) {
          var xposition = localToWorld(e.offsetX, "x");
          var yposition = localToWorld(e.offsetY, "y");

          this.locked = this.line = new GoalLine(
                  new vec2(xposition, yposition),
                  new vec2(xposition, yposition));
          that.level.pushTerrain(this.line);

          button.isSelected = false;
        }
      }
    }
  };
  line.onDrag = function (e) {
    if (this.line) {
      var mousePos = getMousePos(e);
      this.line.p1edit.x = (this.line.p1.x = mousePos.x) - this.line.p1edit.w / 2;
      this.line.p1edit.y = (this.line.p1.y = mousePos.y) - this.line.p1edit.h / 2;
      console.log(this.line.p1edit);
    }
  };
  line.onRelease = function (e) {
    if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {
      that.level.snapTo(this.line);
      this.locked = this.prev = this.line;
      this.setNormals = this.line.adjacent1;
      this.line = null;
    }
  };

};

MapEditor.prototype.createCollectibleButton = function (ctx) {
  var line = new MapEditorButton("Collect", 0, (buttonSize + 5) * 5, buttonSize, buttonSize);
  var that = this;
}

MapEditor.prototype.createEraseButton = function () {
  var erase = new MapEditorButton("Erase", 0, (buttonSize + 5) * 6, buttonSize, buttonSize);
  var that = this;

  erase.onClick = function (e) {
    var position = new vec2(localToWorld(e.offsetX, "x"), localToWorld(e.offsetY, "y"));
    for (var i = 0; i < that.level.terrainList.length; i++) {

      if (that.level.terrainList[i].collidesWith(position, 10)) {
        var item = that.level.terrainList[i];

        that.level.terrainList.splice(i, 1);
        if (item.circularID) {
          var start, itr;
          var id = item.circularID;
          itr = start = item;
          while (itr.adjacent1 !== start) {
            itr = itr.adjacent1;

            for (var j = 0; j < that.level.terrainList.length; j++) {
              if (that.level.terrainList[j].id === itr.id) {
                that.level.terrainList.splice(j, 1);
                break;
              }
            }
          }
          for (var j = 0; j < that.level.closedTerrain.length; j++) {
            if (that.level.closedTerrain[j].id === id) {
              that.level.closedTerrain.splice(j, 1);
              break;
            }
          }
          that.level.removeFrom(itr);
        }

        that.level.removeFrom(item);
        break;
      }
    }
  };

};


MapEditor.prototype.createLoadButton = function (ctx) {
  var erase = new MapEditorButton("Load", 0, (buttonSize + 5) * 7, buttonSize, buttonSize);
  var that = this;
  erase.onRelease = function (e) {
    //that.level.loadFromFile();



    this.load = new Load(that.level, ctx);
    gameEngine.menu = this.load;
    gameEngine.menu.focus();
    this.isSelected = button = null;

  };

};




MapEditor.prototype.createSaveButton = function (ctx) {


  var save = new MapEditorButton("Save", 0, (buttonSize + 5) * 8, buttonSize, buttonSize);
  var that = this;
  save.onRelease = function (e) {
    console.log(e);

    this.save = new Save(that.level.terrainList, ctx);

    gameEngine.menu = this.save;
    gameEngine.menu.focus();
    console.log(gameEngine.menu);
    this.isSelected = button = null;

  };

};
MapEditor.prototype.createEditModeButton = function () {
  var editmode = new MapEditorButton("Edit Mode", 0, 0, buttonSize, buttonSize);
  editmode.collider.onEditMode = false;
  editmode.onRelease = function (e) {
    this.editMode = !this.editMode;
    this.isSelected = button = null;

  };
};


