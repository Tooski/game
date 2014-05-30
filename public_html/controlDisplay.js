/*
	Minkwan Choi
	last updated : 5/30/2014
	methods(functions) of control dispaly
*/


function displayLogIN(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	noneDisplayGame();
	document.getElementById("login_board").style.display = "block";
	//log in block.
}

function displayMainManu(){
	MY_STAGE_CANVAS.style.display = "none";
	// none log in non
	noneDisplayGame();
	MY_GAME_MANU_CANVAS.style.display = "block";
}

function displayWorldMap(){
	console.log("world map");
    MY_GAME_MANU_CANVAS.style.display = "none";
	// non log in non
	noneDisplayGame();
	my_stage_board.setWorldMapID(1);
	MY_STAGE_CANVAS.style.display = "block";
	
}

function displayGame(id){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	// log in none.
	
	currentLevel.loadFromFile(id); 
	blockDisplayGame();
	GameCanvas[0].focus(); // focus on game canvs.
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

