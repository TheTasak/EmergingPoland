<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>

    <script src="libs/wNumb.js" defer></script>
  	<link href="libs/nouislider.css" rel="stylesheet">
  	<script src="libs/nouislider.js" defer></script>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="https://d3js.org/d3-scale.v3.js" defer></script>
  	<script src="https://d3js.org/d3-geo-projection.v2.js" defer></script>

    <script src="js/captreechart.js" defer></script>
    <script src="js/indexmap.js" defer></script>
    <script src="js/indeks.js" defer></script>
    <script src="js/script.js" defer></script>
  </head>
  <body id="body">
    <?php include "./header.html" ?>
    <main>
      <h1 id="indeks"><?php echo $_GET['indeks'] ?> </h1>
      <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
      <div id="opis" class="text-div">
          <div class="text-div-content">
              <p id="description"></p>
            </div>
        </div>
      <div class="content">
        <div id="top_1" class="chart-div">
          </div>
        <div id="top_2" class="chart-div">
          </div>
        <div id="top_3" class="chart-div">
          </div>
        <div id="top_4" class="chart-div">
          </div>
      </div>
      <div id="bottom" class="map-div">
        </div>
    </main>
    <?php include "./footer.html" ?>
  </body>
</html>
