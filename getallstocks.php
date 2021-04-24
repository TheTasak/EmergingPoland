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
  $data = array();
	$i = 0;
	$myquery = "
	SELECT spolki  FROM `spis`;
	";
  	$query = mysqli_query($mysqli, $myquery);

	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
  while($temp = $query->fetch_assoc()) {
      $data[$i] = $temp;
      $i++;
	}
    echo json_encode($data);
    mysqli_close($mysqli);
?>
