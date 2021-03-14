class Chart{
  width = 0;
  height = 0;
  padding_vertical = 20;
  padding_horizontal = 90;
  constructor(container, data){
    this.container = container;
    this.data = data;
  }
  draw = () => {
    this.width = parseInt(this.container.offsetWidth);
    this.height = parseInt(this.container.offsetHeight);
    this.heightpadding = this.height - this.padding_vertical;
    // Usunięcie starego wykresu
    const old_svg = d3.select(this.container)
                  .selectAll(".chart")
                  .remove();
    // Dodanie nowego kontenera na wykres
    const svg = d3.select(this.container)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .classed("chart",true);
    // Ustawienie skali i domeny osi x
    const xScale = d3.scaleBand()
                    .range([0, this.width-this.padding_horizontal])
                    .padding(0.4)
                    .domain(this.data.map((dataPoint) => dataPoint.date));
    // Ustawienie skali i domeny osi y
    const yScale = d3.scaleLinear()
                    .domain([0,d3.max(this.data, d => d.value)*1.1]).nice()
                    .range([this.height-this.padding_vertical,this.padding_vertical]);
    const g = svg.append("g")
                .attr("transform", "translate(" + this.padding_horizontal*(2/3) + ",0)");
    // Dodanie dolnej osi wykresu
    g.append("g")
      .classed("axis",true)
      .call(d3.axisBottom(xScale))
      .attr("transform","translate(0," + this.heightpadding + ")");
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
       .data(this.data)
       .enter()
       .append('rect')
       .classed('bar',true)
       .attr('width', xScale.bandwidth())
       .attr('height', 0)
       .attr('x', data => xScale(data.date)+this.padding_horizontal-this.padding_horizontal/3)
       .attr('y', data => yScale(0));
    // Animacja pojawiania się słupków z opóźnieniem
    svg.selectAll("rect")
       .transition()
       .duration(800)
       .attr("y", data => yScale(data.value) )
       .attr("height", data => this.height - yScale(data.value) - this.padding_vertical)
       .delay(function(d,i){return(i*200)});

    // Dodanie tytułu wykresu
    svg.append("text")
         .attr("x", (this.width / 2))
         .attr("y", this.padding_vertical/2 + this.padding_vertical)
         .attr("text-anchor", "middle")
         .attr("font-size", "20px")
         .text("Dywidenda");
  }
}
