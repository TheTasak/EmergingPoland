<?php
  function sql_open()
  {
    $host = "localhost";
    $username = "u723121803_homeuser";
    $password = "Admin123";
    $database = "u723121803_stronka";
    $mysqli = new mysqli($host, $username, $password, $database);
    $mysqli->set_charset('utf8mb4');

    if (mysqli_connect_errno()) {
      printf("Connect failed: %s\n", mysqli_connect_error());
      return false;
    }
    return $mysqli;
  }
  function sql_getdatarecord($mysqli, $sql_query)
  {
      $query = mysqli_query($mysqli, $sql_query);

    	if ( ! $query ) {
    		echo mysqli_error($mysqli);
    		return false;
    	}
      return $query->fetch_assoc();
  }
  function sql_updaterecord($mysqli, $sql_query)
  {
      $query = mysqli_query($mysqli, $sql_query);

      if ( ! $query ) {
        echo mysqli_error($mysqli);
        return false;
      }
      return true;
  }
  function sql_getdataarray($mysqli, $sql_query)
  {
    $query = mysqli_query($mysqli, $sql_query);

    if ( ! $query ) {
      echo mysqli_error($mysqli);
      return false;
    }

    $data = array();
    while($temp = $query->fetch_assoc()) {
      if(null !== reset($temp)){
        $data[] = $temp;
      }
    }
    return $data;
  }
?>
