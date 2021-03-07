const DATA = [
              { id: 'd1', value: 20, region: 'USA' },
              { id: 'd2', value: 13, region: 'Poland' },
              { id: 'd3', value: 5, region: 'Russia' },
              { id: 'd4', value: 18, region: 'Ukraine' },
              { id: 'd5', value: 8, region: 'Germany' },
              { id: 'd6', value: 11, region: 'France' },
              { id: 'd7', value: 5, region: 'Slovenia' },
            ];

const container = document.getElementById("dywidenda");
const width = parseInt(container.offsetWidth);
const height = parseInt(container.offsetHeight);
const padding_vertical = 30;
const padding_horizontal = 20;
console.log(padding_vertical);
const svg = d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

const xScale = d3.scaleBand()
                .range([0, width-10])
                .padding(0.1)
                .domain(DATA.map((dataPoint) => dataPoint.region));
const yScale = d3.scaleLinear()
                .domain([0,d3.max(DATA, d => d.value)+1]).nice()
                .range([height-30,10]);

const g = svg.append("g")
            .attr("transform", "translate(20,0)");

g.append("g")
  .call(d3.axisBottom(xScale))
  .attr("transform","translate(0,270)");
g.append("g")
   .call(d3.axisLeft(yScale).tickFormat(function(d){
       return d;
   }).ticks(5))
   .append("text")
   .attr("dy", "1em")
   .attr("text-anchor", "end")
   .text("value");
const bars = svg
   .selectAll('.bar')
   .data(DATA)
   .enter()
   .append('rect')
   .classed('bar',true)
   .attr('width', xScale.bandwidth())
   .attr('height', (data) => height - yScale(data.value) - padding_vertical)
   .attr('x', data => xScale(data.region)+padding_horizontal)
   .attr('y', data => yScale(data.value));
