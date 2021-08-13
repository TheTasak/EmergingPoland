<?php
  require_once("sql_functions.php");

  $sqli = sql_open();

	$myquery = "SELECT DISTINCT indeks FROM `spis`;";
  $index = sql_getdataarray($sqli, $myquery);
  for($i = 0 ; $i < count($index); $i++) {
    $obj = new stdClass();
    $index_name = $index[$i]["indeks"];
    $myquery = "SELECT spolki FROM `spis` WHERE indeks='{$index_name}';";
    $index_data = sql_getdataarray($sqli, $myquery);
    $obj->{"stocks"} = $index_data;
    $obj->{"index"} = $index_name;
    $data[] = $obj;
  }
  echo json_encode($data);

  mysqli_close($sqli);
?>
