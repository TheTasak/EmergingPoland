<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <link rel="stylesheet" href="css/style.css">
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="js/navbar.js" defer></script>
  </head>
  <body id="bodynolimit">
    <?php include "./header.html" ?>
    <main>
      <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
      <div id="titleimg">
        <div>
          <h1>EmergingPoland</h1>
        </div>
      </div>
    </main>
  </body>
</html>
