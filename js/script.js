var page_object;
var menu_stock_data;
var language;

function load_page(){
  const stock_name = document.getElementById("name");
  const index_name = document.getElementById("indeks");
  language = document.getElementById("language").value;
  if(language == undefined)
    language = "pl";

  if(stock_name != undefined) {
    let name = stock_name.innerHTML;
    if(name != "") {
      const container1 = document.getElementById("podstawowe");
      const container2 = document.getElementById("dane");
      const container3 = document.getElementById("wskazniki");
      const container4 = document.getElementById("dywidenda");
      const container5 = document.getElementById("mapa");
      const container6 = document.getElementById("podzial_przychodow");
      const container7 = document.getElementById("akcjonariat");
      const container8 = document.getElementById("inne");

      let container_table = [container1, container2, container3, container4, container5, container6, container7, container8];
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
      const container5 = document.getElementById("bottom");

      let container_table = [container1, container2, container3, container4, container5];
      page_object = new Index(name, container_table, language);
      document.getElementById("lang-pl").href = "indekspage.php?indeks=" + name.trim() + "&lang=pl";
      document.getElementById("lang-en").href = "indekspage.php?indeks=" + name.trim() + "&lang=en";
    }
  }
  getStocks();
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
  let obj = d3.filter(menu_stock_data, d => d.index == object.text)[0];
  string += '<a href="indekspage.php?indeks=' + obj.index + "&lang=" + language +'">' + obj.index + '</a>';
  obj.stocks.forEach((item, i) => {
    string += '<a href="index.php?stock=' + item.spolki + "&lang=" + language +'">' + item.spolki + '</a>';
  });
  linkssecond.innerHTML = string;

  linksmain.style.width = "40%";
  linkssecond.style.width = "60%";
}
function setActive(object) {
  let buttons = document.getElementsByClassName("stockbtn");
  for(let i = 0; i < buttons.length; i++) {
    let temp = document.getElementById(buttons[i].value);
    temp.classList.add("hidden-div");
  }
  let temp = document.getElementById(object.value);
  temp.classList.remove("hidden-div");
  page_object.load_layout();
}
window.onload = load_page;
window.onresize = draw;
