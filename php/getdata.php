<?php
    require_once("sql_functions.php");

    if(isset($_GET['data_index'])){
      $data_index = $_GET['data_index'];
    }
    if(isset($_GET['stock_name'])){
      $stock_name = $_GET['stock_name'];
    }
    if(isset($_GET['start_year'])){
      $start_year = $_GET['start_year'];
    }
    if(isset($_GET['end_year'])){
      $end_year = $_GET['end_year'];
    }
    if(isset($_GET['type'])){
      $type = $_GET['type'];
    }


  	$sqli = sql_open();

  	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
  	$stock_value = reset($stock);

    $data = array();
    if($type == "year") {
      for($i = $start_year; $i <= $end_year; $i++) {
        $date = $i;

        $myquery = "SELECT * FROM `{$date}_dane` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='{$data_index}';";
        $row = sql_getdatarecord($sqli, $myquery);
        $data[] = (object)[
          "value" => $row["{$date}"],
          "quarter" => "{$date}",
        ];
      }
    } else if($type == "quarter") {
      $count_of_quarters = 8;
      for($i = 0; $i < $count_of_quarters / 4; $i++) {
  		  $date = $end_year-$i;

    		$myquery = "SELECT * FROM `{$date}_dane` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='{$data_index}';";
    		$row = sql_getdatarecord($sqli, $myquery);
        $data[] = (object)[
          "value" => $row["{$date}"."_4"],
          "quarter" => "{$date} IV",
        ];
        $data[] = (object)[
          "value" => $row["{$date}"."_3"],
          "quarter" => "{$date} III",
        ];
        $data[] = (object)[
          "value" => $row["{$date}"."_2"],
          "quarter" => "{$date} II",
        ];
        $data[] = (object)[
          "value" => $row["{$date}"."_1"],
          "quarter" => "{$date} I",
        ];
	     }
       $data = array_reverse($data);
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
