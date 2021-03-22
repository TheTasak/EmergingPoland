const DATA_DIVIDEND = [
              { id: 'd1', value: 0.03, date: '2016' },
              { id: 'd2', value: 0.06, date: '2017' },
              { id: 'd3', value: 0.10, date: '2018' },
              { id: 'd4', value: 0.135, date: '2019' },
              { id: 'd5', value: 0.1, date: '2020' }
            ];
const DATA_YEAR_PROFIT = [
              { id: 'd1', value: 70.103, date: '2010' },
              { id: 'd2', value: 81.126, date: '2011' },
              { id: 'd3', value: 86.327, date: '2012' },
              { id: 'd4', value: 115.571, date: '2013' },
              { id: 'd5', value: 87.749, date: '2014' },
              { id: 'd6', value: 46.649, date: '2015' },
              { id: 'd7', value: 65.414, date: '2016' },
              { id: 'd8', value: 76.736, date: '2017' },
              { id: 'd9', value: 98.093, date: '2018' },
              { id: 'd10', value: 104.146, date: '2019' }
            ];
const DATA_QUARTER_PROFIT = [
              { id: 'd1', value: 25.411, date: 'I kw' },
              { id: 'd2', value: 21.927, date: 'II kw' },
              { id: 'd3', value: 36.138, date: 'III kw' },
              { id: 'd4', value: 54.810, date: 'IV kw' }
            ];
var sql_data = [];
var charts = [];
function load(){
  /*d3.json("getdata.php").then(function(data){
		let array = data;
		for(let i = 0; i < array.length; i++) {
			let date = "20" + (10+i);
			let push_object_data = {id: "d"+(i+1), date: date, value: array[i]};
			sql_data.push(push_object_data);
		}
  });*/
  const dividend_container = document.getElementById("dywidenda");
  let chart = new Chart(dividend_container, DATA_DIVIDEND, "Dywidenda", "$");

  const sql_container = document.getElementById("kurs");
  let chart2 = new Chart(sql_container, sql_data, "Dane z SQLa", "mln$");

  const rok_container = document.getElementById("rok");
  let chart3 = new Chart(rok_container, DATA_YEAR_PROFIT, "Roczne zyski brutto", "mln$");

  const kwartal_container = document.getElementById("kwartal");
  let chart4 = new Chart(kwartal_container, DATA_QUARTER_PROFIT, "Zyski brutto za 2020", "mln$");

  charts.push(chart);
  charts.push(chart2);
  charts.push(chart3);
  charts.push(chart4);
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
