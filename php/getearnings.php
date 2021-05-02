<?php
  require_once("sql_functions.php");
	if(isset($_GET['stock_name'])) {
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['date'])) {
		$date = $_GET['date'];
	}
  if(isset($_GET['lang'])) {
		$language = $_GET['lang'];
	}

  $sqli = sql_open();
	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = reset($stock);

	$myquery = "SELECT `{$date}`, sposoby_uzyskania_przychodu  FROM `{$date}_podzial_przychodow` WHERE idspolki='{$stock_value}';";
  $data = sql_getdataarray($sqli, $myquery);

  $translate_data = array();
  for($i = 0; $i < count($data); $i++){
    $temp = $data[$i]["sposoby_uzyskania_przychodu"];

    $myquery = "SELECT {$language} FROM `tlumaczenie` WHERE baza='{$temp}';";
    $translate = sql_getdatarecord($sqli, $myquery);

    if(null !== $translate){
      $translate = reset($translate);
    }
    else{
      $translate = $data[$i]['sposoby_uzyskania_przychodu'];
    }

    $translate_data[$i] = (object)[
        'name' => $data[$i]['sposoby_uzyskania_przychodu'],
        'value' => intval($data[$i][$date]),
        'translate' => $translate,
    ];
  }
    echo json_encode($translate_data);
    mysqli_close($sqli);
?>
