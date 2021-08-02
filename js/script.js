var page_object;
var menu_stock_data;
var language;

function load_page(){
  const stock_name = document.getElementById("name");
  const index_name = document.getElementById("indeks");
  language = document.getElementById("language").value;
  if(language == undefined || language == "")
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
      document.getElementById("lang-pl").href = "stockpage.php?stock=" + name.trim() + "&lang=pl";
      document.getElementById("lang-en").href = "stockpage.php?stock=" + name.trim() + "&lang=en";
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
  } else {
    document.getElementById("lang-pl").href = window.location.href;
    document.getElementById("lang-en").href = window.location.href;
  }
  getStocks();
}
function draw() {
  if(page_object != undefined)
    page_object.refresh();
}
function setActive(object) {
  let buttons = document.getElementsByClassName("stockbtn");
  for(let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("active-btn");
    let temp = document.getElementById(buttons[i].value);
    temp.classList.add("hidden-div");
  }
  object.classList.add("active-btn");
  let temp = document.getElementById(object.value);
  temp.classList.remove("hidden-div");
  page_object.load_layout();
}
window.onload = load_page;
window.onresize = draw;
