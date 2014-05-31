<?php

include 'database.php';
//constants
$db = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $_POST = sanitize($db, $_POST);
    switch ($_POST["command"]) {
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
            mysqli_stmt_bind_param($stmt, "sssss", $_POST["data"]["lastname"], $_POST["data"]["firstname"], $_POST["data"]["username"], $_POST["data"]["password"], $_POST["data"]["email"]);
            //boolean result
            $result = mysqli_stmt_execute($stmt);
            echo $result;
            break;
        case "insertScore":
            $stmt = mysqli_prepare($db, "INSERT INTO Scores VALUES(null, ?,?, ?, ?,?);");
            mysqli_stmt_bind_param($stmt, "iiii", $_POST["data"]["userID"], $_POST["data"]["levelID"], $_POST["data"]["score"], $_POST["data"]["completetime"], $_POST["data"]["replay"]);
            //boolean result
            $result = mysqli_stmt_execute($stmt);
            echo $result;
            break;
        case "addLevelToStage":
            $stmt = mysqli_prepare($db, "insert into StageLevels values (?,?,?);");
            mysqli_stmt_bind_param($stmt, "iii", $_POST["data"]["stageID"], $_POST["data"]["levelID"], $_POST["data"]["postion"]);
            //boolean result
            $result = mysqli_stmt_execute($stmt);
            echo $result;
            break;
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $_GET = sanitize($db, $_GET);

    switch ($_GET["command"]) {

        case "getlevelinfo":
            $str = "SELECT levelname, levelID FROM Levels";
            $stmt = $db->query($str);
            echo json_encode($stmt->fetch_all(MYSQLI_ASSOC));

            break;
        case "getleveljson":
            $stmt = mysqli_prepare($db, "SELECT jsonstring FROM Levels WHERE levelID = ?;");
            mysqli_stmt_bind_param($stmt, "i", $_GET["data"]["levelid"]);
            mysqli_stmt_execute($stmt);

            mysqli_stmt_bind_result($stmt, $str);
            while ($stmt->fetch()) {
                echo json_encode(stripslashes($str));
            }
            break;
        case "login":
            $stmt = mysqli_prepare($db, "SELECT EXISTS(select * from Users where username = ? and password = ?);");
            mysqli_stmt_bind_param($stmt, "ss", $_GET["data"]["username"], $_GET["data"]["password"]);
            mysqli_stmt_execute($stmt);

            mysqli_stmt_bind_result($stmt, $rslt);
            while ($stmt->fetch()) {
                echo $rslt;
            }
            break;
        case "checkEmail":
            $stmt = mysqli_prepare($db, "SELECT EXISTS(select * from Users where email = ?);");
            mysqli_stmt_bind_param($stmt, "s", $_GET["data"]["email"]);
            mysqli_stmt_execute($stmt);

            mysqli_stmt_bind_result($stmt, $rslt);
            while ($stmt->fetch()) {
                echo $rslt;
            }
            break;
        case "checkUserName":
            $stmt = mysqli_prepare($db, "SELECT EXISTS(select * from Users where username = ?);");
            mysqli_stmt_bind_param($stmt, "s", $_GET["data"]["username"]);
            mysqli_stmt_execute($stmt);

            $count = mysqli_stmt_bind_result($stmt, $rslt);

            while ($stmt->fetch()) {
                echo $rslt;
            }
            break;
        case "highScore":
            $stmt = mysqli_prepare($db, "SELECT Users.username, MAX(Scores.score),Scores.replay FROM Users INNER JOIN Scores ON Users.userID = Scores.userID WHERE Scores.levelID = ?; ");
            mysqli_stmt_bind_param($stmt, "i", $_GET["data"]["levelID"]);
            mysqli_stmt_execute($stmt);

            /* bind variables to prepared statement */
            $stmt->bind_result($col1, $col2, $col3);

            /* fetch values */
            while ($stmt->fetch()) {
                printf("%s %s\n", $col1, $col2, $col3);
            }
            break;
        case "bestTime":
            $stmt = mysqli_prepare($db, "SELECT Users.username, MIN(Scores.completetime), Scores.replay FROM Users INNER JOIN Scores on Users.userID = Scores.userID where Scores.levelID = ?; ");
            mysqli_stmt_bind_param($stmt, "i", $_GET["data"]["levelID"]);
            mysqli_stmt_execute($stmt);

            /* bind variables to prepared statement */
            $stmt->bind_result($col1, $col2, $col3);

            /* fetch values */
            while ($stmt->fetch()) {
                printf("%s %s\n", $col1, $col2, $col3);
            }

        case "topTenTime":
            $stmt = mysqli_prepare($db, "SELECT Users.username, Scores.completetime, Scores.replay FROM Users INNER JOIN Scores ON Users.userID = Scores.userID WHERE Scores.levelID = ? ORDER BY Scores.completetime LIMIT 10;");
            mysqli_stmt_bind_param($stmt, "i", $_GET["data"]["levelID"]);
            mysqli_stmt_execute($stmt);

            /* bind variables to prepared statement */
            $stmt->bind_result($col1, $col2, $col3);

            /* fetch values */
            while ($stmt->fetch()) {
                printf("%s&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;%s-", $col1, $col2, $col3);
            }
            break;
        case "topTenHighScore":
            $stmt = mysqli_prepare($db, "SELECT Users.username, Scores.score ,Scores.replay FROM Users INNER JOIN Scores ON Users.userID = Scores.userID WHERE Scores.levelID = ? ORDER BY Scores.score DESC LIMIT 10;");
            mysqli_stmt_bind_param($stmt, "i", $_GET["data"]["levelID"]);
            mysqli_stmt_execute($stmt);

            /* bind variables to prepared statement */
            $stmt->bind_result($col1, $col2, $col3);

            /* fetch values */
            while ($stmt->fetch()) {
                printf("%s&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;%s- %s-", $col1, $col2, $col3);
            }
            break;
        case "getStageLevels":
            $stmt = mysqli_prepare($db, "select Levels.levelname from Levels inner join StageLevels on Levels.levelID = StageLevels.levelID where StageLevels.stageID = ?;");
            mysqli_stmt_bind_param($stmt, "i", $_GET["data"]["stageID"]);
            mysqli_stmt_execute($stmt);

            /* bind variables to prepared statement */
            $stmt->bind_result($col1);

            /* fetch values */
            while ($stmt->fetch()) {
                printf("%s \n", $col1);
            }
            break;
    }
} else {

    http_response_code(500);
}

function sanitize($db, $input) {
    if (is_array($input)) {
        foreach ($input as $var => $val) {
            $output[$var] = sanitize($db, $val);
        }
    } else {
        if (get_magic_quotes_gpc()) {
            $input = stripslashes($input);
        }
        $input = cleanInput($input);
        $output = mysqli_real_escape_string($db, $input);
    }
    return $output;
}

function cleanInput($input) {

    $search = array(
        '@<script[^>]*?>.*?</script>@si', // Strip out javascript
        '@<[\/\!]*?[^<>]*?>@si', // Strip out HTML tags
        '@<style[^>]*?>.*?</style>@siU', // Strip style tags properly
        '@<![\s\S]*?--[ \t\n\r]*>@'         // Strip multi-line comments
    );

    $output = preg_replace($search, '', $input);
    return $output;
}
