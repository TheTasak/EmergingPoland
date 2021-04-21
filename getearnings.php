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
  if(isset($_GET['date']))
	{
		$date = $_GET['date'];
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
	SELECT `{$date}`, sposoby_uzyskania_przychodu  FROM `{$date}_podzial_przychodow` WHERE idspolki='{$stock_value}';
	";
  	$query = mysqli_query($mysqli, $myquery);

	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
  while($temp = $query->fetch_assoc()) {
      $val = reset($temp);
		if(null !== $temp){
      if(null !== $val){
        $data[$i] = $temp;
        $i++;
      }
		}else{
      break;
		}
	}
  $date_array = array_fill(0, count($data),$date);
	$data = array_map(function($obj, $dates) {
    return array(
        'name' => $obj['sposoby_uzyskania_przychodu'],
        'value' => $obj[$dates]
    );
	}, $data, $date_array);
    echo json_encode($data);
    mysqli_close($mysqli);
?>
