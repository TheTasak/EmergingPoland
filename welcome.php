<?php
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>
    <link rel="stylesheet" href="css/style.css?v=1">
    <link rel="stylesheet" href="css/forms.css?v=1">

    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="js/navbar.js?v=1" defer></script>
</head>
<body>
    <?php include "./header.html" ?>
    <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
    <div class="form">
      <h2>Witaj, <b><?php echo htmlspecialchars($_SESSION["username"]); ?> - <?php echo htmlspecialchars($_SESSION["role"]); ?></b></h1>
      <?php echo ($_SESSION["role"] === "admin") ? '<p><a href="adminpanel.php">Panel admina</a></p>' : ''; ?>
      <p><a href="reset-password.php">Reset hasła</a></p>
      <p><a href="logout.php">Wyloguj się</a></p>
    </div>
    <?php include "./footer.html" ?>
</body>
</html>
