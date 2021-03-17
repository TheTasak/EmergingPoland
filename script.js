const DATA = [
              { id: 'd1', value: 0.03, date: '2016' },
              { id: 'd2', value: 0.06, date: '2017' },
              { id: 'd3', value: 0.10, date: '2018' },
              { id: 'd4', value: 0.135, date: '2019' },
              { id: 'd5', value: 0.1, date: '2020' },
            ];
var sql_data = [];
var charts = [];
function load(){
  d3.json("getdata.php").then(function(data){
  	let array = data[0];
  	console.log(array);
  	for(let i = 0; i < Object.keys(array).length; i++) {
  		if(!isNaN(parseInt(Object.keys(array)[i]))) {
  			let push_object_data = {id: "d"+(i+1), date: Object.keys(array)[i], value: array[Object.keys(array)[i]]};
  			sql_data.push(push_object_data);
  		}
  	}
  });
  const container = document.getElementById("dywidenda");
  let chart = new Chart(container, DATA, "Dywidenda");

  const sql_container = document.getElementById("rok");
  let chart2 = new Chart(sql_container, sql_data, "Dane z SQLa");
  charts.push(chart);
  charts.push(chart2);
  draw();
}
function draw() {
  for(let i = 0; i < charts.length; i++) {
    charts[i].refresh();
  }
}
function openNav() {
  document.getElementById("sidenav").style.width = "25%";
}
function closeNav() {
  document.getElementById("sidenav").style.width = "0px";
}
window.onload = load;
window.onresize = draw;
