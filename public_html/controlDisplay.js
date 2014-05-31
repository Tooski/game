/*
	Minkwan Choi
	last updated : 5/30/2014
	methods(functions) of cantrol dispaly
*/


function displayLogIN(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	noneDisplayGame();
	document.getElementById("leader_board").style.display = "none";
	
	document.getElementById("login_board").style.display = "block";
}

function displayMainManu(){
	MY_STAGE_CANVAS.style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	noneDisplayGame();
	
	MY_GAME_MANU_CANVAS.style.display = "block";
}

function displayWorldMap(){
    MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	noneDisplayGame();
	
	my_stage_board.setWorldMapID(1);
	MY_STAGE_CANVAS.style.display = "block";
	
}

function displayGame(id){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	
	
	my_g_level_id = id;
	currentLevel.loadFromFile(id); 
	blockDisplayGame();
	//console.log(	my_g_world_id +","+my_g_stage_id +","+my_g_game_id);
	GameCanvas[0].focus(); // focus on game canvs.
}

function displayLeaderBoard(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	noneDisplayGame();
	document.getElementById("login_board").style.display = "none";
	leaderBoardUpdate();
	document.getElementById("leader_board").style.display = "block";
}


function displayAboutBoard(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	noneDisplayGame();
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	
}

// to un-display.
function noneDisplayGame(){
	for(var i = 0; i < GameCanvas.length; i++){
		GameCanvas[i].style.display = "none";
	}

}
// show game canvs.
function blockDisplayGame(){
	for(var i = 0; i < GameCanvas.length; i++){
		GameCanvas[i].style.display = "block";
	}
}

