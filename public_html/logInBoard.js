
var my_user_id = null || 1004;

function logInButtonAction() {
    var input_user_name = document.getElementById("username").value;
    var input_user_pass = document.getElementById("password").value;
    //donkey
    game.settings.get({"command": "login",
        "data": {"username": input_user_name, "password": input_user_pass}}, function(callback) {
        console.log(callback);
        if (callback !== null) {
            my_user_id = callback;
            displayMainMenu();
        } else {
            document.getElementById('error-username-password').innerHTML = "invalid name or password";
            //displayLogIN();
            

        }
    });

}
