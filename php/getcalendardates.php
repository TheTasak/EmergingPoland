<?php
  require_once("sql_functions.php");
  $sqli = sql_open();

	$myquery = "SELECT nazwa, data FROM `daty`;";
  $stock = sql_getdataarray($sqli, $myquery);
  $data = array();
  for($i = 0; $i < count($stock); $i++) {
    $obj = new stdClass();
    $obj->{"name"} = $stock[$i]["nazwa"];
    $obj->{"date"} = $stock[$i]["data"];
    $data[] = $obj;
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
