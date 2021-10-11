<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>

    <link rel="stylesheet" href="css/style.css">
    <script src="js/portfel.js" defer></script>
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-dsv@3"></script>
  </head>
  <body id="body">
    <?php include "./header.html" ?>
    <main>
      <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
      <div class="mb-3">
          <input type="file" accept=".csv" id="filecontent">
      </div>
      <div class="mb-3">
          <button class="btn btn-primary mb-3" type="submit" onclick="readFile()">Wyślij</button>
      </div>
      <div id="transakcje">
      </div>
    </main>
    <?php include "./footer.html" ?>
  </body>
</html>
