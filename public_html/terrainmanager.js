var graceSize = 20;

function TerrainManager() {
    this.terrainList = [];
    this.terrainListByID = {};
    this.loadFromFile();
}



TerrainManager.prototype = new Entity();
TerrainManager.constructor = TerrainManager;

TerrainManager.prototype.pushTerrain = function(terrain, list) {
    this.createTerrainPoints(terrain);
    this.snapTo(terrain);
    this.terrainList.push(terrain);
    if(!this.terrainListByID[terrain.id])   this.terrainListByID[terrain.id] = terrain;
};


TerrainManager.prototype.update = function() {
//    for(var i = 0; i < buttonList.length; i++) {
////        buttonList[i].x  = buttonList[i].ix/initScale - (initWidth/ctx.canvas.width) * ctx.canvas.width / initScale / 2 + player.position.x;
////        buttonList[i].y = buttonList[i].iy/initScale - (initWidth/ctx.canvas.width) * ctx.canvas.height / initScale / 2 + player.position.y;
//    }
};

TerrainManager.prototype.draw = function(ctx) {

    this.terrainList.forEach (function(ter) {
        ter.draw(ctx);
    });

};


TerrainManager.prototype.snapTo = function(terrain) {
       for(var i = 0; i < this.terrainList.length; i++) {
           if (terrain !== this.terrainList[i]){
        if(!this.terrainList[i].adjacent0 && checkBounds (terrain.p0, this.terrainList[i].p0)){
            terrain.p0.x = this.terrainList[i].p0.x = (terrain.p0.x + this.terrainList[i].p0.x)/2;
            terrain.p0.y = this.terrainList[i].p0.y = (terrain.p0.y + this.terrainList[i].p0.y)/2;
            this.terrainList[i].adjacent0 = terrain;
            terrain.adjacent0 = this.terrainList[i];
            break;
        } else if (!this.terrainList[i].adjacent1 && checkBounds (terrain.p0, this.terrainList[i].p1)) {
            terrain.p0.x = this.terrainList[i].p1.x = (terrain.p0.x + this.terrainList[i].p1.x)/2;
            terrain.p0.y = this.terrainList[i].p1.y = (terrain.p0.y + this.terrainList[i].p1.y)/2;
            this.terrainList[i].adjacent1 = terrain;
            terrain.adjacent0 = this.terrainList[i];
            break;
        } else if(!this.terrainList[i].adjacent0 && checkBounds (terrain.p1, this.terrainList[i].p0)){
            terrain.p1.x = this.terrainList[i].p0.x = (terrain.p1.x + this.terrainList[i].p0.x)/2;
            terrain.p1.y = this.terrainList[i].p0.y = (terrain.p1.y + this.terrainList[i].p0.y)/2;
            this.terrainList[i].adjacent0 = terrain;
            terrain.adjacent1 = this.terrainList[i];
            break;
        } else if (!this.terrainList[i].adjacent1 && checkBounds (terrain.p1, this.terrainList[i].p1)) {
            terrain.p1.x = this.terrainList[i].p1.x = (terrain.p1.x + this.terrainList[i].p1.x)/2;
            terrain.p1.y = this.terrainList[i].p1.y = (terrain.p1.y + this.terrainList[i].p1.y)/2;
            this.terrainList[i].adjacent1 = terrain;
            terrain.adjacent1 = this.terrainList[i];
            break;
        }
    }
    }

};


TerrainManager.prototype.removeFrom = function(terrain) {

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
};

function checkBounds (p1, p2) {
    return (p1.x <= p2.x + graceSize && 
           p1.x >= p2.x - graceSize && 
           p1.y <= p2.y + graceSize &&
           p1.y >= p2.y - graceSize);
};


TerrainManager.prototype.loadFromFile = function() {
    var that = this;
    
    this.terrainList = [];
    this.terrainListByID = {};
 
    
        game.settings.get(function(data) {
        var obj = jQuery.parseJSON( data );
        for(var i = 0; i < obj.length; i++) {
            var ter = new TerrainLine(new vec2(obj[i].p0.x, obj[i].p0.y), new vec2(obj[i].p1.x, obj[i].p1.y));
            ter.id = obj[i].id;
            ter.normal = new vec2(obj[i].normal.x, obj[i].normal.y);
            that.terrainListByID[obj[i].id] = ter;
            that.pushTerrain (ter, that.terrainListByID);
        }
        // Adds neighbors to the object.
        for(var i = 0; i < obj.length; i++) {
            if(obj[i].adjacent0 && that.terrainListByID[obj[i].adjacent0])that.terrainListByID[obj[i].id].adjacent0 = that.terrainListByID[obj[i].adjacent0];
            if(obj[i].adjacent1 && that.terrainListByID[obj[i].adjacent1])that.terrainListByID[obj[i].id].adjacent1 = that.terrainListByID[obj[i].adjacent1];
        }
    });
};

TerrainManager.prototype.createTerrainPoints = function(terrain) {
    var that = this;
//    if(editMode) {
      var wh = 10;
      terrain.p0edit = new MouseCollideable("point", terrain.p0.x - wh, terrain.p0.y - wh, wh*2, wh*2);
      
      terrain.p0edit.onDrag = function(e) {
        var xOffset = localToWorld(e.offsetX, "x");
        var yOffset = localToWorld(e.offsetY, "y");

        terrain.x = (terrain.p0.x = xOffset) - wh;
        terrain.y = (terrain.p0.y = yOffset) - wh;
        normalDrag(terrain);
        if(terrain.adjacent0) {
            if(terrain.adjacent0.adjacent1 === terrain) {
                terrain.adjacent0.p1edit.x = (terrain.adjacent0.p1.x = xOffset) - wh;
                terrain.adjacent0.p1edit.y = (terrain.adjacent0.p1.y = yOffset) - wh;
                normalDrag(terrain.adjacent0);
            } else if (terrain.adjacent0.adjacent0 === terrain) {
                terrain.adjacent0.p0edit.x = (terrain.adjacent0.p0.x = xOffset) - wh;
                terrain.adjacent0.p0edit.y = (terrain.adjacent0.p0.y = yOffset) - wh;
                normalDrag(terrain.adjacent0);
            }
        }
      };
      terrain.p0edit.onRelease = function(e) {
          that.snapTo(terrain);
      };
      terrain.p1edit = new MouseCollideable("point", terrain.p1.x - wh, terrain.p1.y - wh, wh*2, wh*2);
      terrain.p1edit.onDrag = function(e) {
        var xOffset = localToWorld(e.offsetX, "x");
        var yOffset = localToWorld(e.offsetY, "y");
          
        terrain.x = (terrain.p1.x = xOffset) - wh;
        terrain.y = (terrain.p1.y = yOffset) - wh;
        normalDrag(terrain);
        if(terrain.adjacent1) {
            if(terrain.adjacent1.adjacent1 === terrain) {
                terrain.adjacent1.p1edit.x = (terrain.adjacent1.p1.x = xOffset) - wh;
                terrain.adjacent1.p1edit.y = (terrain.adjacent1.p1.y = yOffset) - wh;
                normalDrag(terrain.adjacent1);
            } else if (terrain.adjacent1.adjacent0 === terrain) {
                terrain.adjacent1.p0edit.x = (terrain.adjacent1.p0.x = xOffset) - wh;
                terrain.adjacent1.p0edit.y = (terrain.adjacent1.p0.y = yOffset) - wh;
                normalDrag(terrain.adjacent1);
            }
        }
   
      };
      terrain.p1edit.onRelease = function(e) {
          that.snapTo(terrain);
      };
     
      terrain.normalPosVec = new vec2(terrain.p0.x, terrain.p0.y);
      terrain.normalPosCol = new MouseCollideable("normal", terrain.p0.x - wh, terrain.p0.y - wh, wh*2, wh*2);
      terrain.normalPosCol.onDrag = function(e) {
          if(terrain.normal) {
          var point = findNormalByMouse(e, terrain);
          

          terrain.normal.x = point.x;
          terrain.normal.y = point.y;
          
        }
      };
//    }
};

TerrainManager.prototype.getTerrainByID = function(id){
    return this.terrainListByID[id];
};