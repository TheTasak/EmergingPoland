var menu_stock_data;
document.getElementById("lang-pl").href = window.location.href;
document.getElementById("lang-en").href = window.location.href;

function openNav() {
  document.getElementById("sidenav").style.width = "100%";
  document.body.style.overflow = "hidden";
  getStocks();
}
function closeNav() {
  document.getElementById("sidenav").style.width = "0px";
  document.body.style.overflow = "auto";

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
  let obj = d3.filter(menu_stock_data, d => d.index == object.text)[0];

  let language = document.getElementById("language").value;
  if(language == undefined || language == "")
    language = "pl";
  string += '<a href="indekspage.php?indeks=' + obj.index + "&lang=" + language +'">' + obj.index + '</a>';
  obj.stocks.forEach((item, i) => {
    string += '<a href="stockpage.php?stock=' + item.spolki + "&lang=" + language +'">' + item.spolki + '</a>';
  });
  linkssecond.innerHTML = string;

  linksmain.style.width = "40%";
  linkssecond.style.width = "60%";
}
function getStocks(){
  d3.json("php/getallstocks.php").then( d => {
    menu_stock_data = d;
    let string = "";
    string += '<a href="#" class="sidenav-linkmain" onclick="navCategoryClick(this)">' + "wig20"+ "</a>";
    string += '<a href="#" class="sidenav-linkmain" onclick="navCategoryClick(this)">' + "mwig40"+ "</a>";
    string += '<a href="#" class="sidenav-linkmain" onclick="navCategoryClick(this)">' + "swig80"+ "</a>";
    document.getElementById("links-main").innerHTML = string;
  });
}
