const DATA = [
              { id: 'd1', value: 0.03, date: '2016' },
              { id: 'd2', value: 0.06, date: '2017' },
              { id: 'd3', value: 0.10, date: '2018' },
              { id: 'd4', value: 0.135, date: '2019' },
              { id: 'd5', value: 0.1, date: '2020' },
            ];

const container = document.getElementById("dywidenda");
const width = parseInt(container.offsetWidth);
const height = parseInt(container.offsetHeight);
const padding_vertical = 20;
const padding_horizontal = 50;
console.log(padding_vertical);
const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

const xScale = d3.scaleBand()
                .range([0, width-padding_horizontal])
                .padding(0.1)
                .domain(DATA.map((dataPoint) => dataPoint.date));
const yScale = d3.scaleLinear()
                .domain([0,d3.max(DATA, d => d.value)*1.1]).nice()
                .range([height-20,20]);

const g = svg.append("g")
            .attr("transform", "translate(40,0)");

g.append("g") //dolna oś
  .call(d3.axisBottom(xScale))
  .attr("transform","translate(0,380)");
g.append("g") //lewa oś
   .call(d3.axisLeft(yScale).tickFormat(function(d){
       return "$" + d;
   }).ticks(10))
   .append("text")
   .attr("dy", "1em")
   .attr("text-anchor", "end")
   .text("value");

const bars = svg //słupki wykresu
   .selectAll('.bar')
   .data(DATA)
   .enter()
   .append('rect')
   .classed('bar',true)
   .attr('width', xScale.bandwidth())
   .attr('height', (data) => height - yScale(data.value) - padding_vertical)
   .attr('x', data => xScale(data.date)+padding_horizontal)
   .attr('y', data => yScale(data.value));

 svg.append("text") //nazwa wykresu
           .attr("x", (width / 2))
           .attr("y", 10 + padding_vertical)
           .attr("text-anchor", "middle")
           .attr("font-size", "20px")
           .text("Dywidenda");
