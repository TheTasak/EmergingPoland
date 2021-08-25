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
	}
  $sqli = sql_open();
	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = $stock["idspolki"];

	$myquery = "SELECT * FROM `{$year}_regiony` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);
  for($i = 0; $i < count($data); $i++) {
    $myquery = "SELECT baza, strona, $lang FROM `tlumaczenie_kraje` WHERE baza='{$data[$i]["regiony"]}';";
    $country = sql_getdatarecord($sqli, $myquery);
    $country_arr = explode(",", $country["strona"]);

    $obj = new stdClass();
    if(isset($data[$i][$year])) {
      $obj->{"year"} = $data[$i][$year];
    }
    if(isset($data[$i][$year . "_1"])) {
      $obj->{"quarter1"} = $data[$i][$year . "_1"];
    }
    if(isset($data[$i][$year . "_2"])) {
      $obj->{"quarter2"} = $data[$i][$year . "_2"];
    }
    if(isset($data[$i][$year . "_3"])) {
      $obj->{"quarter3"} = $data[$i][$year . "_3"];
    }
    if(isset($data[$i][$year . "_4"])) {
      $obj->{"quarter4"} = $data[$i][$year . "_4"];
    }
    $obj->{"country"} = $country_arr;
    $obj->{"translate"} = $country[$lang];
    $obj->{"name"} = $country["baza"];
    $data[$i] = $obj;
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
