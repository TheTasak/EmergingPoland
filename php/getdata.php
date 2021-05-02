<?php
    require_once("sql_functions.php");
    if(isset($_GET['data_index'])){
		$data_index = $_GET['data_index'];
    }
  	if(isset($_GET['stock_name'])){
  		$stock_name = $_GET['stock_name'];
  	}
    if(isset($_GET['year'])){
  		$year = $_GET['year'];
  	}
  	$sqli = sql_open();

  	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
  	$stock_value = reset($stock);

    $data = array();
  	$i = 0;
  	for($i = 0; $i <= (2020 - $year); $i++) {
		  $date = ($year+$i);

  		$myquery = "SELECT * FROM `{$date}_dane` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='{$data_index}';";
  		$row = sql_getdatarecord($sqli, $myquery);
  		$data[$i] = $row["{$date}"];
	  }
    echo json_encode($data);
    mysqli_close($sqli);
?>
