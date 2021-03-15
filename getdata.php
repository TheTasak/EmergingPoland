<?php
    $username = "homeuser";
    $password = "Admin123";
    $host = "localhost";
    $database="stronka";

    $mysqli = mysqli_connect($host, $username, $password, $database);

    $myquery = "
    SELECT * FROM dywidenda
    ";

    $query = mysqli_query($mysqli, $myquery);

    if ( ! $query ) {
        echo mysqli_error($mysqli);
        die;
    }

    $data = array();

    for ($x = 0; $x < mysqli_num_rows($query); $x++) {
        $data[] = mysqli_fetch_assoc($query);
    }

    echo json_encode($data);

    mysqli_close($mysqli);
?>
