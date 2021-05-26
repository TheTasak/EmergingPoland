<?php
    require_once("sql_functions.php");

    if(isset($_GET['stock_name'])){
      $stock_name = $_GET['stock_name'];
    }
    if(isset($_GET['year'])){
      $year = $_GET['year'];
    }

  	$sqli = sql_open();

  	$myquery = "SELECT idspolki, ticket, indeks, ISIN FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
    $data = new stdClass();
    $data->{"name"} = ucfirst($stock_name);
    $data->{"ticket"} = $stock["ticket"];
    $data->{"index"} = $stock["indeks"];
    $data->{"ISIN"} = $stock["ISIN"];

  	$stock_value = $stock["idspolki"];

    $myquery = "SELECT * FROM `{$year}_akcje` WHERE spolka='{$stock_value}' AND osoba='lacznie';";
    $stocks_count = sql_getdatarecord($sqli, $myquery);
    $myquery = "SELECT * FROM `{$year}_kurs_akcji` WHERE spolka='{$stock_value}';";
    $stocks_price = sql_getdatarecord($sqli, $myquery);
    $data->{"capitalization"} = $stocks_count[$year . "_akcje"] * $stocks_price[$year];
    echo json_encode($data);
    mysqli_close($sqli);
?>
