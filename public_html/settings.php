<?php

//constants

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    file_put_contents('terraindata.json', $_POST["data"]);
    
    echo var_dump($_POST);
    
}else if($_SERVER['REQUEST_METHOD'] === 'GET'){
    
    
    echo file_get_contents("terraindata.json");
    
}else{
    
    http_response_code(500);
    
}



