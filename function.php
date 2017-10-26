<?php function connectDB() {
	return new PDO('mysql:host=localhost;dbname=sail;charset=utf8mb4', 'sail', 'HMRwnVRMjFG6vc2q');
}

function getPerson($event) {
	$db = connectDB();
	$query = $db->prepare("SELECT person.IDPERSON, person.FIRSTNAME, person.LASTNAME, job.IDJOB, job.TITLE, boat.IDBOAT
							FROM person
							LEFT JOIN boat
							ON boat.IDBOAT = person.FIBOAT
							INNER JOIN job
							ON job.IDJOB = person.FIJOB
							WHERE person.FIEVENT = ?
							ORDER BY POSITION, FIRSTNAME, LASTNAME"); //  or 1=1 check error message
	$query->execute(array($event));
	$row = $query->fetchAll(PDO::FETCH_ASSOC);

	return $row;
}

function getJob() {
	$db = connectDB();
	$query = $db->prepare("SELECT IDJOB, TITLE, SYMBOL
							FROM job");
	$query->execute();
	$row = $query->fetchAll(PDO::FETCH_ASSOC);

	return $row;
}

function getBoat($event) {
	$db = connectDB();
	$query = $db->prepare("SELECT job.IDJOB, job.TITLE, job.SYMBOL, boat.IDBOAT, boat.NAME, capacity.CAPACITY
							FROM boat
							INNER JOIN capacity
							ON capacity.FIBOAT = boat.IDBOAT
							INNER JOIN job
							ON job.IDJOB = capacity.FIJOB
							WHERE boat.FIEVENT = ?");

	$query->execute(array($event));
	$row = $query->fetchAll(PDO::FETCH_ASSOC);

	$return = Array();
	foreach ($row as $value) {
		$return[$value["IDBOAT"]][] = $value;
	}

	return $return;
}


function getEvent() {
	$db = connectDB();
	$query = $db->prepare("SELECT IDEVENT, NAME, `DATE`
							FROM event
							ORDER BY `DATE` DESC");
	$query->execute();
	$row = $query->fetchAll(PDO::FETCH_ASSOC);

	$query = $db->prepare("SELECT COUNT(*) as count
							FROM person, boat, event
							WHERE IDEVENT = boat.FIEVENT
							AND IDEVENT = person.FIEVENT
							AND IDEVENT = ?");

	foreach ($row as $key => $value) {
		$query->execute(array($row[$key]["IDEVENT"]));
		$r = $query->fetch(PDO::FETCH_ASSOC);
		$row[$key]["OBJECT"] = $r["count"];
	}
	return $row;
}

function getEventName($i) {
	$db = connectDB();
	$query = $db->prepare("SELECT NAME, `DATE`
							FROM event
							WHERE IDEVENT=?");
	$query->execute(array($i));
	$r = $query->fetch(PDO::FETCH_ASSOC);

	return $r;
}

function getReport($event) {
	$db = connectDB();
	$query = $db->prepare("SELECT FIRSTNAME, LASTNAME, TITLE, NAME
							FROM person, job, boat
							WHERE IDJOB = FIJOB
							AND IDBOAT = FIBOAT
							AND person.FIEVENT = ?
							ORDER BY IDJOB ASC");
	$query->execute(array($event));
	$row = $query->fetchAll(PDO::FETCH_ASSOC);

	$return = array();
	foreach ($row as $key => $value) {
		$n = utf8_decode($value["NAME"]);
		unset($value["NAME"]);
		foreach ($value as $k => $v) {
			$value[$k] = utf8_decode($v);
		}

		$return[$n][] = $value;
	}

	return $return;
}

function setPersonToBoat($idperson, $idboat, $event) {
	$db = connectDB();

	if($idboat != null) {

		// Check if boat is has place for job
		$query = $db->prepare("SELECT  CAPACITY - (SELECT COUNT(*)
													FROM person
													WHERE FIJOB=(SELECT FIJOB
																FROM person
																WHERE IDPERSON=?)
													AND FIBOAT=?) AS a
								FROM capacity
								WHERE FIBOAT=?
								AND FIJOB=(SELECT FIJOB
											FROM person
											WHERE IDPERSON=?)");
		$query->execute(array($idperson, $idboat, $idboat, $idperson));
		$row = $query->fetch(PDO::FETCH_ASSOC);
		if($row["a"] <= 0) {
			return 10;
		}

		$query = $db->prepare("SELECT IDPERSON
								FROM person
								WHERE IDPERSON = ?
								AND FIEVENT = ?");
		$query->execute(array($idperson, $event));
		if($query->rowCount() == 0) {
			return 11;
		}
	}


	$query = $db->prepare("UPDATE person
							SET FIBOAT=?
							WHERE IDPERSON=?");
	return $query->execute(array($idboat, $idperson));
}

function updateUser($i, $value) {
	$allowUpdate = array("FIRSTNAME", "LASTNAME");
	$u = explode("-", $i);

	if( !in_array($u[0], $allowUpdate)) return false;

	$db = connectDB();

	$query = $db->prepare("UPDATE person
							SET ".$u[0]."=?
							WHERE IDPERSON=?");
	if($query->execute(array($value, $u[1]))) return $value;
}

function updateBoat($i, $value) {
	$allowUpdate = array("NAME");
	$u = explode("-", $i);

	if( !in_array($u[0], $allowUpdate)) return false;

	$db = connectDB();

	$query = $db->prepare("UPDATE boat
							SET ".$u[0]."=?
							WHERE IDBOAT=?");
	if($query->execute(array($value, $u[1]))) return $value;
}

function deleteUser($id) {
	$db = connectDB();

	$query = $db->prepare("DELETE FROM person
							WHERE IDPERSON=?");
	return ($query->execute(array($id)))?true:20;
}

function deleteBoat($id) {
	$db = connectDB();

	$query = $db->prepare("DELETE FROM boat
							WHERE IDBOAT=?");
	return ($query->execute(array($id)))?true:21;
}

function deleteEvent($id) {
	$db = connectDB();

	$query = $db->prepare("DELETE FROM event
							WHERE IDEVENT=?");
	return ($query->execute(array($id)))?true:22;
}

function addUser($firstname, $lastname, $job, $event) {

	if(empty($firstname) || empty($lastname)) return 53;

	$db = connectDB();
	$query = $db->prepare("INSERT INTO person (FIRSTNAME, LASTNAME, FIJOB, FIEVENT)
							VALUES (?, ?, ?, ?);");

	return ($query->execute(array($firstname, $lastname, $job, $event)))?true:52;
}

function addBoat($name, $capacity, $event) {

	if(empty($name)) return 54;

	$db = connectDB();
	$query = $db->prepare("INSERT INTO boat (NAME, FIEVENT)
							VALUES (?, ?);");

	if(!$query->execute(array($name, $event))) return 50;

	$lastid = $db->lastInsertId();

	$query = $db->prepare("INSERT INTO capacity (FIBOAT, FIJOB, CAPACITY)
								VALUES (?, ?, ?)");

	foreach ($capacity as $key => $value) {
		if(!$query->execute(array($lastid, $key, $value))) return 51;
	}

	return true;
}

function addEvent($name, $date) {
	$db = connectDB();
	$query = $db->prepare("INSERT INTO event (NAME, `DATE`)
							VALUES (?, ?)");

	return ($query->execute(array($name, date_german2mysql($date))))?true:53;
}

function date_german2mysql($date) {
    $d    =    explode(".",$date);

    return    sprintf("%04d-%02d-%02d", $d[2], $d[1], $d[0]);
}

function date_mysql2german($date) {
    $d    =    explode("-",$date);

    return    sprintf("%02d.%02d.%04d", $d[2], $d[1], $d[0]);
}

?>
