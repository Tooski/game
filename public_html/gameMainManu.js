/*
	Minkwan Choi
	last updated : 5/13/2014
	game Main Manu.....
	has buttons for start game, custom game, about, log out.
*/


//----------------------------------------- Game main manu.


function GameManu() {
    console.log('start creating GameBoard');
    this.my_ctx = null;
    this.my_where_click = null;
    this.my_where_mouse = null;
    this.my_surface_width = null;
    this.my_surface_height = null;
    this.my_image_button_arr = [];
    this.my_stage_background = null;
    console.log('finish creating GameManu');
}


GameManu.prototype.init = function (the_ctx) {
    console.log('start init GameManu.');
    this.my_ctx = the_ctx;
    this.my_surface_width = this.my_ctx.canvas.width;
    this.my_surface_height = this.my_ctx.canvas.height;

    this.setActions();
    console.log('finish init GameManu.');
}

GameManu.prototype.setBackground = function (the_path) {
    this.my_stage_background = the_path;
}

GameManu.prototype.pushButton = function (the_button) {
    this.my_image_button_arr.push(the_button);
    //console.log(this.my_image_button_arr.length);
}

GameManu.prototype.setActions = function () {
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
            if (k = that.my_image_button_arr[i].isOnButton(the_point)) {
                // console.log(i);
                    break;
                
            }
        }
        //console.log(i);
        if (k) {
            that.my_image_button_arr[i].playButton();
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

GameManu.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.my_ctx.canvas);
    })();
}

GameManu.prototype.drowGameManu = function () {

    this.my_ctx.drawImage(GM_BOARD_ASSET_MANAGER.getAsset(this.my_stage_background), 0, 0, this.my_ctx.canvas.width, this.my_ctx.canvas.height);
    //console.log(this.my_abut.my_left_top.x + ", " + this.my_abut.my_left_top.y);
    //console.log(this.my_image_button_arr.length);

    for (var i = 0; i < this.my_image_button_arr.length; i++) {
        this.my_image_button_arr[i].drowButton(this.my_ctx, this.my_where_mouse);
    }
}

GameManu.prototype.loop = function () {
	if(MY_GAME_MANU_CANVAS.style.display === "block"){
    this.my_ctx.clearRect(0, 0, this.my_ctx.canvas.width, this.my_ctx.canvas.height);
    this.drowGameManu();
    this.my_where_click = null;
	}
}

//--------------------------------------------------

//------------------------ button node------------------------

function GMImageButton() {
    this.my_manu_type = null;
    this.my_left_top = { x: null, y: null };
    this.my_scales = { width: null, height: null };

    this.my_icon_path = null;
}

GMImageButton.prototype.init = function (the_manu_type, the_x, the_y, the_width, the_height) {
    this.my_manu_type = the_manu_type;
    this.my_left_top.x = the_x;
    this.my_left_top.y = the_y;
    this.my_scales.width = the_width;
    this.my_scales.height = the_height;
}

// check the mouse is on this button or not. 
GMImageButton.prototype.isOnButton = function (the_where_mouse) {
    var left = this.my_left_top.x;

    var top = this.my_left_top.y;
    var right = this.my_left_top.x + this.my_scales.width;
    var bottom = this.my_left_top.y + this.my_scales.height;

    var x = the_where_mouse.x;
    var y = the_where_mouse.y;
    //console.log(the_button.my_scales.x + ", " + right + ", " + top + ", " + bottom + ", " + x + ", " + y + ", ");
    if (x > left && x < right && y > top && y < bottom) {
        return true;
    }
    return false;
}

// decide which picture for current button. 
// and showing the chosen picture for this button.
GMImageButton.prototype.drowButton = function (the_ctx, the_where_mouse) {
    this.setPath(the_where_mouse);
    the_ctx.drawImage(GM_BOARD_ASSET_MANAGER.getAsset
            (this.my_icon_path),
            this.my_left_top.x, this.my_left_top.y,
            this.my_scales.width, this.my_scales.height);
}

// decide which picture will show for this button.
GMImageButton.prototype.setPath = function (the_where_mouse) {

        if (the_where_mouse && this.isOnButton(the_where_mouse)) { // on mouse.. 

            switch (this.my_manu_type) {

                case 1:
                    this.my_icon_path = ON_START_GAME_IM_PATH;
                    break;
                case 2:
                    this.my_icon_path = ON_COSTOM_GAME_IM_PATH;
                    break;
                case 3:
                    this.my_icon_path = ON_ABOUT_IM_PATH;
                    break;
                case 4:
                    this.my_icon_path = ON_LOG_OUT_IIM_PATH;
                    break;
                default:
                    break;
            }


        } else {
            switch (this.my_manu_type) {
                case 1:
                    this.my_icon_path = START_GAME_IM_PATH;
                    break;
                case 2:
                    this.my_icon_path = COSTOM_GAME_IM_PATH;
                    break;
                case 3:
                    this.my_icon_path = ABOUT_IM_PATH;
                    break;
                case 4:
                    this.my_icon_path = LOG_OUT_IIM_PATH;
                    break;
                default:
                    break;
            }

        }

}

// 1== start game
// 2 == customgame
// 3 == about
// 4 == log out

// starting game..... set upt here...
// this method has buttons' actions...
GMImageButton.prototype.playButton = function () {

    //console.log('playButton....');

    switch (this.my_manu_type) {
        case 1:
            // to world map
            // un-display play game manu canvas
            MY_GAME_MANU_CANVAS.style.display = "none";
			
            // dispaly the world map canvase 
            MY_STAGE_CANVAS.style.display = "block";
            //.... just incase dislay = "non for any other screen for gaming later...."
			noneDisplayGame();
			//canvas.style.display = "none";
			
			my_stage_board.setWorldMapID(1);
            break;
        case 2:
			
			MY_GAME_MANU_CANVAS.style.display = "none";
			noneDisplayGame(); 	
            // dispaly the world map canvase 
            MY_STAGE_CANVAS.style.display = "block";
            my_stage_board.setWorldMapID(2);
			
            // to custom game manu. open up canvas for custom game...
            break;
        case 3:
            // to about...
            break;
        case 4:
            // log out...
            break;
    }

}

// the "main" code begins here

// setting up step up point.
// if the current point > this, will can paly next level.
var STEP_UP_POINT = 10;
var GM_BOARD_ASSET_MANAGER = new AssetManager();

var GM_BOARD_BACK_PATH = "./img/bg_main_board.jpg";


var START_GAME_IM_PATH = "./img/manu_start_game_button.png";
var COSTOM_GAME_IM_PATH = "./img/manu_custom_game_button.png";
var ABOUT_IM_PATH = "./img/manu_about_button.png";
var LOG_OUT_IIM_PATH = "./img/manu_log_out_button.png";

var ON_START_GAME_IM_PATH = "./img/on_manu_start_game_button.png";
var ON_COSTOM_GAME_IM_PATH = "./img/on_manu_custom_game_button.png";
var ON_ABOUT_IM_PATH = "./img/on_manu_about_button.png";
var ON_LOG_OUT_IIM_PATH = "./img/on_manu_log_out_button.png";
GM_BOARD_ASSET_MANAGER.queueDownload(GM_BOARD_BACK_PATH);

GM_BOARD_ASSET_MANAGER.queueDownload(START_GAME_IM_PATH);
GM_BOARD_ASSET_MANAGER.queueDownload(COSTOM_GAME_IM_PATH);
GM_BOARD_ASSET_MANAGER.queueDownload(ABOUT_IM_PATH);
GM_BOARD_ASSET_MANAGER.queueDownload(LOG_OUT_IIM_PATH);

GM_BOARD_ASSET_MANAGER.queueDownload(ON_START_GAME_IM_PATH);
GM_BOARD_ASSET_MANAGER.queueDownload(ON_COSTOM_GAME_IM_PATH);
GM_BOARD_ASSET_MANAGER.queueDownload(ON_ABOUT_IM_PATH);
GM_BOARD_ASSET_MANAGER.queueDownload(ON_LOG_OUT_IIM_PATH);

var MY_GAME_MANU_CANVAS;
GM_BOARD_ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    //var game_manu_canvas = document.getElementById('game_manu_board');
    MY_GAME_MANU_CANVAS = document.getElementById('game_manu_board');
    var game_manu_ctx = MY_GAME_MANU_CANVAS.getContext('2d');
    
    var my_game_manu_board = new GameManu();
    // put ctx, stage board level, stage board name.
    my_game_manu_board.init(game_manu_ctx);
    // setting the background.
    my_game_manu_board.setBackground(GM_BOARD_BACK_PATH);



    // 1== start game
    // 2 == customgame
    // 3 == about
    // 4 == log out
        
    var manu_button_height = game_manu_ctx.canvas.height / 6.5;
    var manu_button_width = game_manu_ctx.canvas.width / 2;
    var manu_button_x = game_manu_ctx.canvas.width / 4
    var manu_button_y = game_manu_ctx.canvas.height / 26
// button id , top left x, top_left y, width, height.
    var th_stage1 = new GMImageButton();
    th_stage1.init(1, manu_button_x, 2 * manu_button_y, manu_button_width, manu_button_height);

    var th_stage2 = new GMImageButton();
    th_stage2.init(2, manu_button_x, 7 * manu_button_y, manu_button_width, manu_button_height);

    var th_stage3 = new GMImageButton();
    th_stage3.init(3, manu_button_x, 12 * manu_button_y, manu_button_width, manu_button_height);

    var th_stage4 = new GMImageButton();
    th_stage4.init(4, manu_button_x, 17 * manu_button_y, manu_button_width, manu_button_height);



    my_game_manu_board.pushButton(th_stage1);
    my_game_manu_board.pushButton(th_stage2);
    my_game_manu_board.pushButton(th_stage3);
    my_game_manu_board.pushButton(th_stage4);

    my_game_manu_board.start();
	
	
});