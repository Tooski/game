/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function signInButtonAction() {

    //check to see if username alread exists
    game.settings.get({"command": "checkUserName",
        "data": {"username": "donkey"}},
    function(callback) {
        console.log(callback);
        if (callback === "1") {

            console.log("username already exists " + callback);
        } else {
            console.log("user does not exist " + callback);
        }

    });



    //check to see if email already exists
    game.settings.get({"command": "checkEmail",
        "data": {"email": "dong@uw.edu"}},
    function(callback) {
        if (callback === "1") {
            console.log("email already exists " + callback);
        } else {
            console.log("email does not exist " + callback);
        }

    });


    //insert new user into database
    
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

}

