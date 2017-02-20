<?php
require_once("function.php");
require('fpdf.php');

if(!isset($_GET["event"])) die("");
$event = $_GET["event"];

class PDF extends FPDF {
	// Load data

	// Simple table
	function BasicTable($header, $data)
	{
	    // Header
	    $this->SetFont('Arial','B',14);
	    foreach($header as $col)
	        $this->Cell(63,7,$col,1);
	    $this->Ln();
	    // Data
	    $this->SetFont('Arial','',14);
	    foreach($data as $row)
	    {
	        foreach($row as $col)
	            $this->Cell(63,6,$col,1);
	        $this->Ln();
	    }
	}
}

$pdf = new PDF();

$header = array('Firstname', 'Lastname', 'Job');
// Data loading
$data = getReport($event);
$pdf->SetFont('Arial','',14);
foreach ($data as $key => $value) {
	$pdf->AddPage();
	$pdf->SetFont('Arial','B',16);
	$pdf->Cell(40,10, $key);
	$pdf->setY(20);
	$pdf->SetFont('Arial','',14);
	$pdf->BasicTable($header,$value);
}
$pdf->Output();
?>