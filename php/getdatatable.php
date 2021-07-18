<?php
    require_once("sql_functions.php");

    if(isset($_GET['stock_name'])){
      $stock_name = $_GET['stock_name'];
    }
    if(isset($_GET['start_year'])){
      $start_year = $_GET['start_year'];
    }
    if(isset($_GET['end_year'])){
      $end_year = $_GET['end_year'];
    }
    if(isset($_GET['lang'])){
      $lang = $_GET['lang'];
    }
    if(isset($_GET['type'])){
      $type = $_GET['type'];
    }
  	$sqli = sql_open();

  	$myquery = "SELECT idspolki, waluta, ostatnie_sprawozdanie FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
    $stock_value = $stock["idspolki"];

    $data = [];
    if($type == "rachunek") {
      $myquery = "SELECT DISTINCT dane_ksiegowe FROM `{$start_year}_dane` WHERE idspolki='{$stock_value}';";
      $temp = sql_getdataarray($sqli, $myquery);
    } else if($type == "bilans") {
      $myquery = "SELECT DISTINCT dane_ksiegowe FROM `{$start_year}_dane_bilans` WHERE idspolki='{$stock_value}';";
      $temp = sql_getdataarray($sqli, $myquery);
    }
    $object = new stdClass();
    for($j = 0; $j < $end_year - $start_year + 1; $j++) {
      $year = $start_year + $j;
      $first_quarter = "{$year}" . "_1";
      $second_quarter = "{$year}" . "_2";
      $third_quarter = "{$year}" . "_3";
      $forth_quarter = "{$year}" . "_4";
      $object->{$year} = $year;
      $object->{$first_quarter} = $first_quarter;
      $object->{$second_quarter} = $second_quarter;
      $object->{$third_quarter} = $third_quarter;
      $object->{$forth_quarter} = $forth_quarter;
    }
    $object->{"name"} = "";
    $object->{"translate"} = "";
    $data[] = $object;
    for($i = 0; $i < count($temp); $i++) {
      $column = $temp[$i]["dane_ksiegowe"];
      $object = new stdClass();
      for($j = 0; $j < $end_year - $start_year + 1; $j++) {
        $year = $start_year + $j;
        $first_quarter = "{$year}" . "_1";
        $second_quarter = "{$year}" . "_2";
        $third_quarter = "{$year}" . "_3";
        $forth_quarter = "{$year}" . "_4";

        $myquery = "SELECT * FROM `{$year}_dane` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='{$column}';";
        $row = sql_getdatarecord($sqli, $myquery);

        $myquery = "SELECT * FROM `{$year}_dane_bilans` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='{$column}';";
        $bilans_row = sql_getdatarecord($sqli, $myquery);
        if(null !== $row) {
          if(null !== $row[$year]) {
            $object->{$year} = $row[$year];
          }
          if(null !== $row[$first_quarter]) {
            $object->{$first_quarter} = $row[$first_quarter];
          }
          if(null !== $row[$second_quarter]) {
            $object->{$second_quarter} = $row[$second_quarter];
          }
          if(null !== $row[$third_quarter]) {
            $object->{$third_quarter} = $row[$third_quarter];
          }
          if(null !== $row[$forth_quarter]) {
            $object->{$forth_quarter} = $row[$forth_quarter];
          }
        } else if(null !== $bilans_row){
          if(null !== $bilans_row[$year]) {
            $object->{$year} = $bilans_row[$year];
          }
          if(null !== $bilans_row[$first_quarter]) {
            $object->{$first_quarter} = $bilans_row[$first_quarter];
          }
          if(null !== $bilans_row[$second_quarter]) {
            $object->{$second_quarter} = $bilans_row[$second_quarter];
          }
          if(null !== $bilans_row[$third_quarter]) {
            $object->{$third_quarter} = $bilans_row[$third_quarter];
          }
          if(null !== $bilans_row[$forth_quarter]) {
            $object->{$forth_quarter} = $bilans_row[$forth_quarter];
          }
        }
      }
      $object->{"name"} = $column;
      $myquery = "SELECT * FROM `tlumaczenie` WHERE baza='{$column}';";
      $translate = sql_getdatarecord($sqli, $myquery);
      if(null !== $translate) {
        $object->{"translate"} = $translate[$lang];
      } else {
        $object->{"translate"} = $column;
      }
      $data[] = $object;
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
