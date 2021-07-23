<?php
  $host = "localhost";
  $username = "homeuser";
  $password = "Admin123";
  $database = "login";

  /* Attempt to connect to MySQL database */
  $link = mysqli_connect($host, $username, $password, $database);

  // Check connection
  if (mysqli_connect_errno()) {
      die("ERROR: Could not connect. " . mysqli_connect_error());
  }
?>
