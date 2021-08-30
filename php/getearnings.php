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

	$myquery = "SELECT DISTINCT grupa FROM `{$year}_podzial_przychodow` WHERE idspolki='{$stock_value}';";
  $groups = sql_getdataarray($sqli, $myquery);
  $data = new stdClass();
  $data->{"name"} = "chart";
  $arr = array();
  for($i = 0; $i < count($groups); $i++) {
    $myquery = "SELECT * FROM `{$year}_podzial_przychodow` WHERE idspolki='{$stock_value}' AND grupa='{$groups[$i]["grupa"]}';";
    $data_column = sql_getdataarray($sqli, $myquery);
    $object = new stdClass();
    $object->{"name"} = $groups[$i]["grupa"];
    $myquery = "SELECT $lang FROM `tlumaczenie` WHERE baza='{$groups[$i]["grupa"]}';";
    $translate = sql_getdatarecord($sqli, $myquery);
    if(isset($translate[$lang])) {
      $object->{"translate"} = $translate[$lang];
    } else {
      $object->{"translate"} = $groups[$i]["grupa"];
    }
    $children_arr = array();
    for($j = 0; $j < count($data_column); $j++) {
      $data_object = new stdClass();
      if(isset($data_column[$j]["sposoby_uzyskania_przychodu"])) {
        $name = $data_column[$j]["sposoby_uzyskania_przychodu"];
      } else {
        $name = $groups[$i]["grupa"];
      }
      $data_object->{"name"} = $name;
      $myquery = "SELECT $lang FROM `tlumaczenie` WHERE baza='{$name}';";
      $translate = sql_getdatarecord($sqli, $myquery);
      if(isset($translate[$lang])) {
        $data_object->{"translate"} = $translate[$lang];
      } else {
        $data_object->{"translate"} = $name;
      }
      
      if(isset($data_column[$j][$year . "_1"])) {
        $data_object->{"quarter1"} = $data_column[$j][$year . "_1"];
      }
      if(isset($data_column[$j][$year . "_2"])) {
        $data_object->{"quarter2"} = $data_column[$j][$year . "_2"];
      }
      if(isset($data_column[$j][$year . "_3"])) {
        $data_object->{"quarter3"} = $data_column[$j][$year . "_3"];
      }
      if(isset($data_column[$j][$year . "_4"])) {
        $data_object->{"quarter4"} = $data_column[$j][$year . "_4"];
      }
      if(isset($data_column[$j][$year])) {
        $data_object->{"year"} = $data_column[$j][$year];
      }
      $children_arr[] = $data_object;
    }
    $object->{"children"} = $children_arr;
    $arr[] = $object;
  }
  $data->{"children"} = $arr;
  echo json_encode($data);
  mysqli_close($sqli);
?>
