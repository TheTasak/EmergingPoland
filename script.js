const DATA = [
              { id: 'd1', value: 0.03, date: '2016' },
              { id: 'd2', value: 0.06, date: '2017' },
              { id: 'd3', value: 0.10, date: '2018' },
              { id: 'd4', value: 0.135, date: '2019' },
              { id: 'd5', value: 0.1, date: '2020' },
            ];
const container = document.getElementById("dywidenda");
let chart = new Chart(container, DATA);
const cont = document.getElementById("rok");
let chart2 = new Chart(cont, DATA);
function draw()
{
  chart.draw();
  chart2.draw();
}
function refresh_data()
{
  let number = document.getElementById("liczba");
  DATA[0].value = number;
}
window.onload = draw;
window.onresize = draw;
