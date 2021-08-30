<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title><?php echo $_GET['stock'] ?> | EmergingPoland</title>
    <script src="libs/wNumb.js" defer></script>
  	<link href="libs/nouislider.css" rel="stylesheet">
  	<script src="libs/nouislider.js" defer></script>
    <link rel="stylesheet" href="css/style.css?v=1">
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="https://d3js.org/d3-scale.v3.js" defer></script>
  	<script src="https://d3js.org/d3-geo-projection.v2.js" defer></script>
    <script type="text/javascript" src="https://s3.tradingview.com/tv.js" defer></script>

    <script type="text/javascript">
      var versionUpdate = (new Date()).getTime();
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "js/datatable.js?v=" + versionUpdate;
      document.head.appendChild(script);
    </script>
    <script src="js/innebarchart.js" defer></script>
    <script src="js/dane_barchart.js" defer></script>
    <script src="js/earnings_barchart.js" defer></script>
    <script src="js/dividendtable.js" defer></script>
    <script src="js/dividendchart.js" defer></script>
  	<script src="js/treechart.js" defer></script>
    <script src="js/udzial_treechart.js" defer></script>
    <script src="js/sectordane_barchart.js" defer></script>
    <script src="js/innedane_circlechart.js" defer></script>
    <script src="js/map.js" defer></script>
    <script src="js/akcje_chart.js" defer></script>
    <script src="js/indicatortable.js" defer></script>
    <script src="js/basicinfotable.js" defer></script>
    <script src="js/stock.js" defer></script>
    <script src="js/navbar.js" defer></script>
    <script src="js/script.js" defer></script>
  </head>
  <body id="body">
    <?php include "./header.html" ?>
    <main>
      <h1 id="name"><?php echo $_GET['stock'] ?> </h1>
      <input type="hidden" id="language" value='<?php echo (isset($_GET['lang']) ? $_GET['lang'] : "pl")  ?>'>
      <div id="opis" class="text-div">
          <div class="text-div-content">
              <p id="description"></p>
            </div>
        </div>
      <div id="stock_tabs">
        <button class="stockbtn" type="button" onclick="setActive(this)" value="podstawowe">Podstawowe informacje</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="dane">Dane</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="wskazniki">Wskaźniki</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="dywidenda">Dywidenda</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="mapa">Mapa</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="podzial_przychodow">Podział przychodów</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="podzial_sektorow">Podział sektorów</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="akcjonariat">Akcjonariat</button>
        <button class="stockbtn" type="button" onclick="setActive(this)" value="inne">Inne</button>
      </div>
      <div class="content" id="podstawowe">
      </div>
      <div class="content" id="dane">
      </div>
      <div class="content" id="wskazniki">
      </div>
      <div class="content" id="dywidenda">
      </div>
      <div class="content" id="mapa">
      </div>
      <div class="content" id="podzial_przychodow">
      </div>
      <div class="content" id="podzial_sektorow">
      </div>
      <div class="content" id="akcjonariat">
      </div>
      <div class="content" id="inne">
      </div>
    </br>
    </main>
    <?php include "./footer.html" ?>
  </body>
</html>
