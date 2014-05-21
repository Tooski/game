var fontSize = 16;
var selectedRowColor = "red";
var regularRowColor = "white";
var menuCtx;
function Menu() {
    


};

Menu.prototype.init = function(offset, w, h) {
    this.offset = offset;
    this.h = h;
    this.w = w;
    if(!menuCtx) {
        var c = new CanvasFactory({id:"menuCanvas", width:this.w, height: this.h, x: this.offset.x || 0, y: this.offset.y || 0});
        menuCtx =  c.getContext('2d');
        menuCtx.canvas = c;
        c.tabIndex = 1;
        
    }
    this.ctx = menuCtx;
};
Menu.prototype.update = function() {};
Menu.prototype.draw = function(ctx) {};
Menu.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.canvas.style.zIndex = -1;
    this.ctx.canvas.style.display = "none";
    //console.log("test");
    //ocument.activeElement = canvas;
    canvas.focus();
   
};

Menu.prototype.focus = function() {
    this.ctx.canvas.style.zIndex = 1;
    this.ctx.canvas.style.display = "";
    this.ctx.canvas.focus();
};

function MenuButtonGroup(x,y,w,h, padding) {
    this.ix = this.x = x;
    this.iy = this.y = y;
    this.iw = this.w = w;
    this.ih = this.h = h;
    this.ipadding = this.padding = padding || 0;
    this.buttons = [];
}

MenuButtonGroup.prototype.addButton = function(button) {
    if(button instanceof MenuButton) {
        this.buttons.push(button);
    }
};


MenuButtonGroup.prototype.addButtons = function(buttons) {
    if(buttons instanceof Array) {
    for(var i = 0; i < buttons.length; i++)
        this.addButton(buttons[i]);
    }
};

MenuButtonGroup.prototype.removeButton = function(index) {
    if (index >= 0 && index < this.table.length) {
        this.buttons.splice(index, 1);
    }
};

MenuButtonGroup.prototype.setOffset = function(offset) {
    if(offset instanceof vec2) {
    for(var i = 0; i <  this.buttons.length; i++)
        this.buttons[i].setOffset(offset);
    }
};


MenuButtonGroup.prototype.draw = function(ctx) {
    if(this.parent) {
    for(var i = 0; i < this.buttons.length; i++) {
        this.x = this.ix;
        this.y = this.iy;
        this.h = this.ih;
        this.w = this.iw;
        this.padding = this.ipadding;
        var w = ((this.w ) / this.buttons.length  - (this.padding/(this.buttons.length) * (this.buttons.length+1))) ;
        var h = this.buttons[i].collider.h = this.h;
        var x = (this.x + w * i  + this.padding * (i + 1))+ this.parent.x;
        var y = (this.y + this.padding)+ this.parent.y;
        this.buttons[i].collider.w = w / initScale;
        this.buttons[i].collider.h = h / initScale;
        this.buttons[i].collider.x = x;
        this.buttons[i].collider.y = y;
        ctx.beginPath();
        ctx.fillStyle="white";
        ctx.fillRect(x,y, w, h);
        ctx.stroke();
        var size = 16;
        ctx.fillStyle = "black";
        ctx.font = "bold "+size+"px Arial";
        ctx.textAlign="center"; 
        ctx.fillText(this.buttons[i].name, x +  w/2, y  + h/2 + size/2);
  
       // this.buttons[i].collider.x = this.x
    }
}
};

MenuButtonGroup.prototype.setParent = function(parent) {
    this.parent = parent;
};


function MenuButton (name) {
    this.name = name;
    this.collider = new MouseCollideable("menubutton");
}

MenuButton.prototype.setOffset = function(offset) {
    this.collider.x = this.collider.ix + offset.x;
    this.collider.y = this.collider.iy + offset.y;
};


function MenuTableRow (array, parent) {
    this.isEditable = false;
    for(var i = 0; i < array.length; i++) {
        if(!array[i]) {
            array[i] = new CanvasInput({
                canvas: parent.ctx.canvas,
                fontSize: 18,
                fontFamily: 'Arial',
                fontColor: '#212121',
                borderRadius: 0,
                padding: 0,
                boxShadow: '0px 0px 0px #fff',  
                innerShadow: '0px 0px 0px rgba(0, 0, 0, 0.5)',
                fontWeight: 'bold',
                placeHolder: 'Enter message here...'
            });
            this.isEditable = true;
        }
    }
    this.items = array;
    var parent = parent;
    this.collider = new MouseCollideable("row");
    var that = this;
    this.collider.onClick = function(e) {
        parent.selected = that;
    };
    

}

function MenuTable (name, x,y,w,h,padding,showName, ctx) {
    this.ctx = ctx;
    this.name = name;
    this.ix = this.x = x;
    this.iy = this.y = y;
    this.iw = this.w = w;
    this.ih = this.h = h;
    this.ipadding = this.padding = padding;
    this.maxRows = 10;
    this.showName = showName;
    this.rows = [];
    this.columns = [];
    this.selected = null;
   // this.collider = new MouseCollideable("menubutton", x, y, w, h);
}

MenuTable.prototype.addColumns = function(names) {
    if(names instanceof Array) {
    for(var i = 0; i < names.length; i++)
        this.addColumn(names[i]);
    }
};

MenuTable.prototype.addColumn = function(name) {
    this.columns.push(name);
};



MenuTable.prototype.addRow = function(array) {
    if(array.length === this.columns.length) {
        this.rows.push(new MenuTableRow(array, this));
    } else {
        throw new Exception("Array length is different from column length.");
    }
};


MenuTable.prototype.removeRow = function(index) {
    if (index >= 0 && index < this.rows.length) {
        this.rows.splice(index, 1);
    }
};

MenuTable.prototype.removeColumn = function(index) {
    if (index >= 0 && index < this.columns.length) {
        this.columns.splice(index, 1);
    }
};

MenuTable.prototype.draw = function(ctx) {
    if(this.parent) {
        
        
        var size = fontSize;
    this.padding = this.ipadding;

    this.w = this.iw  - this.padding*2;
    this.h = this.ih ;
    this.x = this.ix+ this.parent.x + this.padding - (this.columns.length-1);
    this.y = this.iy+ this.parent.y;
    
 

    if(this.showName) {
        for(var i = 0; i < this.columns.length; i++) {
            ctx.beginPath();
            ctx.fillStyle="white";
            ctx.fillRect(this.x + (this.w/this.columns.length) * i + i,this.y, this.w/this.columns.length, this.h/this.maxRows );
            ctx.stroke();
            var size = 16;
            ctx.fillStyle = "black";
            ctx.font = "bold "+size+"px Arial";
            ctx.textAlign="center"; 
            ctx.fillText(this.columns[i], this.x + ((this.w/this.columns.length) * i + i) + (this.w/this.columns.length/2), this.y  + this.h/this.maxRows/2 + size/2);
        }

    }
    
    for(var i = 0; i < this.rows.length; i++) {
        var x = this.x;
        var y = this.y + (this.h/this.maxRows * (i + (this.showName ? 1 : 0))) + (i+1);
        var w = this.w ;
        var h = this.h/this.maxRows;

        this.rows[i].collider.w = w / initScale;
        this.rows[i].collider.h = h / initScale;
        this.rows[i].collider.x = x;
        this.rows[i].collider.y = y;
        for(var j = 0; j < this.rows[i].items.length; j++) {
            if(this.rows[i].items[j] instanceof CanvasInput) {
                this.rows[i].items[j].x(x + (this.w/this.columns.length) * j + j);
                this.rows[i].items[j].y (y);
                this.rows[i].items[j].width((w-this.rows[i].items[j]._padding)/this.columns.length - 1);
                this.rows[i].items[j].height(h - this.rows[i].items[j]._padding-2);
                this.rows[i].items[j].fontSize(size);
                this.rows[i].items[j].backgroundColor(this.selected === this.rows[i] ? selectedRowColor :regularRowColor);
                this.rows[i].items[j].render();
            } else {
                ctx.beginPath();
                ctx.fillStyle= this.selected === this.rows[i] ? selectedRowColor :regularRowColor;
                ctx.fillRect(x + (this.w/this.columns.length) * j + j, y, w/this.columns.length,h);
                ctx.stroke();
                ctx.fillStyle = "black";
                ctx.font = "bold "+size+"px Arial";
                ctx.textAlign="center"; 
                var str = this.rows[i].items[j] ? this.rows[i].items[j] : "";
                ctx.fillText(str, this.x + (this.w/this.columns.length) * j + j+ (this.w/this.columns.length/2),this.y + this.h/this.maxRows * (i + (this.showName ? 1 : 0))+ this.h/this.maxRows/2 + size/2 );
            }
        }
    }
    
}
};

MenuTable.prototype.setParent = function(parent) {
    this.parent = parent;
};

MenuTable.prototype.getSelectedRow = function() {
//    if (this.selected) {
//        var row = {};
//        for(var j = 0; j < this.selected.items.length; j++) {
//            row[this.columns[j]] = this.selected.items[j];
//        }
        return this.selected;
//    } else {
//        return null;
//    }
};