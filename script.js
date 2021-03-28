var charts = [];

function load(){
  const dividend_container = document.getElementById("kurs");
  let chart = new Chart(dividend_container, "Asbis", "Dywidenda", "$");

  charts = [];
  charts.push(chart);
  draw();
}
function draw() {
  for(let i = 0; i < charts.length; i++) {
    charts[i].refresh();
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
