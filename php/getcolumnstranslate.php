<?php
  require_once("sql_functions.php");
	if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['year']))
	{
		$year = $_GET['year'];
	}
  if(isset($_GET['lang']))
	{
		$lang = $_GET['lang'];
	}
  $sqli = sql_open();

	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);

	$myquery = "SELECT dane_ksiegowe FROM `{$year}_dane` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  $translate_data = array();
  for($i = 0; $i < count($data); $i++){
    $temp = reset($data[$i]);
  	$myquery = "SELECT `{$lang}` FROM tlumaczenie WHERE baza='{$temp}';";

    $translate = sql_getdatarecord($sqli, $myquery);
    $translate_data[$i] = (object)[
      "dane_ksiegowe" => reset($data[$i]),
      "tlumaczenie" => reset($translate),
    ];
  }
    echo json_encode($translate_data);
    mysqli_close($sqli);
?>
