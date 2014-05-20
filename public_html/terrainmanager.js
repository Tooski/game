var graceSize = 20;

function TerrainManager() {
    this.terrainList = [];
    this.closedTerrain = [];
    this.terrainListByID = {};
    this.playerStartPos = new vec2(0, 0);
 //  this.loadFromFile();
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
    for(var i = 0; i < this.terrainList.length; i++) {
    }
};

TerrainManager.prototype.draw = function(ctx) {

    if(editMode) {
        this.terrainList.forEach (function(ter) {
            //if(!ter.circularID){
                ter.draw(ctx);
            //}
        });
        //for(var i = 0; i < this.closedTerrain.length; i++) {
        //    this.closedTerrain[i].draw(ctx);
        //}
        //console.log(this.closedTerrain.length);
    } else {
        this.lineDraw = {};
     for(var i = 0; i < this.terrainList.length; i++) {
        if(!this.terrainList[i].adjacent0 && !this.terrainList[i].adjacent1) {
            this.terrainList[i].draw(ctx);
        } else {
        ctx.lineWidth = this.terrainList[i].lineWidth;
        if(this.terrainList[i].adjacent0) {

             createCurves(ctx, this.terrainList[i].p0, this.terrainList[i].p1, 
             this.terrainList[i].adjacent0.p0, this.terrainList[i].adjacent0.p1, 
             this.terrainList[i].adjacent1, true);
        }
         
        if(this.terrainList[i].adjacent1) {

            createCurves(ctx, this.terrainList[i].p0, this.terrainList[i].p1, 
            this.terrainList[i].adjacent1.p0, this.terrainList[i].adjacent1.p1,
            this.terrainList[i].adjacent0, false);
        }
    }
  }
}

};


function createCurves(ctx, a0, a1, b0, b1, other, check) {
            var midPoint1 = a0.add(a1).divf(2.0);
            var midPoint2 = b0.add(b1).divf(2.0);
            ctx.beginPath();
            ctx.moveTo(check ? midPoint2.x : midPoint1.x, check ? midPoint2.y : midPoint1.y);
            ctx.quadraticCurveTo(check ? a0.x : a1.x, check ? a0.y : a1.y, 
            check ? midPoint1.x : midPoint2.x, check ? midPoint1.y : midPoint2.y);
            ctx.stroke();
            if(!other) {
                ctx.beginPath();
                ctx.moveTo(midPoint1.x,midPoint1.y);
                ctx.lineTo(check ? a1.x : a0.x, check ? a1.y : a0.y);
                ctx.stroke();
            }
}



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
    
    var circular = {};
        if(terrain.adjacent0) {
        circular[terrain.adjacent0.id] = terrain.adjacent0;
        var d = checkCircular(terrain.adjacent0, circular, terrain, {});


        if(!terrain.circularID && d) {

            var c = new TerrainCircular(circular, this.closedTerrain);

        }
    }
};

function TerrainCircular(circular, closedTerrain) {
    //Entity.call();
    this.circular = circular;
    for (var item in this.circular){
        this.circular[item].circularID = this.id;
    }
    closedTerrain.push(this);
}

TerrainCircular.prototype = new Entity();

TerrainCircular.prototype.draw = function(ctx) {
    
    var rect = new Rectangle(Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
    ctx.save();
    ctx.beginPath();
    
    for (var k in this.circular) {
        this.fillTerrain(ctx, this.circular[k], {}, rect,{});

        break;
    }
    
   
    
    ctx.closePath();
    ctx.clip();
    var img = ASSET_MANAGER.cache["assets/dirt.jpg"];
    for(var x = rect.x1 ; x < rect.x2; x+=img.width) {
        for(var y = rect.y1; y < rect.y2; y+=img.height) {
            ctx.drawImage(img, x, y);
        }
    }
    ctx.restore();
    ctx.lineWidth = this.circular[k].lineWidth;
    ctx.stroke();
    
    
    for(var item in this.circular) {
        var midPoint = this.circular[item].p0.add(this.circular[item].p1).divf(2.0);
        var pNormalPosEnd = midPoint.add(this.circular[item].normal.multf(20));
        this.circular[item].normalPosCol.x = pNormalPosEnd.x - this.circular[item].normalPosCol.w / 2;
        this.circular[item].normalPosCol.y = pNormalPosEnd.y - this.circular[item].normalPosCol.h / 2;
        this.circular[item].p0edit.x = this.circular[item].p0.x;
        this.circular[item].p0edit.y = this.circular[item].p0.y;
        this.circular[item].p1edit.x = this.circular[item].p1.x;
        this.circular[item].p1edit.y = this.circular[item].p1.y;
        ctx.moveTo(midPoint.x, midPoint.y);
        ctx.lineTo(pNormalPosEnd.x, pNormalPosEnd.y);
        ctx.stroke();
    }
};


TerrainCircular.prototype.fillTerrain = function(ctx, terrain, visited, rect, visitedLine) {
        if(rect.x1 > terrain.p0.x) rect.x1 = terrain.p0.x;
        if(rect.x2 < terrain.p0.x) rect.x2 = terrain.p0.x;
        if(rect.y1 > terrain.p0.y) rect.y1 = terrain.p0.y;
        if(rect.y2 < terrain.p0.y) rect.y2 = terrain.p0.y;
        if(rect.x1 > terrain.p1.x) rect.x1 = terrain.p1.x;
        if(rect.x2 < terrain.p1.x) rect.x2 = terrain.p1.x;
        if(rect.y1 > terrain.p1.y) rect.y1 = terrain.p1.y;
        if(rect.y2 < terrain.p1.y) rect.y2 = terrain.p1.y;
        
        
        visitedLine[terrain.id] = true;
        
            var t0 = JSON.stringify( terrain.p0);
            var t1 = JSON.stringify( terrain.p1);
            
            
            if(visited.length === 0) {
                ctx.moveTo(terrain.p0.x,terrain.p0.y);
                visited[t0] = true;
            }
            
                    if(!visited[t0]) ctx.lineTo(terrain.p0.x,terrain.p0.y);
                    else if (!visited[t1]) ctx.lineTo(terrain.p1.x,terrain.p1.y);
            
            if(terrain.adjacent0 && !visitedLine[terrain.adjacent0.id]) {
                var o0 = JSON.stringify( terrain.adjacent0.p0);
                var o1 = JSON.stringify( terrain.adjacent0.p1);
                if(!visited[t0] || !visited[t1]) {

                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
               
                    
                    
                    this.fillTerrain(ctx, terrain.adjacent0, visited, rect, visitedLine);
                }
            }
            if(terrain.adjacent1 && !visitedLine[terrain.adjacent1.id]) {
                
                var o0 = JSON.stringify( terrain.adjacent1.p0);
                var o1 = JSON.stringify( terrain.adjacent1.p1);
                if(!visited[t0] || !visited[t1]) {
                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
                             
            
                    
                    
                    this.fillTerrain(ctx, terrain.adjacent1, visited, rect, visitedLine);
                }
            }
            
}

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


TerrainManager.prototype.loadFromFile = function(id) {
    var that = this;
    
    this.terrainList = [];
    this.terrainListByID = {};
 
     game.settings.get({"command":"getleveljson", "data":{"levelid": (id||1)}}, function(data) {
        var obj = $.parseJSON($.parseJSON( data ));
        for(var i = 0; i < obj.length; i++) {
            var ter = new TerrainLine(new vec2(obj[i].p0.x, obj[i].p0.y), new vec2(obj[i].p1.x, obj[i].p1.y));
            ter.id = obj[i].id;
            ter.normal = new vec2(obj[i].normal.x, obj[i].normal.y);
            that.terrainListByID[obj[i].id] = ter;
        }
        // Adds neighbors to the object.
        for(var i = 0; i < obj.length; i++) {
            if(obj[i].adjacent0 && that.terrainListByID[obj[i].adjacent0])that.terrainListByID[obj[i].id].adjacent0 = that.terrainListByID[obj[i].adjacent0];
            if(obj[i].adjacent1 && that.terrainListByID[obj[i].adjacent1])that.terrainListByID[obj[i].id].adjacent1 = that.terrainListByID[obj[i].adjacent1];
            that.pushTerrain (that.terrainListByID[obj[i].id], that.terrainListByID);

        }
    });
};

TerrainManager.prototype.createTerrainPoints = function(terrain) {
    var that = this;
//    if(editMode) {
      var wh = 10;
      terrain.p0edit = new MouseCollideable(false, terrain.p0.x - wh, terrain.p0.y - wh, wh*2, wh*2);
      
      terrain.p0edit.onDrag = function(e) {
        var xOffset = localToWorld(e.offsetX* (initWidth/ctx.canvas.width), "x");
        var yOffset = localToWorld(e.offsetY* (initWidth/ctx.canvas.width), "y");

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
      terrain.p1edit = new MouseCollideable(false, terrain.p1.x - wh, terrain.p1.y - wh, wh*2, wh*2);
      terrain.p1edit.onDrag = function(e) {
        var xOffset = localToWorld(e.offsetX* (initWidth/ctx.canvas.width), "x");
        var yOffset = localToWorld(e.offsetY* (initWidth/ctx.canvas.width), "y");
          
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
      terrain.normalPosCol = new MouseCollideable(false, terrain.p0.x - wh, terrain.p0.y - wh, wh*2, wh*2);
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

function checkCircular(nextLine, array, original, visited) {
    if(!nextLine.adjacent0 || !nextLine.adjacent1) return false;
    if(nextLine) {
        var t0 = JSON.stringify(nextLine.p0);
        var t1 = JSON.stringify(nextLine.p1);
        if( nextLine.id === original.id) {
            return true;
        } else {
            
            if(nextLine.adjacent0 && !array[nextLine.adjacent0.id]) {
                var o0 = JSON.stringify(nextLine.adjacent0.p0);
                var o1 = JSON.stringify(nextLine.adjacent0.p1);
                
                
                
                if(!visited[t0] || !visited[t1]) {
                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
                    array[nextLine.adjacent0.id] = nextLine.adjacent0;
                    return checkCircular(nextLine.adjacent0, array, original, visited);
                }
            }
            if(nextLine.adjacent1 && !array[nextLine.adjacent1.id]) {
                var o0 = JSON.stringify(nextLine.adjacent1.p0);
                var o1 = JSON.stringify(nextLine.adjacent1.p1);
                if(!visited[t0] || !visited[t1]) {
                    if(t0 === o0 || t0 === o1) visited[t0] = true;
                    else if (t1 === o0 || t1 === o1) visited[t1] = true;
                    array[nextLine.adjacent1.id] = nextLine.adjacent1;
                    return checkCircular(nextLine.adjacent1, array, original, visited);
                }
            }
            
  
//            if(nextLine.adjacent0) {
//                
//                var o0 = JSON.stringify(nextLine.adjacent0.p0);
//                var o1 = JSON.stringify(nextLine.adjacent0.p1);
//          
//                
//                
//                if(!array[nextLine.adjacent0.id] && (!visited[t0] || !visited[t1]) ) {
//                    if(t0 === o0 || t0 === o1) visited[t0] = true;
//                    else if (t1 === o0 || t1 === t1) visited[t1] = true;
//                    
//                    array[nextLine.adjacent0.id] = nextLine.adjacent0;
//                    return checkCircular(nextLine.adjacent0, array, original, visited);
//                }
//            }
//            if (nextLine.adjacent1 && !array[nextLine.adjacent1.id]  && (!visited[t0] || !visited[t1])) {
//                array[nextLine.adjacent1.id] = nextLine.adjacent1;
//                
//                var o0 = JSON.stringify(nextLine.adjacent1.p0);
//                var o1 = JSON.stringify(nextLine.adjacent1.p1);
//          
//                if(t0 === o0 || t0 === o1) visited[t0] = true;
//                else if (t1 === o0 || t1 === t1) visited[t1] = true;
//                
//                
//                return  checkCircular(nextLine.adjacent1, array, original, visited);
//            }
        }
    }
    return false;
}


