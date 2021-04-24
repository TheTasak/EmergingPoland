<?php
    $username = "homeuser";
    $password = "Admin123";
    $host = "localhost";
    $database="stronka";

    $mysqli = new mysqli($host, $username, $password, $database);
    if(isset($_GET['data_index']))
    {
		$data_index = $_GET['data_index'];
    }
	if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
  	if (mysqli_connect_errno()) {
  		printf("Connect failed: %s\n", mysqli_connect_error());
  		exit();
  	}
    $data = array();
	$stock = array();
	$myquery = "
	SELECT idspolki FROM `spis` WHERE spolki='{$stock_name}';
	";
  	$query = mysqli_query($mysqli, $myquery);

	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
  	$stock = $query->fetch_assoc();
	$stock_value = reset($stock);
	
	$i = 0;
	for($i = 0; $i <= 10; $i++) {
		$date = 10+$i;
  		$myquery = "
  		SELECT * FROM `20{$date}_dane` WHERE idspolki='{$stock_value}' AND dane_ksiegowe='{$data_index}';
  		";
  		$query = mysqli_query($mysqli, $myquery);

  		if ( ! $query ) {
  			echo mysqli_error($mysqli);
  			die;
  		}
  		$row = $query->fetch_assoc();
  		$data[$i] = $row["20{$date}"];
	  }
    echo json_encode($data);
    mysqli_close($mysqli);
?>
