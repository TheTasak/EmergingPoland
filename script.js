const container = document.getElementById("dywidenda");
const svg = d3.select(container)
            .append("svg");
const DATA = [
              { id: 'd1', value: 20, region: 'USA' },
              { id: 'd2', value: 13, region: 'Poland' },
              { id: 'd3', value: 5, region: 'Russia' },
              { id: 'd4', value: 18, region: 'Ukraine' },
              { id: 'd5', value: 8, region: 'Germany' },
              { id: 'd6', value: 11, region: 'France' },
              { id: 'd7', value: 5, region: 'Slovenia' }
            ];

function redraw() {

  var width = container.clientWidth;
  var height = container.clientHeight;
  console.log(width + " " + height);
  svg
    .attr("width", width)
    .attr("height", height);

  const xScale = d3
                  .scaleBand()
                  .domain(DATA.map((dataPoint) => dataPoint.region))
                  .rangeRound([0, width])
                  .padding(0.1);
  const yScale = d3.scaleLinear().domain([0,25]).range([height,0]);
  const bars = svg
    .selectAll('.bar')
    .data(DATA)
    .enter()
    .append('rect')
    .classed('bar',true)
    .attr('width', xScale.bandwidth())
    .attr('height', (data) => height - yScale(data.value))
    .attr('x', data => xScale(data.region))
    .attr('y', data => yScale(data.value));
}
redraw();
window.addEventListener("resize", redraw);
