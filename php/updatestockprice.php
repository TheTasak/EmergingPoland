<?php
  require_once("sql_functions.php");
  $sqli = sql_open();

  $data = file_get_contents("https://docs.google.com/spreadsheets/d/e/2PACX-1vRsSHWEIigID-wNUx-OtyJpfOQ0feIoRRg8mbUe36AMgMgamWrQ45gC-u0t4ADubVYgSTEE5xg4QYmw/pub?output=csv");
  $rows = explode("\n",$data);
  $data_array = array();
  foreach($rows as $row) {
  	$data_array[] = str_getcsv($row);
  }
  for($i = 1; $i < count($data_array); $i++) {
	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$data_array[$i][0]}';";
	$stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);
	$price = $data_array[$i][3];
	$price = str_replace(',', '.', $price);
	$myquery = "UPDATE obecnie_cena SET cena='{$price}' WHERE idspolki='{$stock_value}';";
	$data = sql_updaterecord($sqli, $myquery);
  }
  mysqli_close($sqli);
?>

