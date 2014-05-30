var is_log_in = true;

var my_user_name = null;

function logInButtonAction(){
	var input_user_name = document.getElementById("username").value;
	var input_user_pass = document.getElementById("password").value;

	//--- have methods 
	
	
	
	if(is_log_in){
		my_user_name = input_user_name;
		document.getElementById("login_board").style.display = "none";
		displayMainManu();
	}
}
