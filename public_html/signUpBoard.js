/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function signInButtonAction() {
    var fname = document.getElementById('firstname').value;
    var lname = document.getElementById('lastname').value;
    var username = document.getElementById('signupusername').value;
    var password = document.getElementById('signuppassword').value;
    var email = document.getElementById('email').value;
    var error_array = [];

        //check to see if email already exists
    if (email !== '') {

        var that_error_array = [];
        game.settings.get({"command": "checkEmail",
            "data": {"email": email}},
        function(callback) {
            var that_error_array = this.error_array;
            if (callback === "1") {
                //console.log("email already exists " + callback);
                document.getElementById('error-email-exists').innerHTML = "email already exists";
                document.getElementById('email').value = "";
                document.getElementById('email').focus();
                that_error_array.push("email already exists");
            } else {
                //console.log("email does not exist " + callback);
            }

        });
        error_array.push(that_error_array[0]);
    }

    //check to see if username alread exists
    if (username !== '') {
        var that_error_array = [];
        game.settings.get({"command": "checkUserName",
            "data": {"username": username}},
        function(callback) {
            if (callback === "1") {
                //console.log("username already exists" + callback);
                document.getElementById('error-username-exists').innerHTML = "username already exists";
                document.getElementById('signupusername').value = "";
                document.getElementById('signupusername').focus();
                that_error_array.push("username already exists");
            } else {
                //console.log("user does not exist " + callback);
            }

        });
        error_array.push(that_error_array[0]);
    }








    if (email === '') {
        document.getElementById('error-email').innerHTML = "field is required";
        error_array.push("field is required");
        document.getElementById('email').focus();
    }
    if (password === '') {
        document.getElementById('error-password').innerHTML = "field is required";
        document.getElementById('signuppassword').focus();
        error_array.push("field is required");

    }
    if (username === '') {
        document.getElementById('error-username').innerHTML = "field is required";
        document.getElementById('signupusername').focus();
        error_array.push("field is required");

    }
    if (lname === '') {
        document.getElementById('error-lname').innerHTML = "field is required";
        document.getElementById('lastname').focus();
        error_array.push("field is required");

    }
    if (fname === '') {
        document.getElementById('error-fname').innerHTML = "field is required";
        document.getElementById('firstname').focus();
        error_array.push("field is required");

    }



    //insert new user into database
    console.log("the length is " + error_array.length);
    if (error_array.length === 0) {
       
        game.settings.post({"command": "signIn",
            "data": {"lastname": lname, "firstname": fname, "username": username,
                "password": password, "email": email, "timestamp": "2014-12-12 12:12:12"}},
        function(callback) {
            if (callback === "1") {
                console.log("user inserted");
                document.getElementById('username').value = username;
                document.getElementById('password').focus();
                document.getElementById('password').value = "";
                displayLogIN();

            } else {
                console.log("not inserted");
            }

        });
    }


}


