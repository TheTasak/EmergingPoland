<?php
  require_once("sql_functions.php");
  if(isset($_GET['stock_name']))
	{
		 $stock_name = $_GET['stock_name'];
	}
  $sqli = sql_open();

	$myquery = " SELECT waluta, rok, ostatnie_sprawozdanie, dane, akcje, podzial_przychodow, kraje, regiony, podzial_sektorow, inne, miasta, udzial, inne_dane  FROM `spis` WHERE spolki='{$stock_name}';";
  $data = sql_getdatarecord($sqli, $myquery);

  echo json_encode($data);
  mysqli_close($sqli);
?>
