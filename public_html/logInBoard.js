
var my_user_name = null;

function logInButtonAction() {
    var input_user_name = document.getElementById("username").value;
    var input_user_pass = document.getElementById("password").value;
    //donkey
    game.settings.get({"command": "login",
        "data": {"username": input_user_name, "password": input_user_pass}}, function(callback) {
        console.log(callback);
        if (callback === "1") {
            my_user_name = input_user_name;
            displayMainManu();
            console.log("user is in db");
        } else {
            console.log("invalid name");

        }
    });

}
