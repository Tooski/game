

function Save(terrainList) {
    this.terrainList = terrainList;
    this.ih = this.h = 400; 
    this.iw = this.w = 400;
    this.x = 0, this.y = 0;
    
    this.offset = new vec2(canvas.width/2 - this.w/2, canvas.height/2 - this.h/2);
    this.init(this.offset, this.w, this.h);

    
    var that = this;
    
    this.table = new MenuTable("Table", 0, 70, this.iw, 300, 10, true, this.ctx);
    var cancelButton = new MenuButton("Cancel");
    cancelButton.collider.onRelease = function(e) {
        gameEngine.menu = null;
        that.clear();
    };
    var isSaving = false;


    var saveButton = new MenuButton("Save");
    saveButton.collider.onClick = function(e) {
        var row = that.table.getSelectedRow();
        if (row) {
            console.log(row);
            if (!isSaving) {
                isSaving = true;
                var terrain = [];
                that.terrainList.forEach(function(ter) {

                    if (ter.adjacent0)
                        var adj0 = ter.adjacent0.id.toString();
                    if (ter.adjacent1)
                        var adj1 = ter.adjacent1.id.toString();
                    if (ter.normal)
                        var norm = ter.normal;
                    terrain.push({
                        "id": ter.id,
                        "p0": {"x": ter.p0.x, "y": ter.p0.y},
                        "p1": {"x": ter.p1.x, "y": ter.p1.y},
                        "normal": {"x": norm.x, "y": norm.y},
                        "adjacent0": adj0,
                        "adjacent1": adj1}
                    );
                }
                );


                if (row.isEditable && row.items && row.items[0]._value) {
                    console.log(row.items[0]._value);
                    game.settings.post({"command": "savelevel", "data": {"jsonstring": JSON.stringify(terrain), "levelname": row.items[0]._value}}, function(callback) {
                        row.items[0].x(0);
                        row.items[0].y(0);
                        row.items[0] = row.items[0]._value;
                        row.items[1] = callback;
                        isSaving = row.isEditable = false;

                    });
                } else {
                    game.settings.post({"command": "updatelevel", "data": {"jsonstring": JSON.stringify(terrain), "levelid": row.items[1]}}, function(callback) {

                        isSaving = false;
                    });

                }
            }
        }
    };



    var newButton = new MenuButton("New");
    newButton.collider.onClick = function(e) {
        that.table.addRow([undefined, "-"]);

    };


    game.settings.get({"command": "getlevelinfo"}, function(data) {
        var json = $.parseJSON(data);
        var keys = Object.keys(json[0]);

        for (var i = 0; i < keys.length; i++) {
            that.table.addColumn(keys[i]);
        }

        json.forEach(function(val) {
            var row = [];
            for (var i = 0; i < keys.length; i++) {
                row.push(val[keys[i]]);
            }
            that.table.addRow(row);
        });
        that.table.setParent(that);
    });


    var submitButton = new MenuButton("check user");
    submitButton.collider.onClick = function(e) {
        game.settings.get({"command": "login",
            "data": {"username": "EklipZ", "password": "1234567"}}, function(callback) {
            console.log(callback);
            if (callback === "1") {
                console.log("user is in db");
            } else {
                console.log("invalid name");

            }
        });
    };

    var insertUser = new MenuButton("insert user");
    insertUser.collider.onClick = function(e) {
        game.settings.post({"command": "signIn",
            "data": {"lastname": "Johnson", "firstname": "Mark", "username": "donkey",
                "password": "ferter", "email": "dong@uw.edu", "timestamp": "2014-12-12 12:12:12"}},
        function(callback) {
            if (callback === "1") {
                console.log("user inserted");
            } else {
                console.log("not inserted");
            }

        });
    };

    var hasEmail = new MenuButton("check email");
    hasEmail.collider.onClick = function(e) {
        game.settings.get({"command": "checkEmail",
            "data": {"email": "dong@uw.edu"}},
        function(callback) {
            if (callback === "1") {
                console.log("email exists " + callback);
            } else {
                console.log("email does not exist " + callback);
            }

        });
    };

    var hasUserName = new MenuButton("check username");
    hasUserName.collider.onClick = function(e) {
        game.settings.get({"command": "checkUserName",
            "data": {"username": "donkey"}},
        function(callback) {
            console.log(callback);
            if (callback === "1") {
                console.log("user exists " + callback);
            } else {
                console.log("user does not exist " + callback);
            }

        });
    };

    var insertScore = new MenuButton("insert score");
    insertScore.collider.onClick = function(e) {
        game.settings.post({"command": "insertScore",
            "data": {"userID": "1003", "levelID": "14",
                "score": "4567", "completetime": "140000"}},
        function(callback) {
            if (callback === "1") {
                console.log("score inserted");
            } else {
                console.log("score not inserted");
            }

        });
    };
    var highScore = new MenuButton("high score");
    highScore.collider.onClick = function(e) {
        game.settings.get({"command": "highScore",
            "data": {"levelID": "14"}},
        function(callback) {
            console.log(callback);

        });
    };

    var highScore = new MenuButton("high score");
    highScore.collider.onClick = function(e) {
        game.settings.get({"command": "highScore",
            "data": {"levelID": "14"}},
        function(callback) {
            console.log(callback);

        });
    };

    var bestTime = new MenuButton("best time");
    bestTime.collider.onClick = function(e) {
        game.settings.get({"command": "bestTime",
            "data": {"levelID": "14"}},
        function(callback) {
            console.log(callback);

        });
    };

    var topTenTime = new MenuButton("top ten time");
    topTenTime.collider.onClick = function(e) {
        game.settings.get({"command": "topTenTime",
            "data": {"levelID": "14"}},
        function(callback) {
            console.log(callback);

        });
    };
    var topTenHighScore = new MenuButton("top ten scores");
    topTenHighScore.collider.onClick = function(e) {
        game.settings.get({"command": "topTenHighScore",
            "data": {"levelID": "14"}},
        function(callback) {
            console.log(callback);

        });
    };

    var addLevelToStage = new MenuButton("add level to stage");
    addLevelToStage.collider.onClick = function(e) {
        game.settings.post({"command": "addLevelToStage",
            "data": {"stageID": "6", "levelID": "15", "postion": "2"}},
        function(callback) {
            if (callback === "1") {
                console.log("score inserted");
            } else {
                console.log("score not inserted");
            }

        });
    };

    var getStageLevels = new MenuButton("get levels in stage");
    getStageLevels.collider.onClick = function(e) {
        game.settings.get({"command": "getStageLevels",
            "data": {"stageID": "6"}},
        function(callback) {
            console.log(callback);

        });
    };

    this.buttons = new MenuButtonGroup(0, 0, this.iw, 50, 10);
    this.buttons.addButtons([cancelButton,saveButton,newButton]);
    //this.buttons.addButtons([hasUserName, hasEmail]);
    //this.buttons.addButtons([insertScore, highScore, bestTime]);
    //this.buttons.addButtons([topTenHighScore, topTenTime]);
    //this.buttons.addButtons([addLevelToStage, getStageLevels]);
    
    this.buttons.setParent(this);
    this.buttons.setOffset(this.offset);
    
};

Save.prototype = new Menu();

Save.prototype.update = function() {

};

Save.prototype.draw = function() {
    
    this.ctx.canvas.style.left = canvas.width/2 - this.w/2;
    this.ctx.canvas.style.top = canvas.height/2 - this.h/2;
    
    this.offset.x = canvas.width/2 - this.w/2, this.offset.y = canvas.height/2 - this.h/2;
    this.buttons.setOffset(this.offset);
    
    this.ctx.beginPath();
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(this.x, this.y, this.w, this.h);
    this.ctx.stroke();

    this.buttons.draw(this.ctx);
    this.table.draw(this.ctx);
};