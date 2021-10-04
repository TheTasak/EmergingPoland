var page_object;
var menu_stock_data;
var language;

function loadPage(){
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
      const container7 = document.getElementById("podzial_sektorow");
      const container8 = document.getElementById("akcjonariat");
      const container9 = document.getElementById("inne");

      let container_table = [container1, container2, container3, container4, container5, container6, container7, container8, container9];
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
function splitValue(value) {
  let segments = [];
  let is_negative = (parseInt(value) < 0);
  let val = Math.abs(value);
  let whole_number_part = String(val).split(".")[0];
  let is_div = whole_number_part.length % 3;
  if(is_div != 0) {
    segments.push(whole_number_part.substr(0, is_div));
  }
  for(let i = 0 + is_div; i < whole_number_part.length; i += 3) {
    segments.push(whole_number_part.substr(i, 3));
  }
  let string = "";
  segments.forEach((item, i) => {
    string += item + " ";
  });
  string = string.slice(0, -1);
  return (is_negative ? "-" : "") + string + (String(val).split(".")[1] != undefined ? "." + String(val).split(".")[1] : "");
}
window.onload = loadPage;
window.onresize = draw;
