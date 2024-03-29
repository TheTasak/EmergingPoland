<?php
  require_once("sql_functions.php");

	if(isset($_GET['stock_name'])){
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['year'])){
		$year = $_GET['year'];
	}
  if(isset($_GET['lang'])){
		$lang = $_GET['lang'];
	} else {
    $lang = "pl";
  }
  $sqli = sql_open();

	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = $stock["idspolki"];

	$myquery = "SELECT dane_ksiegowe FROM `{$year}_dane` WHERE idspolki='{$stock_value}';";
  $rachunek_data = sql_getdataarray($sqli, $myquery);

  $myquery = "SELECT dane_ksiegowe FROM `{$year}_dane_bilans` WHERE idspolki='{$stock_value}';";
  $bilans_data = sql_getdataarray($sqli, $myquery);
  $data = array_merge($rachunek_data, $bilans_data);

  $translate_data = array();
  for($i = 0; $i < count($data); $i++){
    $temp = $data[$i]["dane_ksiegowe"];
  	$myquery = "SELECT $lang FROM tlumaczenie WHERE baza='{$temp}';";

    $translate = sql_getdatarecord($sqli, $myquery);
    if(is_null($translate)) {
      $translate = $data[$i];
    }
    $object = new stdClass();
    $object->{"dane_ksiegowe"} = $data[$i]["dane_ksiegowe"];
    if(isset($translate[$lang])){
      $object->{"tlumaczenie"} = $translate[$lang];
    } else {
      $object->{"tlumaczenie"} = $data[$i]["dane_ksiegowe"];
    }
    $translate_data[] = $object;
  }
  echo json_encode($translate_data);
  mysqli_close($sqli);
?>
