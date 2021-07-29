<?php
  require_once("sql_functions.php");
	if(isset($_GET['stock_name'])) {
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['start_year'])) {
		$start_year = $_GET['start_year'];
	}
  if(isset($_GET['end_year'])) {
		$end_year = $_GET['end_year'];
	}
  if(isset($_GET['lang'])) {
    $lang = $_GET['lang'];
  }
	$sqli = sql_open();

	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = $stock["idspolki"];
  $data = new stdClass();
  for($year = $start_year; $year <= $end_year; $year++) {
    $myquery = "SELECT * FROM `{$year}_inne` WHERE idspolki='{$stock_value}';";
    $year_data = sql_getdataarray($sqli, $myquery);
    for($i = 0; $i < count($year_data); $i++) {
      if(null !== $year_data[$i][$year]) {
        if(property_exists($data, $year_data[$i]["informacje"]) == false) {
          $obj = array();
          $data->{$year_data[$i]["informacje"]} = $obj;
        }
        $obj = new stdClass();
        $obj->{"year"} = intval($year);
        $obj->{"value"} = $year_data[$i][$year];

        $myquery = "SELECT * FROM `tlumaczenie` WHERE baza='{$year_data[$i]["informacje"]}';";
        $translate = sql_getdatarecord($sqli, $myquery);
        if(null == $translate) {
          $translate = $year_data[$i]["informacje"];
        } else {
          $translate = $translate[$lang];
        }
        $obj->{"name"} = $translate;
        $data->{$year_data[$i]["informacje"]}[] = $obj;
      }
    }
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
