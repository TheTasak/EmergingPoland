var stock;
var menu_stock_data;
var language;
function load(){
  const stock_name = document.getElementById("name").innerHTML;

  if(stock_name != "") {
    const container1 = document.getElementById("bottom");
    const container2 = document.getElementById("topleft");
    const container3 = document.getElementById("topmiddleleft");
    const container4 = document.getElementById("topmiddleright");
    const container5 = document.getElementById("topright");
    const container6 = document.getElementById("middleright");
    const container7 = document.getElementById("middleleft");
    const container8 = document.getElementById("bottomleft");
    const container9 = document.getElementById("bottomright");

    let container_table = [container1, container2, container3, container4, container5, container6, container7, container8, container9];

    language = document.getElementById("language").value;
    if(language == undefined)
      language = "pl";
    document.getElementById("lang-pl").href = "index.php?stock=" + stock_name.trim() + "&lang=pl";
    document.getElementById("lang-en").href = "index.php?stock=" + stock_name.trim() + "&lang=en";
    stock = new Stock(stock_name, container_table, language);
    d3.json("php/getallstocks.php").then( d => {
      let string = "";
      for(let i = 0; i < d.length; i++) {
        string += '<a href="#" class="sidenav-linkmain" onmouseover="navCategoryClick(this)">' + d[i].index + "</a>";
      }
      menu_stock_data = d;
      document.getElementById("links-main").innerHTML = string;
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

  let linksmain = document.getElementById("links-main");
  let linkssecond = document.getElementById("links-secondary");
  linksmain.style.width = "50%";
  linkssecond.style.width = "0";
  linkssecond.innerHTML = "";
}
function navCategoryClick(object) {
  let linksmain = document.getElementById("links-main");
  let linkssecond = document.getElementById("links-secondary");
  let string = "";
  for(let i = 0; i < menu_stock_data.length; i++) {
    if(menu_stock_data[i].index == object.text) {
      for(let j = 0; j < menu_stock_data[i].stocks.length; j++) {
        string += '<a href="index.php?stock=' + menu_stock_data[i].stocks[j].spolki + "&lang=" + language +'">' + menu_stock_data[i].stocks[j].spolki + '</a>';
      }
    }
  }
  linksmain.style.width = "40%";
  linkssecond.style.width = "60%";
  linkssecond.innerHTML = string;
}
window.onload = load;
window.onresize = draw;
