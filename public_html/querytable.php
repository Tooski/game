<?php
include "database.php";


//$data = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo json_encode(mysqli_query(Database::getConnection(), "SELECT * FROM users")->fetch_assoc());


