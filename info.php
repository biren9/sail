<?php
header('Content-Type: application/json');
require_once("function.php");
//sleep(3);
if(isset($_GET["get"])) {
	$get = $_GET["get"];
	$event = $_GET["event"];
	if($get === "init") {
		echo json_encode(array("boat" => getBoat($event), "person" => getPerson($event), "eventinfo" => getEventName($event)));
	}
	else if($get === "event") {
		echo json_encode(getEvent());
	}
	else if($get === "user") {
		echo json_encode(getPerson($event));
	}
	else if($get === "boat") {
		echo json_encode(getBoat($event));
	}
	else if($get === "job") {
		echo json_encode(getJob());
	}
}
else if(isset($_GET["set"]) && isset($_GET["boat"]) && isset($_GET["person"]) && isset($_GET["event"])) {
	echo json_encode(setPersonToBoat($_GET["person"], empty($_GET["boat"])?null:$_GET["boat"], $_GET["event"]));
}

else if(isset($_GET["update"]) && isset($_POST["value"]) && isset($_POST["id"])) {
	if($_GET["update"] === "user" ) {
		echo updateUser($_POST["id"], $_POST["value"]);
	}
	else if($_GET["update"] === "boat" ) {
		echo updateBoat($_POST["id"], $_POST["value"]);
	}
}

else if(isset($_GET["delete"]) && isset($_GET["id"])) {
	if($_GET["delete"] === "user") {
		echo deleteUser($_GET["id"]);
	}
	else if($_GET["delete"] === "boat") {
		echo deleteBoat($_GET["id"]);
	}
	else if ($_GET["delete"] === "event") {
		echo deleteEvent($_GET["id"]);
	}
}

else if(isset($_GET["add"])) {
	if($_GET["add"] === "user") {
		echo addUser($_GET["firstname"], $_GET["lastname"], $_GET["job"], $_GET["event"]);
	}
	else if($_GET["add"] === "boat") {
		echo addBoat($_GET["name"], $_GET["job"], $_GET["event"]);
	}
	else if ($_GET["add"] === "event") {
		echo addEvent($_GET["name"], $_GET["date"]);
	}
}


?>
