<?php
    require_once("sql_functions.php");

    if(isset($_GET['index'])){
      $index = $_GET['index'];
    }

  	$sqli = sql_open();

  	$myquery = "SELECT spolki, idspolki FROM `spis` WHERE indeks='{$index}';";
    $stocks = sql_getdataarray($sqli, $myquery);
    $data = [];
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
      $object->{"name"} = $stocks[$i]["spolki"];
      $object->{"value"} = $price * $stocks_count;
      $data[] = $object;
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
