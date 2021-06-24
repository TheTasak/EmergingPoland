<?php
  require_once("sql_functions.php");
	if(isset($_GET['stock_name'])) {
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['date'])) {
		$date = $_GET['date'];
	}
  if(isset($_GET['lang'])) {
		$language = $_GET['lang'];
	}

  $sqli = sql_open();
	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);

	$myquery = "SELECT * FROM `{$date}_podzial_przychodow` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  $translate_data = array();
  for($i = 0; $i < count($data); $i++){
    $temp = $data[$i]["sposoby_uzyskania_przychodu"];

    $myquery = "SELECT {$language} FROM `tlumaczenie` WHERE baza='{$temp}';";
    $translate = sql_getdatarecord($sqli, $myquery);

    if(null !== $translate){
      $translate = reset($translate);
    }
    else{
      $translate = $data[$i]['sposoby_uzyskania_przychodu'];
    }
    $object = new stdClass();
    $object->{"name"} = $data[$i]['sposoby_uzyskania_przychodu'];
    $object->{"translate"} = $translate;
    if(null !== $data[$i][$date . "_1"]) {
      $object->{"quarter1"} = $data[$i][$date . "_1"];
    }
    if(null !== $data[$i][$date . "_2"]) {
      $object->{"quarter2"} = $data[$i][$date . "_2"];
    }
    if(null !== $data[$i][$date . "_3"]) {
      $object->{"quarter3"} = $data[$i][$date . "_3"];
    }
    if(null !== $data[$i][$date . "_4"]) {
      $object->{"quarter4"} = $data[$i][$date . "_4"];
    }
    if(null !== $data[$i][$date]) {
      $object->{"year"} = $data[$i][$date];
    }
    $translate_data[$i] = $object;
  }
    echo json_encode($translate_data);
    mysqli_close($sqli);
?>
