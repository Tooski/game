

function Load(level) {
    this.terrainList = level.terrainList;
    this.ih = 400;
    this.iw = 400;
    var that = this;
    this.table = new MenuTable("Table", 0, 70, this.iw, 300, 10, true); 
    var cancelButton = new MenuButton("Cancel");
    cancelButton.collider.onClick = function(e) {
        gameEngine.menu = null;
    };

    
    var loadButton = new MenuButton("Load");
    loadButton.collider.onClick = function(e) {
        var row = that.table.getSelectedRow();
        if(row) {
            level.loadFromFile(row.items[1]);
        }
    };
  

    
    
    game.settings.get({"command":"getlevelinfo"}, function(data) {
        var json = $.parseJSON(data);
        var keys = Object.keys(json[0]);
        
        for(var i = 0; i < keys.length; i++) {
            that.table.addColumn(keys[i]);
        }
        
        json.forEach(function(val) {
            var row = [];
            for(var i = 0; i < keys.length; i++) {
                row.push(val[keys[i]]);
            }
            that.table.addRow(row);
        });
        that.table.setParent(that);
    });
    



    this.buttons = new MenuButtonGroup(0,0,this.iw,50, 10);
    this.buttons.addButtons([cancelButton,loadButton]);
    this.buttons.setParent(this);
}

Load.prototype = new Menu();

Load.prototype.update = function() {
    
};

Load.prototype.draw = function(ctx) {
    this.h =  this.ih/initScale* (initWidth/ctx.canvas.width);
    this.w =  this.iw/initScale* (initWidth/ctx.canvas.width);
    this.x = player.model.pos.x - this.w/2;
    this.y = player.model.pos.y - this.h/2;
    ctx.beginPath();
    ctx.fillStyle="blue";
    ctx.fillRect(this.x,this.y,this.w,this.h);
    ctx.stroke();
    
    this.buttons.draw(ctx);
    this.table.draw(ctx);
};