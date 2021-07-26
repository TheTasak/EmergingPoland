<?php
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || $_SESSION["role"] !== "admin"){
    header("location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <link rel="stylesheet" href="css/style.css?v=1">
    <link rel="stylesheet" href="css/admin.css?v=1">

    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="js/navbar.js?v=1" defer></script>
    <script src="js/adminpanel.js?v=1" defer></script>
</head>
<body>
    <?php include "./header.html" ?>
    <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
    <main>
      <p>Admin panel</p>
      <p><a href="logout.php">Wyloguj się</a></p>
      <div id="panel">
      </div>
    </main>
    <?php include "./footer.html" ?>
</body>
</html>
