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
  	if (mysqli_connect_errno()) {
  		printf("Connect failed: %s\n", mysqli_connect_error());
  		exit();
  	}
    $data = array();
	  $i = 0;
	  for($i = 0; $i <= 10; $i++) {
      $date = 10+$i;
  		$myquery = "
  		SELECT * FROM `20{$date}_dane` WHERE idspolki=1 AND dane_ksiegowe='{$data_index}';
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
