<?php
include 'database.php';
//constants
    $db = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_POST = sanitize($db, $_POST);
    switch($_POST["command"]) {
        case "updatelevel": 
            echo "poop";
            $stmt = mysqli_prepare($db, "UPDATE Levels SET jsonstring = ? WHERE levelID = ?;");
            mysqli_stmt_bind_param($stmt, "ss", $_POST["data"]["jsonstring"], $_POST["data"]["levelid"]);
            mysqli_stmt_execute($stmt);
            
            break;
        case "savelevel":
            $stmt = mysqli_prepare($db, "INSERT INTO Levels (jsonstring, levelname) VALUES (?, ?);");
            mysqli_stmt_bind_param($stmt, "ss", $_POST["data"]["jsonstring"], $_POST["data"]["levelname"]);
            mysqli_stmt_execute($stmt);
            echo mysqli_insert_id($db);
            break;
        case "signIn":
            $stmt = mysqli_prepare($db, "INSERT INTO Users (lastname, firstname,username,password,email) VALUES (?,?,?,?,?);");
            mysqli_stmt_bind_param($stmt, "sssss", $_POST["data"]["lastname"], $_POST["data"]["firstname"],$_POST["data"]["username"],
                    $_POST["data"]["password"],$_POST["data"]["email"]);
            //boolean result
            $result = mysqli_stmt_execute($stmt);
            echo $result;
            break;
    }    
}else if($_SERVER['REQUEST_METHOD'] === 'GET'){
    $_GET = sanitize($db, $_GET);

    switch($_GET["command"]) {

        case "getlevelinfo":
                $str = "SELECT levelname, levelID FROM Levels";
                $stmt = $db->query($str);
                echo json_encode($stmt->fetch_all(MYSQLI_ASSOC));

            break;
        case "getleveljson": 
                $stmt = mysqli_prepare($db, "SELECT jsonstring FROM Levels WHERE levelID = ?;");
                mysqli_stmt_bind_param($stmt, "i",$_GET["data"]["levelid"]);
                mysqli_stmt_execute($stmt);
            
                mysqli_stmt_bind_result($stmt,$str);
                while ($stmt->fetch()) {
                    echo json_encode(stripslashes($str));
                }
                break;
        case "login":
                $stmt = mysqli_prepare($db, "SELECT EXISTS(select * from Users where username = ? and password = ?);");
                mysqli_stmt_bind_param($stmt, "ss", $_GET["data"]["username"],$_GET["data"]["password"]);
                mysqli_stmt_execute($stmt);
                
                mysqli_stmt_bind_result($stmt,$rslt);
                while($stmt->fetch()) {
                    echo $rslt;
                }
                break;


    }
//INSERT INTO  `Users` (  `userID` ,  `lastname` ,  `firstname` ,  `username` ,  `password` ,  `email` ,  `timestamp` ) 
//VALUES (
//NULL ,  "Herrera",  "Michael",  "mike77",  "121212",  "mike@uw.edu",  "12:56:23"
//)

    
}else{
    
    http_response_code(500);
    
}




function sanitize($db, $input) {
    if (is_array($input)) {
        foreach($input as $var=>$val) {
            $output[$var] = sanitize($db, $val);
        }
    }
    else {
        if (get_magic_quotes_gpc()) {
            $input = stripslashes($input);
        }
        $input  = cleanInput($input);
        $output = mysqli_real_escape_string($db, $input);
    }
    return $output;
}

function cleanInput($input) {
 
  $search = array(
    '@<script[^>]*?>.*?</script>@si',   // Strip out javascript
    '@<[\/\!]*?[^<>]*?>@si',            // Strip out HTML tags
    '@<style[^>]*?>.*?</style>@siU',    // Strip style tags properly
    '@<![\s\S]*?--[ \t\n\r]*>@'         // Strip multi-line comments
  );
 
    $output = preg_replace($search, '', $input);
    return $output;
  }