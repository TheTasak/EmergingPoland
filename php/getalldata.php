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

  	$sqli = sql_open();

  	$myquery = "SELECT idspolki, waluta, ostatnie_sprawozdanie FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
  	$stock_value = $stock["idspolki"];
    $currency = $stock["waluta"];
    $last_year = $stock["ostatnie_sprawozdanie"];

    $myquery = "SELECT cena FROM `obecnie_cena` WHERE idspolki='{$stock_value}';";
    $price = sql_getdatarecord($sqli, $myquery);
    $price = $price["cena"];
    $data = new stdClass();
    for($i = 0; $i < $end_year - $start_year + 1; $i++) {
      $year = $start_year + $i;

      $yearly_object = new stdClass();
      $first_quarter_object = new stdClass();
      $second_quarter_object = new stdClass();
      $third_quarter_object = new stdClass();
      $forth_quarter_object = new stdClass();

      $first_quarter = "{$year}" . "_1";
      $second_quarter = "{$year}" . "_2";
      $third_quarter = "{$year}" . "_3";
      $forth_quarter = "{$year}" . "_4";

      $myquery = "SELECT * FROM `{$year}_dane` WHERE idspolki='{$stock_value}';";
      $row_rachunek = sql_getdataarray($sqli, $myquery);

      $myquery = "SELECT * FROM `{$year}_dane_bilans` WHERE idspolki='{$stock_value}';";
      $row_bilans = sql_getdataarray($sqli, $myquery);
      $row = array_merge($row_rachunek, $row_bilans);

      for($j = 0; $j < count($row); $j++) {
        if(isset($row[$j][$year])) {
          $yearly_object->{$row[$j]["dane_ksiegowe"]} = $row[$j]["{$year}"];
        }
        if(isset($row[$j][$first_quarter])) {
          $first_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$first_quarter];
        }
        if(isset($row[$j][$second_quarter])) {
          $second_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$second_quarter];
        }
        if(isset($row[$j][$third_quarter])) {
          $third_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$third_quarter];
        }
        if(isset($row[$j][$forth_quarter])) {
          $forth_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$forth_quarter];
        }
      }
      $data->{$year} =  $yearly_object;
      $data->{$first_quarter} =  $first_quarter_object;
      $data->{$second_quarter} =  $second_quarter_object;
      $data->{$third_quarter} =  $third_quarter_object;
      $data->{$forth_quarter} =  $forth_quarter_object;

      $myquery = "SELECT `{$year}_akcje` FROM `{$year}_akcje` WHERE spolka='{$stock_value}' AND osoba = 'lacznie';";
      $akcje = sql_getdatarecord($sqli, $myquery);
      if(isset($akcje)) {
        $akcje_value = reset($akcje);
      } else {
        $try_year = $year - 1;
        $myquery = "SELECT `{$try_year}_akcje` FROM `{$try_year}_akcje` WHERE spolka='{$stock_value}' AND osoba = 'lacznie';";
        $akcje = sql_getdatarecord($sqli, $myquery);
        if(isset($akcje)) {
          $akcje_value = reset($akcje);
        } else {
          $akcje_value = null;
        }
      }
      $data->{$year}->{"akcje"} = $akcje_value;
      $data->{$first_quarter}->{"akcje"} = $akcje_value;
      $data->{$second_quarter}->{"akcje"} = $akcje_value;
      $data->{$third_quarter}->{"akcje"} = $akcje_value;
      $data->{$forth_quarter}->{"akcje"} = $akcje_value;

      $myquery = "SELECT * FROM `{$year}_kurs_akcji` WHERE spolka='{$stock_value}';";
      $ceny = sql_getdatarecord($sqli, $myquery);
      if(isset($ceny)) {
        if($year == $last_year) {
          $data->{$year}->{"cena_akcji"} = $price;
        } else {
          $data->{$year}->{"cena_akcji"} = $ceny[$year];
        }
        if($first_quarter == $last_year) {
          $data->{$first_quarter}->{"cena_akcji"} = $price;
        } else {
          $data->{$first_quarter}->{"cena_akcji"} = $ceny[$first_quarter];
        }
        if($second_quarter == $last_year) {
          $data->{$second_quarter}->{"cena_akcji"} = $price;
        } else {
          $data->{$second_quarter}->{"cena_akcji"} = $ceny[$second_quarter];
        }
        if($third_quarter == $last_year) {
          $data->{$third_quarter}->{"cena_akcji"} = $price;
        } else {
          $data->{$third_quarter}->{"cena_akcji"} = $ceny[$third_quarter];
        }
        if($forth_quarter == $last_year) {
          $data->{$forth_quarter}->{"cena_akcji"} = $price;
        } else {
          $data->{$forth_quarter}->{"cena_akcji"} = $ceny[$forth_quarter];
        }
      }
      if($currency != "PLN") {
        $myquery = "SELECT * FROM `{$year}_kurs_walut` WHERE `para_walutowa`='{$currency}/PLN';";
        $para = sql_getdatarecord($sqli, $myquery);
        $data->{$year}->{"kurs_waluty"} = $para[$year];
        $data->{$first_quarter}->{"kurs_waluty"} = $para[$first_quarter];
        $data->{$second_quarter}->{"kurs_waluty"} = $para[$second_quarter];
        $data->{$third_quarter}->{"kurs_waluty"} = $para[$third_quarter];
        $data->{$forth_quarter}->{"kurs_waluty"} = $para[$forth_quarter];
      } else {
        $data->{$year}->{"kurs_waluty"} = 1;
        $data->{$first_quarter}->{"kurs_waluty"} = 1;
        $data->{$second_quarter}->{"kurs_waluty"} = 1;
        $data->{$third_quarter}->{"kurs_waluty"} = 1;
        $data->{$forth_quarter}->{"kurs_waluty"} = 1;
      }
    }
    echo json_encode($data);
    mysqli_close($sqli);
?>
