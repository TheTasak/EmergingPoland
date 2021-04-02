var charts = [];

function load(){
  const container1 = document.getElementById("kurs");
  let chart1 = new Chart(container1, "Asbis", "dywidenda", "$");
  const container2 = document.getElementById("sklad");
  let chart2 = new Chart(container2, "Asbis", "koszt_sprzedazy", "$");
  const container3 = document.getElementById("kwartal");
  let chart3 = new Chart(container3, "Asbis", "przychody", "$");
  charts = [];
  charts.push(chart1);
  charts.push(chart2);
  charts.push(chart3);
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
