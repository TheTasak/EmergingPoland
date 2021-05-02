<?php
  require_once("sql_functions.php");
  
  $sqli = sql_open();

	$myquery = "SELECT spolki  FROM `spis`;";
  $data = sql_getdataarray($sqli, $myquery);
  echo json_encode($data);

  mysqli_close($sqli);
?>
