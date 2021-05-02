<?php
  require_once("sql_functions.php");
	if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['date']))
	{
		$date = $_GET['date'];
	}
	$sqli = sql_open();

	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);

  $data = array();
	$i = 0;
	$myquery = "SELECT `{$date}_akcje`, osoba  FROM `{$date}_akcje` WHERE spolka='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  $date_array = array_fill(0, count($data),$date."_akcje");
	$data = array_map(function($obj, $dates) {
    return array(
        'name' => $obj['osoba'],
        'value' => intval($obj[$dates]),
    );
	}, $data, $date_array);
    array_shift($data);
    echo json_encode($data);
    mysqli_close($sqli);
?>
