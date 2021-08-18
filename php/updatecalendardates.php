<?php
  require_once("sql_functions.php");
  $sqli = sql_open();

  if(isset($_GET['data'])){
    $data = json_decode($_GET['data']);
  }

  for($i = 0; $i < count($data); $i++) {
    $name = mysqli_real_escape_string($sqli, $data[$i]->{"name"});
    $date = mysqli_real_escape_string($sqli, $data[$i]->{"date"});
    $color = mysqli_real_escape_string($sqli, $data[$i]->{"color"})

    $myquery = "SELECT nazwa FROM `daty` WHERE nazwa='{$name}' AND data='{$date}';";
    $record = sql_getdatarecord($sqli, $myquery);
    if(null == $record) {
      $myquery = "INSERT INTO `daty` (nazwa, data, kolor) VALUES ('{$name}', '{$date}', '{$color}');";
      $insert = sql_updaterecord($sqli, $myquery);
    }
  }
  echo json_encode("Success");
  mysqli_close($sqli);
?>
