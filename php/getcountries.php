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
	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);

	$myquery = "SELECT `{$date}`, kraje FROM `{$date}_kraje` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

	$myquery = "SELECT baza, strona FROM `tlumaczenie_kraje`;";
  $countries = sql_getdataarray($sqli, $myquery);

	foreach($data as &$obj){
		foreach($obj as $tag => &$val){
			if($tag == 'kraje'){
				foreach($countries as $country){
					if(reset($country) == $val){
						$val = $country[array_keys($country)[1]];
					}
				}
			}
		}
	}
	$date_array = array_fill(0, count($data),$date);
	$data = array_map(function($obj, $dates) {
    return array(
        'country' => $obj['kraje'],
        'value' => $obj[$dates]
    );
	}, $data, $date_array);
  echo json_encode($data);
  mysqli_close($sqli);
?>
