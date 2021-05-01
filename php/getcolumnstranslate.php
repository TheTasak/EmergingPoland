<?php
    header('Content-Type: text/html; charset=utf-8');
    $username = "homeuser";
    $password = "Admin123";
    $host = "localhost";
    $database="stronka";

    $mysqli = new mysqli($host, $username, $password, $database);
    $mysqli->query("SET NAMES 'utf8'");
	if(isset($_GET['stock_name']))
	{
		$stock_name = $_GET['stock_name'];
	}
  if(isset($_GET['year']))
	{
		$year = $_GET['year'];
	}
  if(isset($_GET['lang']))
	{
		$lang = $_GET['lang'];
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
	SELECT dane_ksiegowe FROM `{$year}_dane` WHERE idspolki='{$stock_value}';
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

  for($i = 0; $i < count($data); $i++){
    $temp = reset($data[$i]);
  	$myquery = "
  	SELECT `{$lang}` FROM tlumaczenie WHERE baza='{$temp}';
  	";
    $query = mysqli_query($mysqli, $myquery);

  	if ( ! $query ) {
  		echo mysqli_error($mysqli);
  		die;
  	}
    $temp = $query->fetch_assoc();
    $data[$i] = (object)[
      reset($data[$i]) => reset($temp),
    ];
  }

    echo json_encode($data);
    mysqli_close($mysqli);
?>
