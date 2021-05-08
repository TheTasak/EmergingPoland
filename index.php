<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <link rel="stylesheet" href="css/style.css">
  	<link href="libs/nouislider.css" rel="stylesheet">
  	<script src="libs/nouislider.js" defer></script>
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="https://d3js.org/d3-scale.v3.js" defer></script>
  	<script src="https://d3js.org/d3-geo-projection.v2.js" defer></script>

    <script src="js/chart.js" defer></script>
  	<script src="js/treechart.js" defer></script>
    <script src="js/map.js" defer></script>
    <script src="js/piechart.js" defer></script>
    <script src="js/stock.js" defer></script>
    <script src="js/script.js" defer></script>
  </head>
  <body id="body">
    <div id="sidenav" class="sidenav">
      <button class="closebtn" type="button" onclick="closeNav()">&times;</button>
      <div id="links">
          <a href="#">About</a>
          <a href="#">About</a>
          <a href="#">About</a>
          <a href="#">About</a>
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
                <p>Grupa ASBIS jest jednym z czołowych dystrybutorów produktów branży informatycznej w Europie Środkowo-Wschodniej, republikach nadbałtyckich, w krajach byłego Związku Radzieckiego, na Bliskim Wschodzie i w Afryce Północnej. Łączymy duży zasięg terytorialny z szeroką gamą produktów dystrybuowanych w modelu one-stop-shop.</p>
                <p>Grupa dystrybuuje produkty gotowe pod A-brandami, takie jak tablety, smartfony, laptopy, komputery stacjonarne, serwery, urządzenia sieciowe dla odbiorców detalicznych, korporacyjnych, małych i średnich przedsiębiorstw oraz hurtowo, jak również komponenty IT - takie jak kompletne rozwiązania, segmenty do tworzenia rozwiązań oraz peryferia – dla segmentu Enterprise, assemblerów, integratorów oraz marek lokalnych.</p>
            </div>
        </div>
      <div class="content">
        <div id="topleft" class="chart-div">
          </div>
        <div id="topmiddleleft" class="chart-div">
          </div>
        <div id="topmiddleright" class="chart-div">
          </div>
        <div id="topright" class="chart-div">
          </div>
      </div>
      <div class="content-bottom">
        <div id="middleleft" class="chart-div">
          </div>
        <div id="middleright" class="chart-div">
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