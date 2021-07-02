<?php
    require_once("sql_functions.php");

    if(isset($_GET['index'])){
      $index = $_GET['index'];
    }

  	$sqli = sql_open();

  	$myquery = "SELECT ostatnie_sprawozdanie, waluta, branza, idspolki FROM `spis` WHERE indeks='{$index}';";
    $stocks = sql_getdataarray($sqli, $myquery);
    $array = [];
    for($i = 0; $i < count($stocks); $i++) {
      $object = new stdClass();

      $date = explode("_", $stocks[$i]["ostatnie_sprawozdanie"]);
      $sum = 0;
      $new_quarter = $date[1];
      $new_year = $date[0];

      $waluta = $stocks[$i]["waluta"];
      if($waluta != "PLN") {
        $myquery = "SELECT * FROM `{$new_year}_kurs_walut` WHERE para_walutowa='{$waluta}/PLN';";
        $currency = sql_getdatarecord($sqli, $myquery);
        if(null !== $currency) {
          $currency = $currency[$new_year . "_" . $new_quarter];
        } else {
          $currency = 1;
        }
      } else {
        $currency = 1;
      }
      for($j = 0; $j < 4; $j++) {
        $myquery = "SELECT * FROM `{$new_year}_dane` WHERE idspolki='{$stocks[$i]["idspolki"]}' AND dane_ksiegowe='zysk_netto';";
        $earnings = sql_getdatarecord($sqli, $myquery);
        if(null !== $earnings) {
          $earnings = $earnings[$new_year . "_" . $new_quarter];
        } else {
          $earnings = 0;
        }
        $sum += $earnings;
        $new_quarter--;
        if($new_quarter <= 0) {
          $new_year--;
          $new_quarter = 4;
        }
      }
      $myquery = "SELECT * FROM `branże` WHERE baza='{$stocks[$i]["branza"]}';";
      $translate = sql_getdatarecord($sqli, $myquery);
      if(null !== $translate) {
        $object->{"name"} = $translate["pl"];
      } else {
        $object->{"name"} = $stocks[$i]["branza"];
      }
      $object->{"value"} = $sum * 1000 * $currency;
      $array[] = $object;
    }
    $data = [];
    for($i = 0; $i < count($array); $i++) {
      $object = new stdClass();
      $name = $array[$i]->{"name"};
      $object->{"name"} = $name;
      $object->{"value"} = $array[$i]->{"value"};
      for($j = $i+1; $j < count($array); $j++) {
        if($array[$j]->{"name"} == $name) {
          $object->{"value"} += $array[$j]->{"value"};
          $array[$j]->{"name"} = "";
        }
      }
      $data[] = $object;
    }
    $len = count($data);
    for($i = 0; $i < $len; $i++) {
      if($data[$i]->{"name"} == "") {
        unset($data[$i]);
      }
    }
    $data = array_values($data);
    echo json_encode($data);
    mysqli_close($sqli);
?>
