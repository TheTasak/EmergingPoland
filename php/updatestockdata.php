<?php
  require_once("sql_functions.php");
  $sqli = sql_open();

  if(isset($_GET['stock_name'])){
    $stock_name = mysqli_real_escape_string($sqli, $_GET['stock_name']);
  }
  if(isset($_GET['lang'])){
    $lang = mysqli_real_escape_string($sqli, $_GET['lang']);
  }

  $myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
  $stock_value = $stock["idspolki"];

  $data = json_decode($_GET['data']);
  for($i = 0; $i < count($data); $i++) {
    $year = mysqli_real_escape_string($sqli, $data[$i]->{"year"});
    $values = $data[$i]->{"values"};
    for($j = 0; $j < count($values); $j++) {
      $name = mysqli_real_escape_string($sqli, $values[$j]->{"name"});
      $value = mysqli_real_escape_string($sqli, $values[$j]->{"value"});
      $myquery = "SELECT baza FROM tlumaczenie WHERE `$lang`='{$name}';";
      $translate = sql_getdatarecord($sqli, $myquery);
      if(null !== $translate) {
        $translate = $translate["baza"];
      } else {
        $translate = $name;
      }
      $myquery = "UPDATE `{$year}_dane` SET `$year`=$value WHERE idspolki=$stock_value AND dane_ksiegowe='{$translate}';";
      echo "UPDATE `{$year}_dane` SET `$year`=$value WHERE idspolki=$stock_value AND dane_ksiegowe='{$translate}';" . "<br>";
      $temp = sql_updaterecord($sqli, $myquery);
    }
  }
  mysqli_close($sqli);
?>
