<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>Strona główna | EmergingPoland</title>
    <meta name="description" content="Skaner spółek GPW przedstawiający dane w sposób graficzny">
    <meta name="keywords" content="GPW, inwestowanie, investing, WSE, stock, stock market, giełda, emerging, poland, emerging markets">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.1/dist/js/bootstrap.bundle.min.js" defer></script>
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
      <div id="o_nas">
        <h1>O nas</h1>
        <p>Giełda Polski, Czech, Rosji, Słowacji i sąsiednich krajów jest obiektywnie tania w porównaniu do giełd krajów rozwiniętych, lecz mimo takich okazyjnych cen jest równocześnie nieznana i omijana szerokim łukiem przez kapitał zagraniczny. Chcielibyśmy to zmienić upowszechniając i ułatwiając dostęp do informacji o spółkach notowanych na tych giełdach za pomocą naszego narzędzia. </p>
        <p>Przed Tobą serwis internetowy, który pozwoli na przystępną analizę i selekcjonowanie spółek z giełd Europy Środkowo-Wschodniej. Naszym celem jest przedstawienie danych tych przedsiębiorstw w ciekawy i nieszablonowy sposób, który nie będzie wiązał się z żmudnym przeglądaniem setek sprawozdań finansowych.</p>
      </div>
      <div id="slideshow" class="carousel slide carousel-dark" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="2" aria-label="Slide 3"></button>
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="3" aria-label="Slide 4"></button>
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="4" aria-label="Slide 5"></button>
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="5" aria-label="Slide 6"></button>
          <button type="button" data-bs-target="#slideshow" data-bs-slide-to="6" aria-label="Slide 7"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img src="img/mainpagescreen1.png" class="d-block w-50" alt="wykres">
          </div>
          <div class="carousel-item">
            <img src="img/mainpagescreen2.png" class="d-block w-50" alt="wykres">
          </div>
          <div class="carousel-item">
            <img src="img/mainpagescreen3.png" class="d-block w-50" alt="wykres">
          </div>
          <div class="carousel-item">
            <img src="img/mainpagescreen4.png" class="d-block w-50" alt="wykres">
          </div>
          <div class="carousel-item">
            <img src="img/mainpagescreen5.png" class="d-block w-50" alt="wykres">
          </div>
          <div class="carousel-item">
            <img src="img/mainpagescreen6.png" class="d-block w-50" alt="wykres">
          </div>
          <div class="carousel-item">
            <img src="img/mainpagescreen7.png" class="d-block w-50" alt="wykres">
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#slideshow" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#slideshow" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
      <div id="login">
        <p>Jako zalogowany użytkownik dostaniesz za darmo dostęp do indeksu Wig20. <a href="#">Sprawdź wszystkie plany subskrypcji</a></p>
        <p>Nie masz jeszcze konta? <a href="register.php">Zarejestruj się!</a> Jesteś już zarejestrowany? <a href="login.php">Zaloguj się!</a></p>
      </div>
    </main>
  </body>
</html>
