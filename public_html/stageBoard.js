/*
	Minkwan Choi
	last updated : 5/20/2014
	stage board(world map).....
	has buttons for substages.
	
	current version open up every games. 
	did not closed any game yet. 
	just becase we did not fully set up the games at database.
*/



//----------------------------------------- stage board


function StageBoard() {
    console.log('start creating StageBoard');
    this.my_ctx = null;
    this.my_where_click = null;
    this.my_where_mouse = null;
    this.my_surface_width = null;
    this.my_surface_height = null;
    this.my_image_button_arr = [];
    this.my_stage_background = null;

    this.my_world_map_id = null;
    this.my_world_mapname = null;

    this.running = false;
    console.log('finish creating StageBoard');
}


StageBoard.prototype.init = function (the_ctx, the_world_map_id, the_world_map_name) {
    console.log('start init StageBoard.');
    if (the_world_map_id && the_world_map_name) {
        this.my_world_map_id = the_world_map_id;
    this.my_world_map_name = the_world_map_name;
    }


    this.my_ctx = the_ctx;
    this.my_surface_width = this.my_ctx.canvas.width;
    this.my_surface_height = this.my_ctx.canvas.height;

    this.setActions();
    
    console.log('finish init StageBoard.');
}

StageBoard.prototype.setBackground = function (the_path) {
    this.my_stage_background = the_path;
}
StageBoard.prototype.setWorldMapID = function (the_id) {
    this.my_world_map_id = the_id;
    //console.log(this.my_world_map_id);
}
StageBoard.prototype.setWorldMapName = function (the_name) {
    this.my_world_map_name = the_name;
}
StageBoard.prototype.pushButton = function (the_button) {
    this.my_image_button_arr.push(the_button);
    //console.log(this.my_image_button_arr.length);
}

StageBoard.prototype.setActions = function () {
    console.log('start setting actions.');

    var getXandY = function (e) {
        var x = e.clientX - that.my_ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.my_ctx.canvas.getBoundingClientRect().top;

        if (x < 0 || x > that.my_surface_width || y < 0 || y > that.my_surface_height) return null;

        return { x: x, y: y };
    }

    var clickButtonAction = function (the_point) {
        var i, k;
        for (i = 0; i < that.my_image_button_arr.length; i++) {
            if (that.my_image_button_arr[i].isOnButton(the_point, that.my_world_map_id)) {
                //console.log(i);
                if (k = that.my_image_button_arr[i].canPlay()) {
                    break;
                }
            }
        }
	//	console.log(k);
        if (k) {
            //that.my_image_button_arr[i].addOnePoint();
            that.my_image_button_arr[i].startGame();
           // console.log(i +""+k+'on click.');
        }
    }

    var that = this;

    this.my_ctx.canvas.addEventListener("click", function (the_where_click) {
        that.my_where_click = getXandY(the_where_click);
        clickButtonAction(that.my_where_click);

        //console.log(that.my_where_click.x + ', ' + that.my_where_click.y);
    }, false);

    this.my_ctx.canvas.addEventListener("mousemove", function (the_where_move) {
        that.my_where_mouse = getXandY(the_where_move);
        //console.log(that.my_where_mouse.x + ', ' + that.my_where_mouse.y);
    }, false);

    console.log('finish setting actions.');
}

StageBoard.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.my_ctx.canvas);
        
    })();
}

StageBoard.prototype.drowStageBoard = function () {

    this.my_ctx.drawImage(STAGE_ASSET_MANAGER.getAsset(this.my_stage_background), 0, 0, this.my_ctx.canvas.width, this.my_ctx.canvas.height);
    //console.log(this.my_abut.my_left_top.x + ", " + this.my_abut.my_left_top.y);
    //console.log(this.my_image_button_arr.length);
    for (var i = 0; i < this.my_image_button_arr.length; i++) {
        if (this.my_world_map_id === this.my_image_button_arr[i].my_world_map_id) {
            this.my_image_button_arr[i].drowConnection(this.my_ctx);

        }
    }

    for (var i = 0; i < this.my_image_button_arr.length; i++) {
        if (this.my_world_map_id === this.my_image_button_arr[i].my_world_map_id || this.my_image_button_arr[i].my_world_map_id === -1) {
            this.my_image_button_arr[i].drowButton(this.my_ctx, this.my_where_mouse);
        }
        
    }
}

StageBoard.prototype.loop = function () {
	if( MY_STAGE_CANVAS.style.display === "block"){
	    this.my_ctx.clearRect(0, 0, this.my_ctx.canvas.width, this.my_ctx.canvas.height);
		this.drowStageBoard();

		this.my_where_click = null;
	}

    
}

//--------------------------------------------------

//------------------------ button node------------------------

function SBImageButton() {
    this.my_sub_stage = null;
    this.my_world_map_id = null;
    this.my_point = 11;// need to set up by 0... later
	
    this.my_left_top = { x: null, y: null };
    this.my_scales = { width: null, height: null };
    this.my_icon_path_arr = [];
    this.my_next_buttons_arr = [];
    this.my_prev_buttons_arr = [];
    this.my_icon_path = null;
}

// setting the point
SBImageButton.prototype.setPoint = function (the_point) {
    this.my_point = the_point;
}

// not use in real game.. i just createded for testing the open or not for buttons.
SBImageButton.prototype.addOnePoint = function () {
    this.my_point += 1;
}

SBImageButton.prototype.init = function (the_world_map_id, the_sub_stage, the_x, the_y, the_ctx) {
    this.my_world_map_id = the_world_map_id;
    this.my_sub_stage = the_sub_stage;
    this.my_left_top.x = the_x;
    this.my_left_top.y = the_y;
    // width and heigh of button
    this.my_scales.width = the_ctx.canvas.width / 7;
    this.my_scales.height = the_ctx.canvas.height / 7;
}

SBImageButton.prototype.setWidthWithRatio = function (the_ratio) {

		this.my_scales.width = this.my_scales.width * the_ratio;

}
SBImageButton.prototype.pushNextButton = function (the_next_button) {
    this.my_next_buttons_arr.push(the_next_button);
    the_next_button.my_prev_buttons_arr.push(this);
}

// check the mouse is on this button or not. 
SBImageButton.prototype.isOnButton = function (the_where_mouse, the_world_map_id) {
    var left = this.my_left_top.x;
    var top = this.my_left_top.y;
    var right = this.my_left_top.x + this.my_scales.width;
    var bottom = this.my_left_top.y + this.my_scales.height;

    var x = the_where_mouse.x;
    var y = the_where_mouse.y;
    //console.log(the_button.my_scales.x + ", " + right + ", " + top + ", " + bottom + ", " + x + ", " + y + ", ");
    if (x > left && x < right && y > top && y < bottom) {
        if(!the_world_map_id || this.my_world_map_id == the_world_map_id || this.my_world_map_id === -1){
            return true;
        }
        
    }
    return false;
}

// decide which picture for current button. 
// and showing the chosen picture for this button.
SBImageButton.prototype.drowButton = function (the_ctx, the_where_mouse) {
    this.setPath(the_where_mouse);
    the_ctx.drawImage(STAGE_ASSET_MANAGER.getAsset
            (this.my_icon_path),
            this.my_left_top.x, this.my_left_top.y,
            this.my_scales.width, this.my_scales.height);
}

// drowing a line between this button and next level buttons.
SBImageButton.prototype.drowConnection = function (the_ctx) {
    var line_width = 5;

    var getMidPoint = function (the_button) {
        var mid_x = the_button.my_left_top.x + the_button.my_scales.width / 2;
        var mid_y = the_button.my_left_top.y + the_button.my_scales.height / 2;
        return { x: mid_x, y: mid_y };
    }

    var curr_mid_point = getMidPoint(this);

    for (var i = 0; i < this.my_next_buttons_arr.length; i++) {
        var next_mid_point = getMidPoint(this.my_next_buttons_arr[i]);
        the_ctx.beginPath();
        the_ctx.lineWidth = line_width;
        the_ctx.lineCap = 'square';
        the_ctx.moveTo(curr_mid_point.x, curr_mid_point.y);
        the_ctx.lineTo(next_mid_point.x, next_mid_point.y);
        
        the_ctx.stroke();
        the_ctx.closePath();
    }
}

// check can user play this level of game?
// if can, return true, if not return false.
SBImageButton.prototype.canPlay = function () {
    for (var i = 0; i < this.my_prev_buttons_arr.length; i++) {

        if (this.my_prev_buttons_arr[i].my_point < STEP_UP_POINT) {

            return false;
        }
    }
    return true;
}


// decide which picture will show for this button.
SBImageButton.prototype.setPath = function (the_where_mouse) {
	if(this.my_world_map_id === -1){
		if (the_where_mouse && this.isOnButton(the_where_mouse)) { // on mouse.. 

            switch (this.my_sub_stage) {

				case 0:
					this.my_icon_path = IM_ON_BACK_PATH;
                    break;
				case 1:
					this.my_icon_path = WORLD_MAP_ON_1;
					break;
				case 2:
					this.my_icon_path = WORLD_MAP_ON_2;
					break;
                default:
                    break;
            }


        } else {

            switch (this.my_sub_stage) {

				case 0:
					this.my_icon_path = IM_BACK_PATH;
                    break;
				case 1:
					this.my_icon_path = WORLD_MAP_1;
					break;
				case 2:
					this.my_icon_path = WORLD_MAP_2;
					break;
                default:
                    break;
            }

        }
	} else if (this.canPlay()) {
        if (the_where_mouse && this.isOnButton(the_where_mouse)) { // on mouse.. 

            switch (this.my_sub_stage) {

                case 1:
                    this.my_icon_path = ON_M_STAGE_1_PATH;
                    break;
                case 2:
                    this.my_icon_path = ON_M_STAGE_2_PATH;
                    break;
                case 3:
                    this.my_icon_path = ON_M_STAGE_3_PATH;
                    break;
                case 4:
                    this.my_icon_path = ON_M_STAGE_4_PATH;
                    break;
                case 5:
                    this.my_icon_path = ON_M_STAGE_5_PATH;
                    break;
                case 6:
                    this.my_icon_path = ON_M_STAGE_6_PATH;
                    break;
                case 7:
                    this.my_icon_path = ON_M_STAGE_7_PATH;
                    break;

                default:
                    break;
            }


        } else {

            switch (this.my_sub_stage) {
                case 1:
                    this.my_icon_path = OPEN_STAGE_1_PATH;
                    break;
                case 2:
                    this.my_icon_path = OPEN_STAGE_2_PATH;
                    break;
                case 3:
                    this.my_icon_path = OPEN_STAGE_3_PATH;
                    break;
                case 4:
                    this.my_icon_path = OPEN_STAGE_4_PATH;
                    break;
                case 5:
                    this.my_icon_path = OPEN_STAGE_5_PATH;
                    break;
                case 6:
                    this.my_icon_path = OPEN_STAGE_6_PATH;
                    break;
                case 7:
                    this.my_icon_path = OPEN_STAGE_7_PATH;
                    break;

                default:
                    break;
            }

        }
    } else {
        this.my_icon_path = LOCK_IM_PATH;
    }
}

// starting game..... 
SBImageButton.prototype.startGame = function () {
    //console.log('startGame.' + stage_id + this.my_sub_stage);
    // displaying gmae... 
	if(this.my_world_map_id === -1){
		switch (this.my_sub_stage) {
			case 0:
				MY_STAGE_CANVAS.style.display = "none";
				MY_GAME_MANU_CANVAS.style.display = "block";
				break;
			case 1:
				my_stage_board.setWorldMapID(1);
				break;
			case 2:
				my_stage_board.setWorldMapID(2);
				break;
			default: // if do not have game... will return to main cavas.
				break;
		}
	
	// for world map 1
	
	}else if(this.my_world_map_id ===1){ 
		MY_STAGE_CANVAS.style.display = "none";
		MY_GAME_MANU_CANVAS.style.display = "none";
		
		switch (this.my_sub_stage) {
			case 1: // game for stage 1.
			// if you want to change game just change number for - > currentLevel.loadFromFile( this ); 
				currentLevel.loadFromFile(15); 
				blockDisplayGame();
				break;
			case 2: // game for stage 2.
				currentLevel.loadFromFile(14);
				blockDisplayGame();
				break;
			case 3:// game for stage 3.
				currentLevel.loadFromFile(19);
				blockDisplayGame();
				break;
				
			case 4:// game for stage 4.
				currentLevel.loadFromFile(17);
				blockDisplayGame();
				break;
			default: // if do not have game... will return to main cavas.
				MY_GAME_MANU_CANVAS.style.display = "block";
				break;
		}

		
	// for world map 2
	} else if (this.my_world_map_id === 2){ 
	    		MY_STAGE_CANVAS.style.display = "none";
		MY_GAME_MANU_CANVAS.style.display = "none";
		
		switch (this.my_sub_stage) {
			case 1:// game for stage 1.
				currentLevel.loadFromFile(15);
				blockDisplayGame();
				break;
			case 2: // game for stage 2.
				currentLevel.loadFromFile(14);
				blockDisplayGame();
				break;
			case 3:// game for stage 3.
				currentLevel.loadFromFile(19);
				blockDisplayGame();
				break;
				
			default: // if do not have game... will return to main cavas.
				MY_GAME_MANU_CANVAS.style.display = "block";
				break;
		}
		
	}
    
}

// the "main" code begins here

// setting up step up point.
// if the current point > this, will can paly next level.
var STEP_UP_POINT = 10;
var STAGE_ASSET_MANAGER = new AssetManager();

var ST_BOARD_BACK_PATH = "./img/bg_stage_board.png";


//var WORLD_MAP_1= "./img/world_map_button_1.png";
//var WORLD_MAP_2= "./img/world_map_button_2.png";

//var WORLD_MAP_ON_1= "./img/world_map_on_button_1.png";
//var WORLD_MAP_ON_2= "./img/world_map_on_button_2.png";


var WORLD_MAP_1 = "./img/black.png";
var WORLD_MAP_2 = "./img/black.png";

var WORLD_MAP_ON_1 = "./img/black.png";
var WORLD_MAP_ON_2 = "./img/black.png";


var IM_BACK_PATH = "./img/back_button.png";
var IM_ON_BACK_PATH = "./img/on_back_button.png";
var LOCK_IM_PATH = "./img/lock.png";



var OPEN_STAGE_1_PATH = "./img/stage_mark_1.png";
var OPEN_STAGE_2_PATH = "./img/stage_mark_2.png";
var OPEN_STAGE_3_PATH = "./img/stage_mark_3.png";
var OPEN_STAGE_4_PATH = "./img/stage_mark_4.png";
var OPEN_STAGE_5_PATH = "./img/stage_mark_5.png";
var OPEN_STAGE_6_PATH = "./img/stage_mark_6.png";
var OPEN_STAGE_7_PATH = "./img/stage_mark_7.png";

var ON_M_STAGE_1_PATH = "./img/select_stage_mark_1.png";
var ON_M_STAGE_2_PATH = "./img/select_stage_mark_2.png";
var ON_M_STAGE_3_PATH = "./img/select_stage_mark_3.png";
var ON_M_STAGE_4_PATH = "./img/select_stage_mark_4.png";
var ON_M_STAGE_5_PATH = "./img/select_stage_mark_5.png";
var ON_M_STAGE_6_PATH = "./img/select_stage_mark_6.png";
var ON_M_STAGE_7_PATH = "./img/select_stage_mark_7.png";

STAGE_ASSET_MANAGER.queueDownload(ST_BOARD_BACK_PATH);

STAGE_ASSET_MANAGER.queueDownload(LOCK_IM_PATH);
STAGE_ASSET_MANAGER.queueDownload(IM_BACK_PATH);

STAGE_ASSET_MANAGER.queueDownload(WORLD_MAP_1);
STAGE_ASSET_MANAGER.queueDownload(WORLD_MAP_2);
STAGE_ASSET_MANAGER.queueDownload(WORLD_MAP_ON_1);
STAGE_ASSET_MANAGER.queueDownload(WORLD_MAP_ON_2);


STAGE_ASSET_MANAGER.queueDownload(IM_ON_BACK_PATH);

STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_1_PATH);
STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_2_PATH);
STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_3_PATH);
STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_4_PATH);
STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_5_PATH);
STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_6_PATH);
STAGE_ASSET_MANAGER.queueDownload(OPEN_STAGE_7_PATH);

STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_1_PATH);
STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_2_PATH);
STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_3_PATH);
STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_4_PATH);
STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_5_PATH);
STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_6_PATH);
STAGE_ASSET_MANAGER.queueDownload(ON_M_STAGE_7_PATH);

var MY_STAGE_CANVAS;
var my_stage_board;
STAGE_ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    //var stage_canvas = document.getElementById('stage_board');
    MY_STAGE_CANVAS = document.getElementById('stage_board');
    var stage_ctx = MY_STAGE_CANVAS.getContext('2d');

    my_stage_board = new StageBoard();
    // put ctx, stage board level, stage board name.
  //  my_stage_board.init(stage_ctx);
    my_stage_board.init(stage_ctx,1,1);
    // setting the background.
    my_stage_board.setBackground(ST_BOARD_BACK_PATH);
    // sub_level, top left x, top_left y, ctx
	
	var back_button = new SBImageButton();
	// world -1, and sub -1 = back buttom.
	back_button.init(-1, 0, 0, 0, stage_ctx);
	back_button.setWidthWithRatio(1.5);
	my_stage_board.pushButton(back_button);
	
		var world_map_1_button = new SBImageButton();
	// world -1, and sub -1 = back buttom.
	world_map_1_button.init(-1, 1, back_button.my_scales.width, 0, stage_ctx);
	world_map_1_button.setWidthWithRatio(2.75);
	my_stage_board.pushButton(world_map_1_button);
	
		var world_map_2_button = new SBImageButton();
	// world -1, and sub -1 = back buttom.
	world_map_2_button.init(-1, 2, back_button.my_scales.width + world_map_1_button.my_scales.width , 0, stage_ctx);
	world_map_2_button.setWidthWithRatio(2.75);
	my_stage_board.pushButton(world_map_2_button);
	
    // latter... 
    // get datas for wold map.. and just looping it. 
    // need, worldmap id, substage id, position of button.? do i do by ramdomly???

    var world1_sub1 = new SBImageButton();
  
    world1_sub1.init(1, 1, 30, 100, stage_ctx);

    var world1_sub2 = new SBImageButton();
    world1_sub2.init(1, 2, 200, 200, stage_ctx);

    var world1_sub3 = new SBImageButton();
    world1_sub3.init(1, 3, 200, 100, stage_ctx);

    var world1_sub4 = new SBImageButton();
    world1_sub4.init(1, 4, 300, 150, stage_ctx);

    // put next level...
    world1_sub1.pushNextButton(world1_sub2);
    world1_sub1.pushNextButton(world1_sub3);

    world1_sub2.pushNextButton(world1_sub4);
    world1_sub3.pushNextButton(world1_sub4);

    my_stage_board.pushButton(world1_sub1);
    my_stage_board.pushButton(world1_sub2);
    my_stage_board.pushButton(world1_sub3);
    my_stage_board.pushButton(world1_sub4);

    var world2_sub1 = new SBImageButton();
    world2_sub1.init(2, 1, 150, 100, stage_ctx);
    var world2_sub2 = new SBImageButton();
    world2_sub2.init(2, 2, 20, 150, stage_ctx);
    var world2_sub3 = new SBImageButton();
    world2_sub3.init(2, 3, 300, 250, stage_ctx);

    world2_sub1.pushNextButton(world2_sub2);
    world2_sub1.pushNextButton(world2_sub3);

    my_stage_board.pushButton(world2_sub1);
    my_stage_board.pushButton(world2_sub2);
    my_stage_board.pushButton(world2_sub3);

    my_stage_board.start();
});