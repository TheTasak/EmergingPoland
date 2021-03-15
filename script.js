const DATA = [
              { id: 'd1', value: 0.03, date: '2016' },
              { id: 'd2', value: 0.06, date: '2017' },
              { id: 'd3', value: 0.10, date: '2018' },
              { id: 'd4', value: 0.135, date: '2019' },
              { id: 'd5', value: 0.1, date: '2020' },
            ];
d3.json("getdata.php", function(data){
  console.log(data);
});
const container = document.getElementById("dywidenda");
let chart = new Chart(container, DATA, "Dywidenda");
const cont = document.getElementById("rok");
let chart2 = new Chart(cont, DATA, "Zyski netto");
function draw()
{
  chart.refresh();
  chart2.refresh();
}
window.onload = draw;
window.onresize = draw;
