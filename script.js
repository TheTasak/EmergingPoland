const DATA = [
              { id: 'd1', value: 0.03, date: '2016' },
              { id: 'd2', value: 0.06, date: '2017' },
              { id: 'd3', value: 0.10, date: '2018' },
              { id: 'd4', value: 0.135, date: '2019' },
              { id: 'd5', value: 0.1, date: '2020' },
            ];

const container = document.getElementById("dywidenda");

function redraw() {
  const width = parseInt(container.offsetWidth);
  const height = parseInt(container.offsetHeight);

  const padding_vertical = 20;
  const padding_horizontal = 90;

  // Usunięcie starego wykresu
  const old_svg = d3.select(container)
                .selectAll(".chart")
                .remove();
  // Dodanie nowego kontenera na wykres
  const svg = d3.select(container)
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .classed("chart",true);
  // Ustawienie skali i domeny osi x
  const xScale = d3.scaleBand()
                  .range([0, width-padding_horizontal])
                  .padding(0.4)
                  .domain(DATA.map((dataPoint) => dataPoint.date));
  // Ustawienie skali i domeny osi y
  const yScale = d3.scaleLinear()
                  .domain([0,d3.max(DATA, d => d.value)*1.1]).nice()
                  .range([height-padding_vertical,padding_vertical]);

  const g = svg.append("g")
              .attr("transform", "translate(" + padding_horizontal*(2/3) + ",0)");
  const heightpadding = height-padding_vertical;
  // Dodanie dolnej osi wykresu
  g.append("g")
    .classed("axis",true)
    .call(d3.axisBottom(xScale))
    .attr("transform","translate(0," + heightpadding + ")");
  // Dodanie lewej osi wykresu
  g.append("g")
     .classed("axis",true)
     .call(d3.axisLeft(yScale).tickFormat(function(d){
         return "$" + d;
     }).ticks(10))
     .append("text")
     .attr("text-anchor", "end")
     .text("value");
  // Dodanie słupków wartości
  const bars = svg
     .selectAll('.bar')
     .data(DATA)
     .enter()
     .append('rect')
     .classed('bar',true)
     .attr('width', xScale.bandwidth())
     .attr('height', 0)
     .attr('x', data => xScale(data.date)+padding_horizontal-padding_horizontal/3)
     .attr('y', data => yScale(0));
  // Animacja pojawiania się słupków z opóźnieniem
  svg.selectAll("rect")
     .transition()
     .duration(800)
     .attr("y", data => yScale(data.value) )
     .attr("height", (data) => height - yScale(data.value) - padding_vertical)
     .delay(function(d,i){return(i*200)});

  // Dodanie tytułu wykresu
  svg.append("text")
       .attr("x", (width / 2))
       .attr("y", padding_vertical/2 + padding_vertical)
       .attr("text-anchor", "middle")
       .attr("font-size", "20px")
       .text("Dywidenda");
}
redraw();
// Ustawienie odświeżania po zmianie wielkości okna
window.onresize = redraw;
