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
    $year_array = array();
    $myquery = "SELECT * FROM `{$year}_podzial_przychodow` WHERE idspolki='{$stock_value}';";
    $products = sql_getdataarray($sqli, $myquery);
    for($j = 0; $j < count($products); $j++) {
      $podzial_object = new stdClass();
      $name = $products[$j]["sposoby_uzyskania_przychodu"];

      $myquery = "SELECT $lang FROM `tlumaczenie_kraje` WHERE baza='{$name}';";
      $tlumaczenie = sql_getdatarecord($sqli, $myquery);
      if(null !== $tlumaczenie) {
        $podzial_object->{"translate"} = $tlumaczenie[$lang];
      } else {
        $myquery = "SELECT $lang FROM `tlumaczenie` WHERE baza='{$name}';";
        $tlumaczenie = sql_getdatarecord($sqli, $myquery);
        if(null !== $tlumaczenie) {
          $podzial_object->{"translate"} = $tlumaczenie[$lang];
        } else {
          $podzial_object->{"translate"} = $name;
        }
      }
      $podzial_object->{"name"} = $name;
      if(null !== $products[$j][$year . "_1"]) {
        $podzial_object->{"quarter1"} = $products[$j][$year . "_1"];
      }
      if(null !== $products[$j][$year . "_2"]) {
        $podzial_object->{"quarter2"} = $products[$j][$year . "_2"];
      }
      if(null !== $products[$j][$year . "_3"]) {
        $podzial_object->{"quarter3"} = $products[$j][$year . "_3"];
      }
      if(null !== $products[$j][$year . "_4"]) {
        $podzial_object->{"quarter4"} = $products[$j][$year . "_4"];
      }
      if(null !== $products[$j][$year]) {
        $podzial_object->{"year"} = $products[$j][$year];
      }
      $podzial_object->{"year"} = $products[$j][$year];
      $year_array[] = $podzial_object;
    }
    $data->{$year} = $year_array;
  }

  echo json_encode($data);
  mysqli_close($sqli);
?>
