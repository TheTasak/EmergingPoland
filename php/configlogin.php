<?php
  $host = "localhost";
  $username = "u723121803_loginuser";
  $password = "Admin123";
  $database = "u723121803_login";

  /* Attempt to connect to MySQL database */
  $link = mysqli_connect($host, $username, $password, $database);

  // Check connection
  if (mysqli_connect_errno()) {
      die("ERROR: Could not connect. " . mysqli_connect_error());
  }
?>
