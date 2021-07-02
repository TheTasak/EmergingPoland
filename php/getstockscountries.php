<?php
  require_once("sql_functions.php");

  if(isset($_GET['index'])){
    $index = $_GET['index'];
  }
  if(isset($_GET['lang'])){
    $language = $_GET['lang'];
  }

  $sqli = sql_open();

  $myquery = "SELECT ostatnie_sprawozdanie, waluta, idspolki FROM `spis` WHERE indeks='{$index}';";
  $stocks = sql_getdataarray($sqli, $myquery);
  $array = [];
  for($i = 0; $i < count($stocks); $i++) {
    $date = explode("_", $stocks[$i]["ostatnie_sprawozdanie"]);
    $year = $date[0]-1;
    $myquery = "SELECT * FROM `{$year}_kraje` WHERE idspolki='{$stocks[$i]["idspolki"]}';";
    $countries = sql_getdataarray($sqli, $myquery);
    for($j = 0; $j < count($countries); $j++) {
      $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$countries[$j]["kraje"]}';";
      $country = sql_getdatarecord($sqli, $myquery);
      $object = new stdClass();
      if(null !== $country) {
        $object->{"country"} = array($country["strona"]);
        $object->{"name"} = $country["baza"];
        $object->{"translate"} = $country[$language];

        $waluta = $stocks[$i]["waluta"];
        if($waluta != "PLN") {
          $myquery = "SELECT * FROM `{$year}_kurs_walut` WHERE para_walutowa='{$waluta}/PLN';";
          $currency = sql_getdatarecord($sqli, $myquery);
          if(null !== $currency) {
            $currency = $currency[$year . "_" . $date[1]];
          } else {
            $currency = 1;
          }
        } else {
          $currency = 1;
        }
        $object->{"value"} = $countries[$j][$year] * $currency * 1000;
        $array[] = $object;
      }
    }
  }
  $data = [];
  for($i = 0; $i < count($array); $i++) {
    $object = new stdClass();
    $name = $array[$i]->{"name"};
    $object->{"country"} = $array[$i]->{"country"};
    $object->{"name"} = $name;
    $object->{"translate"} = $array[$i]->{"translate"};
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
