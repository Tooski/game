/*
	Minkwan Choi
	last updated : 5/30/2014
	methods(functions) of cantrol dispaly
*/




function displaySignUpLoginChoice(){

	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();

    document.getElementById("choice_board").style.display = "block";
}

function displayLogIN(){
	document.getElementById('error-username-password').innerHTML = "";
	document.getElementById('username').value = "";
	document.getElementById('password').value = "";
	
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
	my_stage_board.reSetPoint();
	document.getElementById("login_board").style.display = "block";
}


function displaySignUp(){
	document.getElementById('error-fname').innerHTML = "";
	document.getElementById('error-lname').innerHTML = "";
	document.getElementById('error-username-exists').innerHTML = "";
	document.getElementById('error-username').innerHTML = "";
	document.getElementById('error-password').innerHTML = "";
	document.getElementById('error-email-exists').innerHTML = "";
	document.getElementById('error-email').innerHTML = "";

	document.getElementById("firstname").value = "";
	document.getElementById('lastname').value = "";
    document.getElementById("signupusername").value = "";
    document.getElementById("signuppassword").value = "";
	document.getElementById("email").value = "";
	
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
    document.getElementById("sing-up-board").style.display = "block";
}

// -----------------------------
function displayMainMenu(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
	my_g_stage_id = null;
	my_g_position_id = null;
	
	MY_GAME_MANU_CANVAS.style.display = "block";
	
}

//-------------------------------
function displayWorldMap(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
	if(my_g_stage_id){
		my_stage_board.setWorldMapID(my_g_stage_id);
	} else {
		my_stage_board.setWorldMapID(1);
	
	}
	my_g_stage_id = null;
	my_g_position_id = null;
	
	MY_STAGE_CANVAS.style.display = "block";
	
}

function displayCustomGame(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
	
	document.getElementById("mapEditor").style.display = "block";
	//--- this should be fix later... just showing 
	currentLevel.loadFromFile(); 
	//---------------------------------
	blockDisplayGame();
	GameCanvas[0].focus(); // focus on game canvs.
    editMode = true;
}

function displayAboutBoard(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
	document.getElementById("about_board").style.display = "block";
}

//-------------------------------------------------------

function displayGame(id){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();
	
	my_g_level_id = id;
	//console.log(my_g_level_id);
    currentLevel.loadFromFile(id); 
	blockDisplayGame();
	GameCanvas[0].focus(); // focus on game canvs.
}

function displayReplayGame(the_index){
	
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();

	//console.log(my_jar_list[the_index]);
	//console.log(the_index);
	 //my_g_level_id= id;
	currentLevel.loadFromFile(my_g_level_id);
	gameEngine.physEng.loadReplay(my_jar_list[the_index]);
	blockDisplayGame();
	//GameCanvas[0].focus(); // focus on game canvs.
}


function displayLeaderBoard(){
	MY_STAGE_CANVAS.style.display = "none";
	MY_GAME_MANU_CANVAS.style.display = "none";
	document.getElementById("choice_board").style.display = "none";
	document.getElementById("sing-up-board").style.display = "none";
	document.getElementById("login_board").style.display = "none";
	document.getElementById("leader_board").style.display = "none";
	document.getElementById("mapEditor").style.display = "none";
	document.getElementById("about_board").style.display = "none";
	noneDisplayGame();

	document.getElementById("leader_board").style.display = "block";
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

