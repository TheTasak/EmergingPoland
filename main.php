<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Strona główna | EmergingPoland</title>
    <meta name="description" content="Skaner spółek GPW przedstawiający dane w sposób graficzny">
    <meta name="keywords" content="GPW, inwestowanie, investing, WSE, stock, stock market, giełda, emerging, poland, emerging markets">
    <link rel="stylesheet" href="css/style.css">
    <script src="https://d3js.org/d3.v6.js" defer></script>
    <script src="js/navbar.js" defer></script>
    <script src="js/gallery.js" defer></script>
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
      <div id="o_nas">
        <h1>O nas</h1>
        <p>Giełda Polski, Czech, Rosji, Słowacji i sąsiednich krajów jest obiektywnie tania w porównaniu do giełd krajów rozwiniętych, lecz mimo takich okazyjnych cen jest równocześnie nieznana i omijana szerokim łukiem przez kapitał zagraniczny. Chcielibyśmy to zmienić upowszechniając i ułatwiając dostęp do informacji o spółkach notowanych na tych giełdach za pomocą naszego narzędzia. </p>
        <p>Przed Tobą serwis internetowy, który pozwoli na przystępną analizę i selekcjonowanie spółek z giełd Europy Środkowo-Wschodniej. Naszym celem jest przedstawienie danych tych przedsiębiorstw w ciekawy i nieszablonowy sposób, który nie będzie wiązał się z żmudnym przeglądaniem setek sprawozdań finansowych.</p>
      </div>
      <div class="slideshow-container">
        <h2 class="title">Przykładowe dane</h2>
        <div class="slide">
          <img src="img/mainpagescreen1.png">
        </div>
        <div class="slide">
          <img src="img/mainpagescreen2.png">
        </div>
        <div class="slide">
          <img src="img/mainpagescreen3.png">
        </div>
        <div class="slide">
          <img src="img/mainpagescreen4.png">
        </div>
        <div class="slide">
          <img src="img/mainpagescreen5.png">
        </div>
        <div class="slide">
          <img src="img/mainpagescreen7.png">
        </div>
        <div class="slide">
          <img src="img/mainpagescreen6.png">
        </div>
        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
        <a class="next" onclick="plusSlides(1)">&#10095;</a>
      </div>
      <div class="dots">
        <span class="dot" onclick="currentSlide(1)"></span>
        <span class="dot" onclick="currentSlide(2)"></span>
        <span class="dot" onclick="currentSlide(3)"></span>
        <span class="dot" onclick="currentSlide(4)"></span>
        <span class="dot" onclick="currentSlide(5)"></span>
        <span class="dot" onclick="currentSlide(6)"></span>
        <span class="dot" onclick="currentSlide(7)"></span>
      </div>
      <div id="login">
        <p>Jako zalogowany użytkownik dostaniesz za darmo dostęp do indeksu Wig20. <a href="#">Sprawdź wszystkie plany subskrypcji</a></p>
        <p>Nie masz jeszcze konta? <a href="register.php">Zarejestruj się!</a> Jesteś już zarejestrowany? <a href="login.php">Zaloguj się!</a></p>
      </div>
    </main>
  </body>
</html>
