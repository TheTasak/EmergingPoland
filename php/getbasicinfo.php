<?php
    require_once("sql_functions.php");

    if(isset($_GET['stock_name'])){
      $stock_name = $_GET['stock_name'];
    }
    if(isset($_GET['year'])){
      $year = $_GET['year'];
    }
    if(isset($_GET['lang'])){
      $lang = $_GET['lang'];
    }
  	$sqli = sql_open();

  	$myquery = "SELECT idspolki, ticket, indeks, ISIN, branza, data_debiutu FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
    $data = new stdClass();
    $data->{"name"} = ucfirst($stock_name);
    $data->{"ticket"} = $stock["ticket"];
    $data->{"index"} = $stock["indeks"];
    $data->{"ISIN"} = $stock["ISIN"];
    $data->{"debut_date"} = $stock["data_debiutu"];

    $myquery = "SELECT * FROM `branże` WHERE baza='{$stock["branza"]}';";
    $translate = sql_getdatarecord($sqli, $myquery);
    if(null !== $translate)
      $data->{"industry"} = $translate[$lang];
    else
      $data->{"industry"} = $stock["branza"];

  	$stock_value = $stock["idspolki"];
    $stocks_count = null;
    $stocks_price = null;
    $year_akcje = $year;
    while($stocks_count == null) {
      $myquery = "SELECT * FROM `{$year_akcje}_akcje` WHERE spolka='{$stock_value}' AND osoba='lacznie';";
      $stocks_count = sql_getdatarecord($sqli, $myquery);
      $year_akcje--;
    }
    $myquery = "SELECT * FROM `{$year}_kurs_akcji` WHERE spolka='{$stock_value}';";
    $stocks_price = sql_getdatarecord($sqli, $myquery);
    $quarter_kurs = 4;
    while($stocks_price[$year . "_" . $quarter_kurs] == null)
    {
      $quarter_kurs--;
    }
    $data->{"capitalization"} = $stocks_count[$year_akcje+1 . "_akcje"] * $stocks_price[$year . "_" . $quarter_kurs];
    echo json_encode($data);
    mysqli_close($sqli);
?>
