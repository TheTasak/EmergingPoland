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

	$myquery = "SELECT *, kraje FROM `{$date}_kraje` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  for($i = 0; $i < count($data); $i++) {
    $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$data[$i]["kraje"]}';";
    $country = sql_getdatarecord($sqli, $myquery);
    $data[$i] = (object)[
        'country' => array($country["strona"]),
        'year' => intval($data[$i][$date]),
        'quarter1' => intval($data[$i][$date . "_1"]),
        'quarter2' => intval($data[$i][$date . "_2"]),
        'quarter3' => intval($data[$i][$date . "_3"]),
        'quarter4' => intval($data[$i][$date . "_4"]),
        'translate' => $country[$language],
        'name' => $country["baza"],
    ];
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
