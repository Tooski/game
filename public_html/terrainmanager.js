var graceSize = 20;

function TerrainManager() {
  this.playerStartPos = new vec2(0, 0);
  this.terrainList = [];
  this.goalList = [];
  this.collectibleList = [];
  this.checkpointList = [];
    this.levelByID = {};
   




    this.closedTerrain = [];
}

TerrainManager.prototype.update = function() {
    for(var i = 0; i < this.terrainList.length; i++) {
    }
};

TerrainManager.prototype.getJSON = function () {

}


TerrainManager.prototype.getTerrainByID = function(id){
    return this.levelByID[id];
};