<?php
    $username = "homeuser";
    $password = "Admin123";
    $host = "localhost";
    $database="stronka";

    $mysqli = new mysqli($host, $username, $password, $database);
	if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
  	if (mysqli_connect_errno()) {
  		printf("Connect failed: %s\n", mysqli_connect_error());
  		exit();
  	}
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
	
    $data = array();
	$i = 0;
	$myquery = "
	SELECT dane_ksiegowe FROM `2010_dane` WHERE idspolki='{$stock_value}';
	";
  	$query = mysqli_query($mysqli, $myquery);

	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
  	while($temp = $query->fetch_assoc()) {
		if($temp != null){
			$data[$i] = $temp;
			$i++;
		}else{
			break;
		}
	}
    echo json_encode($data);
    mysqli_close($mysqli);
?>
