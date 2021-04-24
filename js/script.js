var charts = [];
var maps = [];
var treecharts = [];
var piecharts = [];

function load(){
  const stock_name = document.getElementById("name").innerHTML;
  if(stock_name != "") {
    const container1 = document.getElementById("kurs");
    let chart1 = new Chart(container1, stock_name, "przychody", "$");
    const container2 = document.getElementById("sklad");
    let chart2 = new Chart(container2, stock_name, "koszt_sprzedazy", "$");
    const container3 = document.getElementById("kwartal");
    let chart3 = new Chart(container3, stock_name, "dywidenda", "$");

    const container4 = document.getElementById("mapa");
    let map = new WorldMap(container4, stock_name);

    const container5 = document.getElementById("dywidenda");
    let treechart = new TreeChart(container5, stock_name);

    const container6 = document.getElementById("rok");
    let piechart = new PieChart(container6, stock_name);

    charts.push(chart1);
    charts.push(chart2);
    charts.push(chart3);

    maps.push(map);

    treecharts.push(treechart);
    piecharts.push(piechart);
    d3.json("php/getallstocks.php").then( d => {
      let string = "";
      for(let i = 0; i < d.length; i++)
        string += '<a href="index.php?stock=' + d[i].spolki + '">' + d[i].spolki + '</a>';
      document.getElementById("links").innerHTML = string;
    });
  }
}
function draw() {
  for(let i = 0; i < charts.length; i++) {
    charts[i].refresh();
  }
  for(let i = 0; i < maps.length; i++) {
    maps[i].refresh();
  }
  for(let i = 0; i < treecharts.length; i++) {
    treecharts[i].refresh();
  }
  for(let i = 0; i < piecharts.length; i++) {
    piecharts[i].refresh();
  }
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
