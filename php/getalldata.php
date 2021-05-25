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

  	$myquery = "SELECT idspolki, waluta FROM `spis` WHERE spolki='{$stock_name}';";
    $stock = sql_getdatarecord($sqli, $myquery);
  	$stock_value = $stock["idspolki"];
    $currency = $stock["waluta"];

    $data = new stdClass();
    for($i = 0; $i < $end_year - $start_year + 1; $i++) {
      $year = $start_year + $i;
      $myquery = "SELECT * FROM `{$year}_dane` WHERE idspolki='{$stock_value}';";
      $row = sql_getdataarray($sqli, $myquery);

      $yearly_object = new stdClass();
      $first_quarter_object = new stdClass();
      $second_quarter_object = new stdClass();
      $third_quarter_object = new stdClass();
      $forth_quarter_object = new stdClass();

      $first_quarter = "{$year}" . "_1";
      $second_quarter = "{$year}" . "_2";
      $third_quarter = "{$year}" . "_3";
      $forth_quarter = "{$year}" . "_4";

      for($j = 0; $j < count($row); $j++) {
        $yearly_object->{$row[$j]["dane_ksiegowe"]} = $row[$j]["{$year}"];
        $first_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$first_quarter];
        $second_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$second_quarter];
        $third_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$third_quarter];
        $forth_quarter_object->{$row[$j]["dane_ksiegowe"]} = $row[$j][$forth_quarter];
      }
      $data->{$year} =  $yearly_object;
      $data->{$first_quarter} =  $first_quarter_object;
      $data->{$second_quarter} =  $second_quarter_object;
      $data->{$third_quarter} =  $third_quarter_object;
      $data->{$forth_quarter} =  $forth_quarter_object;

      $myquery = "SELECT `{$year}_akcje` FROM `{$year}_akcje` WHERE spolka='{$stock_value}' AND osoba = 'lacznie';";
      $akcje = sql_getdatarecord($sqli, $myquery);
      $data->{$year}->{"akcje"} = reset($akcje);
      $data->{$first_quarter}->{"akcje"} = reset($akcje);
      $data->{$second_quarter}->{"akcje"} = reset($akcje);
      $data->{$third_quarter}->{"akcje"} = reset($akcje);
      $data->{$forth_quarter}->{"akcje"} = reset($akcje);

      $myquery = "SELECT * FROM `{$year}_kurs_akcji` WHERE spolka='{$stock_value}';";
      $ceny = sql_getdatarecord($sqli, $myquery);
      $data->{$year}->{"cena_akcji"} = $ceny[$year];
      $data->{$first_quarter}->{"cena_akcji"} = $ceny[$first_quarter];
      $data->{$second_quarter}->{"cena_akcji"} = $ceny[$second_quarter];
      $data->{$third_quarter}->{"cena_akcji"} = $ceny[$third_quarter];
      $data->{$forth_quarter}->{"cena_akcji"} = $ceny[$forth_quarter];
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
