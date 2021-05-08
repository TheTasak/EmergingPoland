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

	$myquery = "SELECT `{$date}`, kraje FROM `{$date}_kraje` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  for($i = 0; $i < count($data); $i++) {
    $myquery = "SELECT strona, {$language} FROM `tlumaczenie_kraje` WHERE baza='{$data[$i]["kraje"]}';";
    $country = sql_getdatarecord($sqli, $myquery);

    $data[$i] = (object)[
        'country' => $country["strona"],
        'value' => intval($data[$i][$date]),
        'translate' => $country[$language],
    ];
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>