var page_object;
var menu_stock_data;
var language;
function load(){
  const stock_name = document.getElementById("name");
  const index_name = document.getElementById("indeks");
  language = document.getElementById("language").value;
  if(language == undefined)
    language = "pl";

  if(stock_name != undefined) {
    let name = stock_name.innerHTML;
    if(name != "") {
      const container1 = document.getElementById("bottom");
      const container2 = document.getElementById("top_1");
      const container3 = document.getElementById("top_2");
      const container4 = document.getElementById("top_3");
      const container5 = document.getElementById("top_4");
      const container6 = document.getElementById("top_5");
      const container7 = document.getElementById("middleright");
      const container8 = document.getElementById("middleleft");
      const container9 = document.getElementById("bottomleft");
      const container10 = document.getElementById("bottomright");

      let container_table = [container1, container2, container3, container4, container5, container6, container7, container8, container9, container10];
      page_object = new Stock(name, container_table, language);
      document.getElementById("lang-pl").href = "index.php?stock=" + name.trim() + "&lang=pl";
      document.getElementById("lang-en").href = "index.php?stock=" + name.trim() + "&lang=en";
    }
  } else if(index_name != undefined) {
    let name = index_name.innerHTML;
    if(name != ""){
      const container1 = document.getElementById("top_1");
      const container2 = document.getElementById("top_2");
      const container3 = document.getElementById("top_3");
      const container4 = document.getElementById("top_4");

      let container_table = [container1, container2, container3, container4];
      page_object = new Index(name, container_table, language);
      document.getElementById("lang-pl").href = "indekspage.php?indeks=" + name.trim() + "&lang=pl";
      document.getElementById("lang-en").href = "indekspage.php?indeks=" + name.trim() + "&lang=en";
    }
  }
  getStocks();
}
function getStocks(){
  d3.json("php/getallstocks.php").then( d => {
    let string = "";
    menu_stock_data = d;
    for(let i = d.length-1; i >= 0; i--) {
      string += '<a href="#" class="sidenav-linkmain" onclick="navCategoryClick(this)">' + d[i].index + "</a>";
    }
    document.getElementById("links-main").innerHTML = string;
  });
}
function draw() {
  page_object.refresh();
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
