<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <script src="libs/wNumb.js" defer></script>
  	<link href="libs/nouislider.css" rel="stylesheet">
  	<script src="libs/nouislider.js" defer></script>
    <link rel="stylesheet" href="css/style.css?v=1">
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="https://d3js.org/d3-scale.v3.js" defer></script>
  	<script src="https://d3js.org/d3-geo-projection.v2.js" defer></script>

    <script src="js/dane_barchart.js?v=1" defer></script>
    <script src="js/dividendchart.js?v=1" defer></script>
  	<script src="js/treechart.js?v=1" defer></script>
    <script src="js/udzial_treechart.js?v=1" defer></script>
    <script src="js/sectordane_barchart.js?v=1" defer></script>
    <script src="js/innedane_circlechart.js?v=1" defer></script>
    <script src="js/map.js?v=1" defer></script>
    <script src="js/akcje_chart.js?v=1" defer></script>
    <script src="js/indicatortable.js?v=1" defer></script>
    <script src="js/basicinfotable.js?v=1" defer></script>
    <script src="js/stock.js?v=1" defer></script>
    <script src="js/script.js?v=1" defer></script>
  </head>
  <body id="body">
    <div id="sidenav" class="sidenav">
      <button class="closebtn" type="button" onclick="closeNav()">&times;</button>
      <div id="links-main">
        </div>
      <div id="links-secondary">
        </div>
    </div>
    <header>
      <nav>
        <button class="openbtn" href="#" onclick="openNav()">&#8801;</button>
      </nav>
      <div id="jezyki">język
        <a id="lang-pl"><img src="https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg"></a>
        <a id="lang-en"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Flag_of_Great_Britain_%281707%E2%80%931800%29.svg/255px-Flag_of_Great_Britain_%281707%E2%80%931800%29.svg.png"></a>
      </div>
    </header>
    <main>
      <h1 id="name"><?php echo $_GET['stock'] ?> </h1>
      <input type="hidden" id="language" value='<?php echo $_GET['lang'] ?>'>
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
        <div id="top_5" class="chart-div">
          </div>
      </div>
      <div class="content-bottom">
        <div id="middle_1" class="chart-div">
          </div>
        <div id="middle_2" class="chart-div">
          </div>
        <div id="middle_3" class="chart-div">
          </div>
        <div id="middle_4" class="chart-div">
          </div>
        <div id="middle_5" class="chart-div">
          </div>
      </div>
    </br>
      <div id="bottom" class="map-div">
        </div>
    </main>
    <footer>
      Copyright strona
    </footer>
  </body>
</html>
