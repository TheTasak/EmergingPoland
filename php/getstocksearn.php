<?php
    require_once("sql_functions.php");

    if(isset($_GET['index'])){
      $index = $_GET['index'];
    }

  	$sqli = sql_open();

  	$myquery = "SELECT ostatnie_sprawozdanie, waluta, spolki, idspolki FROM `spis` WHERE indeks='{$index}';";
    $stocks = sql_getdataarray($sqli, $myquery);
    $data = [];
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
      $object->{"name"} = $stocks[$i]["spolki"];
      $object->{"value"} = $sum * 1000 * $currency;
      $data[] = $object;
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
