<?php
  require_once("sql_functions.php");

	if(isset($_GET['stock_name'])) {
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['start_year'])) {
		$start_year = $_GET['start_year'];
	}
  if(isset($_GET['end_year'])) {
		$end_year = $_GET['end_year'];
	}
  if(isset($_GET['lang'])) {
    $lang = $_GET['lang'];
  }
	$sqli = sql_open();

	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = $stock["idspolki"];

  $data = new stdClass();
  for($year = $start_year; $year <= $end_year; $year++) {
    $myquery = "SELECT DISTINCT sektor  FROM `{$year}_podzial_sektorow` WHERE idspolki='{$stock_value}';";
    $tables = sql_getdataarray($sqli, $myquery);
    $data_year = array();
    for($i = 0; $i < count($tables); $i++) {
      $tabela_array = array();
      $tabela_object = new stdClass();
      $tabela_object->{"name"} = $tables[$i]["sektor"];

      $myquery = "SELECT * FROM `tlumaczenie` WHERE baza='{$tables[$i]["sektor"]}';";
      $tlumaczenie_tabela = sql_getdatarecord($sqli, $myquery);
      if(null !== $tlumaczenie_tabela) {
        $tabela_object->{"translate"} = $tlumaczenie_tabela[$lang];
      } else {
        $tabela_object->{"translate"} = $tables[$i]["sektor"];
      }
      $myquery = "SELECT * FROM `{$year}_podzial_sektorow` WHERE idspolki='{$stock_value}' AND sektor='{$tables[$i]["sektor"]}';";
      $podzial = sql_getdataarray($sqli, $myquery);
      for($j = 0; $j < count($podzial); $j++) {
        $podzial_object = new stdClass();
        $podzial_object->{"name"} = $podzial[$j]["podzial"];

        $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$podzial[$j]["podzial"]}';";
        $tlumaczenie = sql_getdatarecord($sqli, $myquery);
        if(null !== $tlumaczenie) {
          $podzial_object->{"translate"} = $tlumaczenie[$lang];
        } else {
          $myquery = "SELECT * FROM `tlumaczenie` WHERE baza='{$podzial[$j]["podzial"]}';";
          $tlumaczenie = sql_getdatarecord($sqli, $myquery);
          if(null !== $tlumaczenie) {
            $podzial_object->{"translate"} = $tlumaczenie[$lang];
          } else {
            $podzial_object->{"translate"} = $podzial[$j]["podzial"];
          }
        }
        $podzial_object->{"name"} = $podzial[$j]["podzial"];

        $podzial_object->{"quarter1"} = $podzial[$j][$year . "_1"];
        $podzial_object->{"quarter2"} = $podzial[$j][$year . "_2"];
        $podzial_object->{"quarter3"} = $podzial[$j][$year . "_3"];
        $podzial_object->{"quarter4"} = $podzial[$j][$year . "_4"];
        $podzial_object->{"year"} = $podzial[$j][$year];
        $tabela_array[] = $podzial_object;
      }
      $tabela_object->{"children"} = $tabela_array;
      $data_year[] = $tabela_object;
    }
    $data->{$year} = $data_year;
  }

  echo json_encode($data);
  mysqli_close($sqli);
?>
