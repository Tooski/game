

function Load(level) {
    

    this.terrainList = level.terrainList;
    this.ih = this.h = 400;
    this.iw = this.w = 400;
    this.x = 0;
    this.y = 0;
    this.offset = new vec2(canvas.width/2 - this.w/2, canvas.height/2 - this.h/2);

    var that = this;
    this.table = new MenuTable("Table", 0, 70, this.iw, 300, 10, true); 
    var cancelButton = new MenuButton("Cancel");
    cancelButton.collider.onRelease = function(e) {
        gameEngine.menu = null;
        that.clear();
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
    this.init(this.offset, this.w, this.h);

};

Load.prototype = new Menu();

Load.prototype.update = function() {
    
};

Load.prototype.draw = function() {
    this.ctx.canvas.style.left = canvas.width/2 - this.w/2;
    this.ctx.canvas.style.top = canvas.height/2 - this.h/2;
    
    this.offset.x = canvas.width/2 - this.w/2, this.offset.y = canvas.height/2 - this.h/2;
    this.buttons.setOffset(this.offset);
    
    this.ctx.beginPath();
    this.ctx.fillStyle="blue";
    this.ctx.fillRect(this.x,this.y,this.w,this.h);
    this.ctx.stroke();
    
    this.buttons.draw(this.ctx);
    this.table.draw(this.ctx);
};
