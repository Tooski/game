<?php
/**
 * Database connector class.
 * Josef Nosov
 */
class Database{

/**
 * The database connection. Only one connection is needed.
 * @var the database.
 */
private $db;

/**
 * The singleton class.
 * @var the current class (self), that is acting as a singleton.
 */
private static $singleton;

/**
 * THe constructor.
 * @throws Exception if unable to connect, throws exception.
 */
private function __construct() {
    
        $this->db = mysqli_connect("192.168.0.30", "root", "13243546", "hamstergame");
        if ($this->db->connect_error){
            throw new Exception("Connect Error (".$this->db->connect_errno.") ".$this->db->connect_error);
        } // Error handling, should be changed later.
}


/**
 * Creates a singleton instance.
 * @return This database class.
 */
private static function getInstance() {
    if(!self::$singleton) {
        self::$singleton = new Database();
    }
    return self::$singleton;
}

/**
 * Returns the connection of the singleton instance.
 * @return Returns the instance of the database.
 */
public static function getConnection(){
    return self::getInstance()->db;
}


/**
 * Closes connection. No need to close until window is being closed.
 */
public static function closeConnection(){
    if (! is_null(self::getInstance()->db)){
        self::getInstance()->db->close();
        self::getInstance()->db = null;
        }
    }
}