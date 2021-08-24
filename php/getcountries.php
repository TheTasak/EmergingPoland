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

	$myquery = "SELECT * FROM `{$year}_kraje` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  for($i = 0; $i < count($data); $i++) {
    $country_name = $data[$i]["kraje"];
    $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$country_name}';";
    $country = sql_getdatarecord($sqli, $myquery);
    $object = new stdClass();
    if(isset($country["strona"])) {
      $country_arr = explode(",", $country["strona"]);
      $object->{"country"} = $country_arr;

      $object->{"name"} = $country["baza"];
      if(null !== $country[$lang]) {
        $object->{"translate"} = $country[$lang];
      } else {
        $object->{"translate"} = $country["baza"];
      }

      if(null !== $data[$i][$year . "_1"]) {
        $object->{"quarter1"} = $data[$i][$year . "_1"];
      }
      if(null !== $data[$i][$year . "_2"]) {
        $object->{"quarter2"} = $data[$i][$year . "_2"];
      }
      if(null !== $data[$i][$year . "_3"]) {
        $object->{"quarter3"} = $data[$i][$year . "_3"];
      }
      if(null !== $data[$i][$year . "_4"]) {
        $object->{"quarter4"} = $data[$i][$year . "_4"];
      }
      if(null !== $data[$i][$year]) {
        $object->{"year"} = $data[$i][$year];
      }
      $data[$i] = $object;
    }
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
