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
    } else {
      $lang = "pl";
    }
  	$sqli = sql_open();

  	$myquery = "SELECT idspolki, ticket, indeks, ISIN, branza, data_debiutu FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
    $data = new stdClass();
    $data->{"name"} = ucfirst($stock_name);
    $data->{"ticket"} = $stock["ticket"];
    $data->{"index"} = $stock["indeks"];
    $data->{"ISIN"} = $stock["ISIN"];
    $data->{"debut_date"} = new DateTime($stock["data_debiutu"]);
    $data->{"debut_date"} = $data->{"debut_date"}->format('d/m/Y');

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
    $myquery = "SELECT * FROM `obecnie_cena` WHERE idspolki='{$stock_value}';";
    $stocks_price = sql_getdatarecord($sqli, $myquery);
    if(null !== $stocks_price) {
      $data->{"price"} = $stocks_price["cena"];
      $data->{"capitalization"} = $stocks_count[$year_akcje+1 . "_akcje"] * $stocks_price["cena"];
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
