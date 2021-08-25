<?php
  require_once("sql_functions.php");
	if(isset($_GET['stock_name'])) {
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['year'])) {
		$year = $_GET['year'];
	}
  if(isset($_GET['lang'])) {
    $lang = $_GET['lang'];
  } else {
    $lang = "pl";
  }
	$sqli = sql_open();

	$myquery = "SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';";
  $stock = sql_getdatarecord($sqli, $myquery);
	$stock_value = $stock["idspolki"];

	$myquery = "SELECT DISTINCT rynek  FROM `{$year}_udzial` WHERE idspolki='{$stock_value}';";
  $tables = sql_getdataarray($sqli, $myquery);
  $data = array();
  for($i = 0; $i < count($tables); $i++) {
    $tabela_array = array();
    $tabela_object = new stdClass();
    $tabela_object->{"name"} = $tables[$i]["rynek"];

    $myquery = "SELECT * FROM `{$year}_udzial` WHERE idspolki='{$stock_value}' AND rynek='{$tables[$i]["rynek"]}';";
    $podzial = sql_getdataarray($sqli, $myquery);
    for($j = 0; $j < count($podzial); $j++) {
      $podzial_object = new stdClass();
      $podzial_object->{"name"} = $podzial[$j]["podzial"];

      $myquery = "SELECT * FROM `tlumaczenie_kraje` WHERE baza='{$podzial[$j]["podzial"]}';";
      $tlumaczenie = sql_getdatarecord($sqli, $myquery);
      if(isset($tlumaczenie)) {
        $podzial_object->{"translate"} = $tlumaczenie[$lang];
      } else {
        $myquery = "SELECT * FROM `tlumaczenie` WHERE baza='{$podzial[$j]["podzial"]}';";
        $tlumaczenie = sql_getdatarecord($sqli, $myquery);
        if(isset($tlumaczenie)) {
          $podzial_object->{"translate"} = $tlumaczenie[$lang];
        } else {
          $podzial_object->{"translate"} = $podzial[$j]["podzial"];
        }
      }
      $podzial_object->{"name"} = $podzial[$j]["podzial"];
      $podzial_object->{"year"} = $podzial[$j][$year];
      $tabela_array[] = $podzial_object;
    }
    $tabela_object->{"children"} = $tabela_array;
    $data[] = $tabela_object;
  }
  echo json_encode($data);
  mysqli_close($sqli);
?>
