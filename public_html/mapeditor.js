/**
 * Jesus, Joe comment your code please for the love of all things holy this has been ridiculous to overhaul
 *
 * mapeditor.js
 *
 * Original author Joe
 * Extensively overhauled by Travis
 */

var buttonSize = 100;


var button;
var buttonList = [];
var editMode = true;
var editMovementSpeed = 10;


var graceSize = 10;




/**
 * These are lines that are stored temporarily in the editor while a polygon / set of lines / line is being drawn.
 */
function EditorLine(point0, point1, adjacent0, adjacent1) {
  this.p0 = point0;
  this.p1 = point1;
  this.normal;
  this.adjacent0 = adjacent0;
  this.adjacent1 = adjacent1;
  this.id = generateID(this);
}




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
  if (ctx.initScale !== v || ctx.isEdited) {

    ctx.initScale = v;
    ctx.canvas.width = ctx.canvas.setWidth * ctx.initScale;
    ctx.canvas.height = ctx.canvas.setHeight * ctx.initScale;
    ctx.scale(ctx.initScale, ctx.initScale);
    ctx.isEdited = false;

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
  if (!level) {
    throw "no level";
  }
  this.level = level;
  var c = new CanvasFactory({ id: "mapEditor" });
  this.ctx = c.getContext('2d');
  this.ctx.canvas = c;


  this.level.tempLines = [];   // the lines currently being drawn.

  //this.completionHandler;    // function pointer that will contain the function to call when a polygon is completed. Set by buttons.

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
  this.createIncreaseSpeedButton();
  this.createDecreaseSpeedButton();
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

  c.setWidth = c.width = buttonListEnd.x;
  c.setHeight = c.height = buttonListEnd.y;
  gameEngine.entitiesGUI.push(this);


  this.draw(this.ctx);


}




MapEditor.prototype = new GUIEntity();
MapEditor.constructor = MapEditor;



MapEditor.prototype.draw = function (ctxGUI) {

  for (var i = 0; i < buttonList.length; i++) {
    buttonList[i].draw(ctxGUI);

  }

  ctx.save();

  ctx.beginPath();
  ctx.lineWidth = 6;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#333333";

  this.level.tempLines.forEach(function (line) {

    ctx.moveTo(line.p0.x, line.p0.y);
    ctx.lineTo(line.p1.x, line.p1.y);

    //ctx.moveTo(line.adjacent0.x, line.adjacent0.y);
    //ctx.lineTo(line.adjacent1.x, line.adjacent1.y);

    //// CODE BELOW ONLY SHOWS IF EDIT MODE IS ENABLED FOR MAP EDITOR!
    if (editMode) {
      if (line.normal) {
        var midPoint = line.p0.add(line.p1).divf(2.0);

        var pNormalPosEnd = midPoint.add(line.normal.multf(20));

        line.normalPosCol.x = pNormalPosEnd.x - line.normalPosCol.w / 2;
        line.normalPosCol.y = pNormalPosEnd.y - line.normalPosCol.h / 2;

        //line.p0edit.x = line.p0.x;
        //line.p0edit.y = line.p0.y;

        //line.p1edit.x = line.p1.x;
        //line.p1edit.y = line.p1.y;

        ctx.moveTo(midPoint.x, midPoint.y);
        ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);


        //line.p0edit.x = line.p0.x;
        //line.p0edit.y = line.p0.y;

        //line.p1edit.x = line.p1.x;
        //line.p1edit.y = line.p1.y;
      }
    }
  });

  ctx.stroke();

  ctx.restore();

};







function getMousePos(evt) {
  var rect = canvas.getBoundingClientRect();

  return {
    x: localToWorld((evt.clientX - rect.left), "x"),
    y: localToWorld((evt.clientY - rect.top), "y")
  };
}






MapEditor.prototype.createLineButton = function (ctx) {
  var terrainButton = new MapEditorButton("Add Terrain", 0, (buttonSize + 5), buttonSize * 2, buttonSize);
  var that = this;
  var clicked = true;


  terrainButton.onClick = function (e) {
    console.log(this.completed);
    console.log(that.level.tempLines);
    if (this.completed) {                                     // DO SOMETHING AFTER CLICK AFTER POLYGON EXISTS

      placeNormals(e, this.prev);
      this.locked = this.prev = null;
      this.completed = false;

      console.log("completed and selected normals for terrainLine polygon.");
      that.level.addTerrain(that.level.tempLines);
      that.resetCurrent();
      that.level.modified = true;
    } else {

      if (this.line) {


        if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {

          that.snapTo(this.line);
          this.polygon = that.attemptSnap(this.line);
          this.locked = this.prev = this.line;
          if (this.polygon) {                                       // polygon was in fact created
            this.prev.polygonID = this.polygon.polyID;
          }




          if (!this.prev.polygonID) {

            var xposition = localToWorld(e.offsetX, "x");
            var yposition = localToWorld(e.offsetY, "y");

            if (!checkBounds(this.line.p0, new vec2(xposition, yposition))) {



              this.line = new EditorLine(new vec2(this.prev.p1.x, this.prev.p1.y), new vec2(xposition, yposition));
              this.line.adjacent0 = this.prev;
              this.prev.adjacent1 = this.line;

              that.level.tempLines.push(this.line);
            }
          } else {
            console.log("FUUUUDFUJSDHIUSDHBFUIHBDSF");
            if (this.line.adjacent1) this.completed = true;
            this.line = null;

          }


        }
      } else {      // create initial line point. DEBUG WAIT REALLY IS THAT WHAT THIS DOES? 
        var left = parseInt(that.ctx.canvas.style.left);
        var top = parseInt(that.ctx.canvas.style.top);
        if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
           e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
          if (!this.line) {
            if (!this.prev || (this.prev && !this.prev.polygonID)) {
              var xposition = localToWorld(e.offsetX, "x");
              var yposition = localToWorld(e.offsetY, "y");

              this.locked = this.line = new EditorLine(new vec2(xposition, yposition), new vec2(xposition, yposition));
              that.level.tempLines.push(this.line);

              button.isSelected = false;
            }
          }
        }
      }


    }
  };



  terrainButton.onDrag = function (e) {

    if (this.line) {
      var mousePos = getMousePos(e);
      //this.line.p1edit.x = (this.line.p1.x = mousePos.x) - this.line.p1edit.w / 2;
      //this.line.p1edit.y = (this.line.p1.y = mousePos.y) - this.line.p1edit.h / 2;

      this.line.p1.x = mousePos.x;
      this.line.p1.y = mousePos.y;

      //console.log(this.line.p1edit);

    }

    if (this.completed) {
      placeNormals(e, this.prev);
    }

  };

  function placeNormals(e, prev) {
    //prev = prev.adjacent1;
    var itr = prev;
    itr.normal = findNormalByMouse(e, prev);

    while (itr.adjacent1 !== prev) {
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


  terrainButton.onRelease = function (e) {


  }
};



/**
 * Selects the players starting position.
 */
MapEditor.prototype.createStartPointButton = function (ctx) {
  var start = new MapEditorButton("Move Start Pos", 0, (buttonSize + 5) * 2, buttonSize * 2, buttonSize);
  var that = this;

  start.onClick = function (e) {
    var left = parseInt(that.ctx.canvas.style.left);
    var top = parseInt(that.ctx.canvas.style.top);
    if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
       e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {

      var xposition = localToWorld(e.offsetX, "x");
      var yposition = localToWorld(e.offsetY, "y");

      that.level.setStart(new vec2(xposition, yposition));

      button.isSelected = false;
    }
  };
};


MapEditor.prototype.snapTo = function (terrain) {
  var list = this.level.tempLines;


  for (var i = 0; i < list.length; i++) {
    if (terrain !== list[i]) {
      if (!list[i].adjacent0 && checkBounds(terrain.p0, list[i].p0)) {
        terrain.p0.x = list[i].p0.x = (terrain.p0.x + list[i].p0.x) / 2;
        terrain.p0.y = list[i].p0.y = (terrain.p0.y + list[i].p0.y) / 2;
        list[i].adjacent0 = terrain;
        terrain.adjacent0 = list[i];
        break;
      } else if (!list[i].adjacent1 && checkBounds(terrain.p0, list[i].p1)) {
        terrain.p0.x = list[i].p1.x = (terrain.p0.x + list[i].p1.x) / 2;
        terrain.p0.y = list[i].p1.y = (terrain.p0.y + list[i].p1.y) / 2;
        list[i].adjacent1 = terrain;
        terrain.adjacent0 = list[i];
        break;
      } else if (!list[i].adjacent0 && checkBounds(terrain.p1, list[i].p0)) {
        terrain.p1.x = list[i].p0.x = (terrain.p1.x + list[i].p0.x) / 2;
        terrain.p1.y = list[i].p0.y = (terrain.p1.y + list[i].p0.y) / 2;
        list[i].adjacent0 = terrain;
        terrain.adjacent1 = list[i];
        break;
      } else if (!list[i].adjacent1 && checkBounds(terrain.p1, list[i].p1)) {
        terrain.p1.x = list[i].p1.x = (terrain.p1.x + list[i].p1.x) / 2;
        terrain.p1.y = list[i].p1.y = (terrain.p1.y + list[i].p1.y) / 2;
        list[i].adjacent1 = terrain;
        terrain.adjacent1 = list[i];
        break;
      }
    }
  }
};



MapEditor.prototype.createCheckpointLineButton = function (ctx) {
  var checkpoint = new MapEditorButton("Add Checkpoint", 0, (buttonSize + 5) * 3, buttonSize * 2, buttonSize);
  var that = this;

  checkpoint.onClick = function (e) {

    if (this.line) {


      if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {

        //that.snapTo(this.line);
        this.locked = this.prev = this.line;



        if (!this.prev.polygonID) {

          var xposition = localToWorld(e.offsetX, "x");
          var yposition = localToWorld(e.offsetY, "y");

          if (!checkBounds(this.line.p0, new vec2(xposition, yposition))) {



            this.line = new EditorLine(new vec2(this.prev.p1.x, this.prev.p1.y), new vec2(xposition, yposition));

            if (this.attemptSnap(this.line)) {         //true if we completed our polygon.
              that.level.tempLines.push(line);
            } else {
              that.level.tempLines.push(line);
            }
          }
        } else {


          this.setNormals = this.line.adjacent1;
          this.line = null;

        }


      }
    } else {      // create initial line point. DEBUG WAIT REALLY IS THAT WHAT THIS DOES? 
      var left = parseInt(that.ctx.canvas.style.left);
      var top = parseInt(that.ctx.canvas.style.top);
      if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
         e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
        if (!this.line) {
          if (!this.prev || (this.prev && !this.prev.polygonID)) {
            var xposition = localToWorld(e.offsetX, "x");
            var yposition = localToWorld(e.offsetY, "y");

            this.locked = this.line = new EditorLine(new vec2(xposition, yposition), new vec2(xposition, yposition));
            that.level.tempLines.push(this.line);

            button.isSelected = false;
          }
        }
      }
    }

    if (completed) {
      console.log("completed and selected normals for terrainLine polygon.");
      that.level.addCheckpoint(that.level.tempLines);
      that.resetCurrent();
      that.level.modified = true;
    }
  };



  checkpoint.onDrag = function (e) {
    if (this.line) {
      var mousePos = getMousePos(e);
      this.line.p1edit.x = (this.line.p1.x = mousePos.x) - this.line.p1edit.w / 2;
      this.line.p1edit.y = (this.line.p1.y = mousePos.y) - this.line.p1edit.h / 2;
      //console.log(this.line.p1edit);
    }
  };



  checkpoint.onRelease = function (e) {
    if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {
      that.level.snapTo(this.line);
      this.locked = this.prev = this.line;
      this.setNormals = this.line.adjacent1;
      this.line = null;
    }
  };

};



MapEditor.prototype.createGoalLineButton = function (ctx) {
  var line = new MapEditorButton("Add Goal", 0, (buttonSize + 5) * 4, buttonSize * 2, buttonSize);
  var that = this;

  line.onClick = function (e) {
    if (this.line) {


      if (this.line && this.line.p1.x !== this.line.p0.x && this.line.p1.y !== this.line.p0.y) {

        that.snapTo(this.line);
        this.locked = this.prev = this.line;



        if (!this.prev.polygonID) {

          var xposition = localToWorld(e.offsetX, "x");
          var yposition = localToWorld(e.offsetY, "y");

          if (!checkBounds(this.line.p0, new vec2(xposition, yposition))) {



            this.line = new EditorLine(new vec2(this.prev.p1.x, this.prev.p1.y), new vec2(xposition, yposition));

            if (this.attemptSnap(this.line)) {         //true if we completed our polygon.
              that.level.tempLines.push(line);
            } else {
              that.level.tempLines.push(line);
            }
          }
        } else {


          this.setNormals = this.line.adjacent1;
          this.line = null;

        }


      }
    } else {      // create initial line point. DEBUG WAIT REALLY IS THAT WHAT THIS DOES? 
      var left = parseInt(that.ctx.canvas.style.left);
      var top = parseInt(that.ctx.canvas.style.top);
      if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
         e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
        if (!this.line) {
          if (!this.prev || (this.prev && !this.prev.polygonID)) {
            var xposition = localToWorld(e.offsetX, "x");
            var yposition = localToWorld(e.offsetY, "y");

            this.locked = this.line = new EditorLine(new vec2(xposition, yposition), new vec2(xposition, yposition));
            that.level.tempLines.push(this.line);

            button.isSelected = false;
          }
        }
      }
    }

    if (completed) {
      console.log("completed and selected normals for terrainLine polygon.");
      that.level.addGoal(that.level.tempLines);
      that.resetCurrent();
      that.level.modified = true;
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
  var collect = new MapEditorButton("Collectibles", 0, (buttonSize + 5) * 5, buttonSize * 2, buttonSize);
  var that = this;

  collect.onClick = function (e) {
    var left = parseInt(that.ctx.canvas.style.left);
    var top = parseInt(that.ctx.canvas.style.top);
    if (e.offsetX > that.ctx.canvas.width + left || e.offsetX < left ||
       e.offsetY > that.ctx.canvas.height + top || e.offsetX < top) {
      var xposition = localToWorld(e.offsetX, "x");
      var yposition = localToWorld(e.offsetY, "y");

      that.level.addCollectible(new vec2(xposition, yposition));

      button.isSelected = false;
    }
  };
}




MapEditor.prototype.createEraseButton = function () {
  var erase = new MapEditorButton("Erase Lines", 0, (buttonSize + 5) * 6, buttonSize * 2, buttonSize);
  var that = this;

  erase.onClick = function (e) {
    var position = new vec2(localToWorld(e.offsetX, "x"), localToWorld(e.offsetY, "y"));

  };

};




MapEditor.prototype.createLoadButton = function (ctx) {
  var erase = new MapEditorButton("Load Level", 0, (buttonSize + 5) * 7, buttonSize * 2, buttonSize);
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


  var save = new MapEditorButton("Save Level", 0, (buttonSize + 5) * 8, buttonSize * 2, buttonSize);
  var that = this;
  save.onRelease = function (e) {
    console.log(e);

    this.save = new Save(that.level, ctx);

    gameEngine.menu = this.save;
    gameEngine.menu.focus();
    console.log(gameEngine.menu);
    this.isSelected = button = null;

  };

};





MapEditor.prototype.eraseFromArrayByClick = function (array, position) {

  for (var i = 0; i < array.length; i++) {

    if (array[i] && array[i].collidesWith(position, 10)) {

      console.log("erasing from array, index " + i + ", item: ");
      console.log(item);

      var item = array[i];

      array[i] = null;
      if (item.polygonID) {
        var start, itr;
        itr = start = item;

        while (itr.adjacent1 !== start) {
          itr = itr.adjacent1;

          delete array[itr.id];
        }

        delete that.level.polygons[item.polygonID];

        that.level.removeFrom(itr);
      }

      that.level.removeFrom(item);
      break;
    }
  }
}




MapEditor.prototype.resetCurrent = function () {
  this.level.tempLines = [];
}


function findNormalByMouse(e, line) {
  var mousePos = getMousePos(e);
  var midPoint = line.p0.add(line.p1).divf(2.0);
  var surfaceVector = line.p0.subtract(line.p1);
  var mouseVector = new vec2(mousePos.x, mousePos.y).subtract(midPoint);
  var oneNormal = surfaceVector.perp().normalize();

  if (oneNormal.dot(mouseVector.normalize()) < 0) {
    oneNormal = oneNormal.negate();
  }
  return oneNormal;
}






function normalDrag(terrain) {
  if (terrain.normal) {
    var oneNormal = terrain.p0.subtract(terrain.p1).perp().normalize();
    if (oneNormal.dot(terrain.normal) < 0) {
      oneNormal = oneNormal.negate();
    }
    terrain.normal = oneNormal;
  }
}



/**
 * the below code is what allows already placed line points to be dragged around.
 */
//MapEditor.prototype.createLineCollideables = function (line) {
//  var that = this;
//  //    if(editMode) {
//  var wh = 10;
//  line.p0edit = new MouseCollideable(false, line.p0.x - wh, line.p0.y - wh, wh * 2, wh * 2);
//  terrain.p0edit.onDrag = function (e) {
//    var xOffset = localToWorld(e.offsetX * (initWidth / ctx.canvas.width), "x");
//    var yOffset = localToWorld(e.offsetY * (initWidth / ctx.canvas.width), "y");
//    terrain.x = (terrain.p0.x = xOffset) - wh;
//    terrain.y = (terrain.p0.y = yOffset) - wh;
//    normalDrag(terrain);
//    if (terrain.adjacent0) {
//      if (terrain.adjacent0.adjacent1 === terrain) {
//        terrain.adjacent0.p1edit.x = (terrain.adjacent0.p1.x = xOffset) - wh;
//        terrain.adjacent0.p1edit.y = (terrain.adjacent0.p1.y = yOffset) - wh;
//        normalDrag(terrain.adjacent0);
//      } else if (terrain.adjacent0.adjacent0 === terrain) {
//        terrain.adjacent0.p0edit.x = (terrain.adjacent0.p0.x = xOffset) - wh;
//        terrain.adjacent0.p0edit.y = (terrain.adjacent0.p0.y = yOffset) - wh;
//        normalDrag(terrain.adjacent0);
//      }
//    }
//  };
//  terrain.p0edit.onRelease = function (e) {
//    that.snapTo(terrain);
//  };
//  terrain.p1edit = new MouseCollideable(false, terrain.p1.x - wh, terrain.p1.y - wh, wh * 2, wh * 2);
//  terrain.p1edit.onDrag = function (e) {
//    var xOffset = localToWorld(e.offsetX * (initWidth / ctx.canvas.width), "x");
//    var yOffset = localToWorld(e.offsetY * (initWidth / ctx.canvas.width), "y");
//    terrain.x = (terrain.p1.x = xOffset) - wh;
//    terrain.y = (terrain.p1.y = yOffset) - wh;
//    normalDrag(terrain);
//    if (terrain.adjacent1) {
//      if (terrain.adjacent1.adjacent1 === terrain) {
//        terrain.adjacent1.p1edit.x = (terrain.adjacent1.p1.x = xOffset) - wh;
//        terrain.adjacent1.p1edit.y = (terrain.adjacent1.p1.y = yOffset) - wh;
//        normalDrag(terrain.adjacent1);
//      } else if (terrain.adjacent1.adjacent0 === terrain) {
//        terrain.adjacent1.p0edit.x = (terrain.adjacent1.p0.x = xOffset) - wh;
//        terrain.adjacent1.p0edit.y = (terrain.adjacent1.p0.y = yOffset) - wh;
//        normalDrag(terrain.adjacent1);
//      }
//    }
//  };
//  terrain.p1edit.onRelease = function (e) {
//    that.snapTo(terrain);
//  };
//  terrain.normalPosVec = new vec2(terrain.p0.x, terrain.p0.y);
//  terrain.normalPosCol = new MouseCollideable(false, terrain.p0.x - wh, terrain.p0.y - wh, wh * 2, wh * 2);
//  terrain.normalPosCol.onDrag = function (e) {
//    if (terrain.normal) {
//      var point = findNormalByMouse(e, terrain);
//      terrain.normal.x = point.x;
//      terrain.normal.y = point.y;
//    }
//  };
//  //    }
//};




MapEditor.prototype.attemptSnap = function (line) {
  //for (var i = 0; i < this.level.tempLines.length; i++) {
  //  if (line !== this.level.tempLines[i]) {
  //    if (!this.level.tempLines[i].adjacent0 && checkBounds(line.p0, this.level.tempLines[i].p0)) {
  //      line.p0.x = this.level.tempLines[i].p0.x = (line.p0.x + this.level.tempLines[i].p0.x) / 2;
  //      line.p0.y = this.level.tempLines[i].p0.y = (line.p0.y + this.level.tempLines[i].p0.y) / 2;
  //      this.level.tempLines[i].adjacent0 = line;
  //      line.adjacent0 = this.level.tempLines[i];
  //      break;
  //    } else if (!this.level.tempLines[i].adjacent1 && checkBounds(line.p0, this.level.tempLines[i].p1)) {
  //      line.p0.x = this.level.tempLines[i].p1.x = (line.p0.x + this.level.tempLines[i].p1.x) / 2;
  //      line.p0.y = this.level.tempLines[i].p1.y = (line.p0.y + this.level.tempLines[i].p1.y) / 2;
  //      this.level.tempLines[i].adjacent1 = line;
  //      line.adjacent0 = this.level.tempLines[i];
  //      break;
  //    } else if (!this.level.tempLines[i].adjacent0 && checkBounds(line.p1, this.level.tempLines[i].p0)) {
  //      line.p1.x = this.level.tempLines[i].p0.x = (line.p1.x + this.level.tempLines[i].p0.x) / 2;
  //      line.p1.y = this.level.tempLines[i].p0.y = (line.p1.y + this.level.tempLines[i].p0.y) / 2;
  //      this.level.tempLines[i].adjacent0 = line;
  //      terrain.adjacent1 = this.level.tempLines[i];
  //      break;
  //    } else if (!this.level.tempLines[i].adjacent1 && checkBounds(line.p1, this.level.tempLines[i].p1)) {
  //      line.p1.x = this.level.tempLines[i].p1.x = (line.p1.x + this.level.tempLines[i].p1.x) / 2;
  //      line.p1.y = this.level.tempLines[i].p1.y = (line.p1.y + this.level.tempLines[i].p1.y) / 2;
  //      this.level.tempLines[i].adjacent1 = line;
  //      line.adjacent1 = this.level.tempLines[i];
  //      break;
  //    }       //ADD SNAPPING TO THINGS ALREADY IN THE LEVEL HERE.
  //  }
  //}

  var completedPolygon = false;

  var startLine = this.level.tempLines[0];

  if (line !== startLine) {
    //    line.p0 = startLine.p1;
    //    startLine.adjacent1 = line;
    //    line.adjacent0 = startLine;

    completedPolygon = true;


    var polygon = {};
    if (line.adjacent0) {
      polygon[line.adjacent0.id] = line.adjacent0;
      var d = checkPolygon(line.adjacent0, polygon, line, {});
      console.log(d);


      if (!line.polygonID && d) {
        //this.level.tempLines = [];
        var poly = new Polygon(polygon);
        //this.level.addPolygon(poly);
        return poly;

      }
    }


  }


  if (line.adjacent0) {

  }

  return completedPolygon;
};





MapEditor.prototype.removeFrom = function (terrain) {

  if (terrain.adjacent0) {
    if (terrain.adjacent0.adjacent0 === terrain) {
      terrain.adjacent0.adjacent0 = terrain.adjacent0 = null;
    } else if (terrain.adjacent0.adjacent1 === terrain) {
      terrain.adjacent0.adjacent1 = terrain.adjacent0 = null;
    }
  }



  if (terrain.adjacent1) {
    if (terrain.adjacent1.adjacent0 === terrain) {
      terrain.adjacent1.adjacent0 = terrain.adjacent1 = null;
    } else if (terrain.adjacent1.adjacent1 === terrain) {
      terrain.adjacent1.adjacent1 = terrain.adjacent1 = null;
    }
  }



  if (terrain.p0edit) removeMouseCollideable(terrain.p0edit);
  if (terrain.p1edit) removeMouseCollideable(terrain.p1edit);

  return true;
}




MapEditor.prototype.createIncreaseSpeedButton = function () {
  var inc = new MapEditorButton("Camera speed up", 0, (buttonSize + 5) * 9, buttonSize * 2, buttonSize);
  inc.onRelease = function (e) {
    editMovementSpeed += 10;
  };
};




MapEditor.prototype.createDecreaseSpeedButton = function () {
  var inc = new MapEditorButton("Camera speed down", 0, (buttonSize + 5) * 10, buttonSize * 2, buttonSize);
  inc.onRelease = function (e) {

    editMovementSpeed -= 10;
    if (editMovementSpeed <= 0) editMovementSpeed = 1;
  };
};




MapEditor.prototype.createEditModeButton = function (ctx) {
  var editmode = new MapEditorButton("Test level", 0, 0, buttonSize * 2, buttonSize);
  editmode.collider.onEditMode = false;
  var that = this;
  editmode.onRelease = function (e) {
    // Hides the remaining buttons if pressed.
    if (that.ctx.canvas.setHeight !== buttonSize) {
      that.ctx.canvas.setWidth = buttonSize * 2;
      that.ctx.canvas.setHeight = buttonSize;
      editMode = false;
      gameEngine.initializePhysEng();
    } else {
      that.ctx.canvas.setWidth = buttonListEnd.x;
      that.ctx.canvas.setHeight = buttonListEnd.y;
      editMode = true;
    }

    that.ctx.isEdited = true;
    that.draw(that.ctx);
    that.editMode = !that.editMode;
    that.isSelected = button = null;

  };
};




function checkBounds(p1, p2) {
  var gs = graceSize / ((editMode || scaleSize > 1) ? scaleSize : 1);
  return (p1.x <= p2.x + gs &&
         p1.x >= p2.x - gs &&
         p1.y <= p2.y + gs &&
         p1.y >= p2.y - gs);
};




function checkPolygon(nextLine, array, original, visited) {
  console.log("fuuuuuuuuck", nextLine);
  if (!nextLine.adjacent0 || !nextLine.adjacent1) return false;

  if (nextLine) {
    var t0 = JSON.stringify(nextLine.p0);             //stringify might cause problems with new code but unlikely?
    var t1 = JSON.stringify(nextLine.p1);
    if (nextLine.id === original.id) {
      return true;
    } else {

      if (nextLine.adjacent0 && !array[nextLine.adjacent0.id]) {
        var o0 = JSON.stringify(nextLine.adjacent0.p0);
        var o1 = JSON.stringify(nextLine.adjacent0.p1);



        if (!visited[t0] || !visited[t1]) {
          if (t0 === o0 || t0 === o1) visited[t0] = true;
          else if (t1 === o0 || t1 === o1) visited[t1] = true;
          array[nextLine.adjacent0.id] = nextLine.adjacent0;
          return checkPolygon(nextLine.adjacent0, array, original, visited);
        }
      }
      if (nextLine.adjacent1 && !array[nextLine.adjacent1.id]) {
        var o0 = JSON.stringify(nextLine.adjacent1.p0);
        var o1 = JSON.stringify(nextLine.adjacent1.p1);
        if (!visited[t0] || !visited[t1]) {
          if (t0 === o0 || t0 === o1) visited[t0] = true;
          else if (t1 === o0 || t1 === o1) visited[t1] = true;
          array[nextLine.adjacent1.id] = nextLine.adjacent1;
          return checkPolygon(nextLine.adjacent1, array, original, visited);
        }
      }
    }
  }
  return false;
}
