class PieChart{
  year = 2020;
  constructor(container, stock_name){
    this.container = container;
    this.stock_name = stock_name;
    this.#load_data();
  }
  #earlier_year = () => {
		if(this.year <= 2010)
			return;
		this.year--;
		this.#load_data();
	}
	#later_year = () => {
		if(this.year >= 2020)
			return;
		this.year++;
		this.#load_data();
	}
  #reset = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    d3.select(this.container)
      .selectAll(".button-div")
      .remove();
      d3.select(this.container)
        .selectAll(".svg-div")
        .remove();
    this.svg_height = this.height*0.8;
		this.button_height = this.width*0.2;
    d3.select(this.container)
      .append("div")
        .attr("height", this.button_height)
        .attr("width", this.width)
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .attr("height", this.svg_height)
        .attr("width", this.width)
        .classed("svg-div", true);

    this.svg = d3.select(this.container)
                 .select(".svg-div")
                 .append("svg")
                  .attr("height", this.svg_height)
                  .attr("width", this.width);

  }
  #load_data = () => {
    d3.json("getgroupstocks.php?stock_name=asbis&date=" + this.year).then((d) => {
      this._data = d;
      this._data.forEach((item, i) => {
        item.value = parseInt(item.value);
      });
      this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
      this._data.forEach((item, i) => {
        item.id = parseInt(i);
      });
      this.refresh();
    });
  }
  #draw_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
  			.style("font-size", "30px")
  			.style("padding", "0 10px")
  			.text("Podział akcji spółki")
  			.classed("chart-title", true);
    d3.select(this.container)
			.select(".button-div")
			.append("button")
  			.attr("type", "button")
  			.text("<")
  			.on("click", this.#earlier_year)
  			.classed("piechart-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("span")
  			.style("font-size", "36px")
  			.style("padding", "0 10px")
  			.text(this.year)
  			.classed("piechart-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("button")
  			.attr("type", "button")
  			.text(">")
  			.on("click", this.#later_year)
  			.classed("piechart-button", true);
  }
  #draw_chart = () => {
    let radius = Math.min(this.width, this.svg_height) / 2;
    const g = d3.select(this.container).select("svg")
                .append("g")
                .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")");
    let colors = d3.scaleLinear()
                   .domain([0,this._data.length])
                   .range(["red", "black"]);
    let pie = d3.pie()
      .value( d => d.value);
    let data_ready = pie(this._data);

    let arc = d3.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius * 0.8);
    let outerArc = d3.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);

    g.selectAll(".pie-chunk")
            .data(data_ready)
            .enter()
            .append("path")
              .attr("d", arc)
              .attr("fill", d => colors(d.data.id))
              .classed("pie-chunk", true);

    g.selectAll(".pie-polyline")
            .data(data_ready)
            .enter()
            .append('polyline')
              .attr('stroke', 'black')
              .style('fill', 'none')
              .attr('stroke-width', 1)
              .attr('points', d => {
                  let posA = arc.centroid(d);
                  let posB = outerArc.centroid(d);
                  let posC = outerArc.centroid(d);
                  let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                  posC[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
                  return [posA, posB, posC];
              })
              .classed(".pie-polyline");

    g.selectAll(".pie-label")
            .data(data_ready)
            .enter()
            .append('text')
              .text( d => d.data.name)
              .attr('transform', d => {
                let pos = outerArc.centroid(d);
                let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
              })
              .style('text-anchor', d => {
                let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midAngle < Math.PI ? 'start' : 'end');
              });

    const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .style("fill", "white")
              .style("stroke", "black")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .classed("tooltip-text", true);
    this.svg.selectAll(".pie-chunk")
  			.on("mousemove", (ev, d) => {
  				let tooltipsize = [(d.data.name.length + String(d.value).length)*12, this.height / 8];
          let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-80];
          tooltip
            .attr("x", tooltippos[0])
		        .attr("y", tooltippos[1])
		        .attr("width", tooltipsize[0])
		        .attr("height", tooltipsize[1])
            .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")")
            .style("opacity", "0.7");

  			tooltiptext
  				.attr("x", tooltippos[0] + tooltipsize[0]/2)
  				.attr("y", (tooltippos[1]+5) + tooltipsize[1]/2)
          .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")")
  				.attr("display", "inherit")
  				.text(d.data.name + " " + d.value);
  			})
  			.on("mouseout", function(ev, d){
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  refresh = () => {
    this.#reset();
    this.#draw_inputs();
    this.#draw_chart();
  }
}
