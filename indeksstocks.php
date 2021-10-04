<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>

    <link rel="stylesheet" href="css/style.css">
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="js/navbar.js" defer></script>
  </head>
  <body id="body">
    <?php include "./header.html" ?>
    <main>
      <h1 id="indeks"><?php echo $_GET['indeks'] ?> </h1>
      <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
      <div id="links">

      </div>
    </main>
    <?php include "./footer.html" ?>
  </body>
</html>
