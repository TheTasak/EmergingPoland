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
	SELECT `{$date}`, kraje FROM `{$date}_kraje` WHERE idspolki='{$stock_value}';
	";
  	$query = mysqli_query($mysqli, $myquery);

	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
  	while($temp = $query->fetch_assoc()) {
		if(null !== reset($temp)){
			$data[$i] = $temp;
			$i++;
		}
	}
	$i = 0;
	$myquery = "
	SELECT baza, angielski FROM `tlumaczenie`;
	";
	$query = mysqli_query($mysqli, $myquery);
	$countries = array();
	if ( ! $query ) {
		echo mysqli_error($mysqli);
		die;
	}
	while($temp = $query->fetch_assoc()) {
		$countries[$i] = $temp;
		$i++;
	}
	foreach($data as &$obj){
		foreach($obj as $tag => &$val){
			if($tag == 'kraje'){
				foreach($countries as $country){
					if(reset($country) == $val){
						$val = $country[array_keys($country)[1]];
					}
				}
			}
		}
	}
	$date_array = array_fill(0, count($data),$date);
	$data = array_map(function($obj, $dates) {
    return array(
        'country' => $obj['kraje'],
        'value' => $obj[$dates]
    );
	}, $data, $date_array);
    echo json_encode($data);
    mysqli_close($mysqli);
?>
