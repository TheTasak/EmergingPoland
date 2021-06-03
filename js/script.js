var stock;
function load(){
  const stock_name = document.getElementById("name").innerHTML;

  if(stock_name != "") {
    const container1 = document.getElementById("topleft");
    const container2 = document.getElementById("topmiddleleft");
    const container3 = document.getElementById("topmiddleright");
    const container4 = document.getElementById("topright");
    const container5 = document.getElementById("middleright");
    const container6 = document.getElementById("middleleft");
    const container7 = document.getElementById("bottom");

    const language = document.getElementById("language").value;
    if(language == undefined)
      language = "pl";
    document.getElementById("lang-pl").href = "index.php?stock=" + stock_name.trim() + "&lang=pl";
    document.getElementById("lang-en").href = "index.php?stock=" + stock_name.trim() + "&lang=en";
    stock = new Stock(stock_name, [container1, container2, container3, container4, container5, container6, container7], language);

    d3.json("php/getallstocks.php").then( d => {
      let string = "";
      for(let i = 0; i < d.length; i++)
        string += '<a href="index.php?stock=' + d[i].spolki + "&lang=" + language +'">' + d[i].spolki + '</a>';
      document.getElementById("links").innerHTML = string;
    });
  }
}
function draw() {
  stock.refresh();
}
function openNav() {
  document.getElementById("sidenav").style.width = "100%";
  document.getElementById("body").style.overflow = "hidden";
}
function closeNav() {
  document.getElementById("sidenav").style.width = "0px";
  document.getElementById("body").style.overflow = "auto";
}
window.onload = load;
window.onresize = draw;
