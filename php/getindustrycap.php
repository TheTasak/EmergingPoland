<?php
    require_once("sql_functions.php");

    if(isset($_GET['index'])){
      $index = $_GET['index'];
    }

  	$sqli = sql_open();

  	$myquery = "SELECT branza, idspolki FROM `spis` WHERE indeks='{$index}';";
    $stocks = sql_getdataarray($sqli, $myquery);
    $array = [];
    for($i = 0; $i < count($stocks); $i++) {
      $object = new stdClass();
      $myquery = "SELECT * FROM `obecnie_cena` WHERE idspolki='{$stocks[$i]["idspolki"]}';";
      $price = sql_getdatarecord($sqli, $myquery);
      if(null !== $price) {
        $price = $price["cena"];
      } else {
        $price = 0;
      }
      $myquery = "SELECT * FROM `obecnie_akcje` WHERE spolka='{$stocks[$i]["idspolki"]}' AND osoba='lacznie';";
      $stocks_count = sql_getdatarecord($sqli, $myquery);
      if(null !== $stocks_count) {
        $stocks_count = $stocks_count["obecnie_akcje"];
      } else {
        $stocks_count = 0;
      }
      $myquery = "SELECT * FROM `branże` WHERE baza='{$stocks[$i]["branza"]}';";
      $translate = sql_getdatarecord($sqli, $myquery);
      if(null !== $translate) {
        $object->{"name"} = $translate["pl"];
      } else {
        $object->{"name"} = $stocks[$i]["branza"];
      }
      $object->{"value"} = $price * $stocks_count;
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
