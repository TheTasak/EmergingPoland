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

	$myquery = "SELECT `{$date}`, regiony FROM `{$date}_regiony` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);
  for($i = 0; $i < count($data); $i++) {
    $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$data[$i]["regiony"]}';";
    $country = sql_getdatarecord($sqli, $myquery);
    $country_arr = explode(",", $country["strona"]);
    $data[$i] = (object)[
        'country' => $country_arr,
        'value' => intval($data[$i][$date]),
        'translate' => $country[$language],
    ];
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
