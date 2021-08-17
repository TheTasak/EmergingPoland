<?php
    require_once("sql_functions.php");

    if(isset($_GET['stock_name'])){
      $stock_name = $_GET['stock_name'];
    }

  	$sqli = sql_open();

  	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
  	$stock_value = $stock["idspolki"];

    $data = array();
	  $myquery = "SELECT * FROM `dywidenda` WHERE idspolki='{$stock_value}';";
    $data = sql_getdataarray($sqli, $myquery);
    for($i = 0; $i < count($data); $i++) {
      $object = new stdClass();
      $object->{"year"} = $data[$i]["wyplata_za_rok"];
      if(isset($data[$i]["cena_akcji"])) {
        $myquery = "SELECT * FROM `obecnie_cena` WHERE idspolki='{$stock_value}';";
        $price = sql_getdatarecord($sqli, $myquery);
        $object->{"stock_price"} = $price["cena"];
      } else {
        $object->{"stock_price"} = $data[$i]["cena_akcji"];
      }
      $object->{"value"} = $data[$i]["dywidenda"];
      $object->{"exchange_rate"} = $data[$i]["mnoznik"];

      $year = $object->{"year"};
      $myquery = "SELECT * FROM `{$year}_akcje` WHERE spolka='{$stock_value}' AND osoba='lacznie';";
      $stocks_count = sql_getdatarecord($sqli, $myquery);
      if(isset($stocks_count)) {
        $object->{"stocks"} = $stocks_count[$year . "_akcje"];
      }
      $myquery = "SELECT * FROM `{$year}_dane` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='zysk_netto';";
      $stocks_count = sql_getdatarecord($sqli, $myquery);
      $object->{"earnings"} = $stocks_count[$year]*1000;
      $data[$i] = $object;
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
