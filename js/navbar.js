var menu_stock_data;
document.getElementById("lang-pl").href = window.location.href;
document.getElementById("lang-en").href = window.location.href;

getAllStocks();

function loadIndexStocks() {
  let linksmain = document.getElementById("links");
  let index = document.getElementById("indeks");

  let string = "";
  let obj = d3.filter(menu_stock_data, d => d.index == index.innerHTML.trim())[0];
  console.log(obj);
  let language = document.getElementById("language").value;
  if(language == undefined || language == "")
    language = "pl";
  string += '<ul class="list-group list-group-flush">';
  obj.stocks.forEach((item, i) => {
    string += '<li class="list-group-item"><a href="stockpage.php?stock=' + item.spolki + "&lang=" + language +'">' + item.spolki + '</a></li>';
  });
  string += '</ul>';
  linksmain.innerHTML = string;
}
function getAllStocks(){
  d3.json("php/getallstocks.php").then( d => {
    menu_stock_data = d;
    loadIndexStocks()
  });
}
