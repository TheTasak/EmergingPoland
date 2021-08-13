<?php
  require_once("sql_functions.php");
  $sqli = sql_open();

	$myquery = "SELECT nazwa, data, kolor FROM `daty`;";
  $stock = sql_getdataarray($sqli, $myquery);
  $data = array();
  for($i = 0; $i < count($stock); $i++) {
    $obj = new stdClass();
    $obj->{"name"} = $stock[$i]["nazwa"];
    $obj->{"date"} = $stock[$i]["data"];
    $obj->{"color"} = $stock[$i]["kolor"];
    $data[] = $obj;
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
