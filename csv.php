<?php 
header('Content-Type: application/json');
require_once("function.php");

if($_GET["add"] === "user") {
	
	$event = $_GET["event"];
	$status = true;

	unset($_GET["add"]);
	unset($_GET["event"]);

	$db = connectDB();
	$query = $db->prepare("INSERT INTO person (LASTNAME, FIRSTNAME, FIEVENT, FIJOB)
							VALUES (?, ?, ?,(SELECT IDJOB
											 FROM job
											 WHERE TITLE=?))");

	foreach ($_GET as $key => $value) {
		if(!$query->execute(array($value["Lastname"], $value["Firstname"], $event, $value["Job"]))) $status = 110;
	}
	echo $status;
}

?>