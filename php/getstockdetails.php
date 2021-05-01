<?php
    $username = "homeuser";
    $password = "Admin123";
    $host = "localhost";
    $database="stronka";

    $mysqli = new mysqli($host, $username, $password, $database);
  	if (mysqli_connect_errno()) {
  		printf("Connect failed: %s\n", mysqli_connect_error());
  		exit();
  	}
  if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
	$i = 0;
	$myquery = "
	SELECT waluta, rok, dane, akcje, podzial_przychodow, kraje, regiony, podzial_sektorow, inne, miasta, udzial_w_rynku  FROM `spis` WHERE spolki='{$stock_name}';
	";
  	$query = mysqli_query($mysqli, $myquery);

	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
  $data = $query->fetch_assoc();
  echo json_encode($data);
  mysqli_close($mysqli);
?>
