<?php
  require_once("sql_functions.php");
  $sqli = sql_open();
	if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
	if(isset($_GET['date']))
	{
		$date = $_GET['date'];
	}
  if(isset($_GET['lang']))
	{
		$language = $_GET['lang'];
	}
	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);

	$myquery = "SELECT * FROM `{$date}_kraje` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  for($i = 0; $i < count($data); $i++) {
    $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$data[$i]["kraje"]}';";
    $country = sql_getdatarecord($sqli, $myquery);
    $object = new stdClass();
    $object->{"country"} = array($country["strona"]);
    $object->{"name"} = $country["baza"];
    $object->{"translate"} = $country[$language];
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
    $data[$i] = $object;
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
