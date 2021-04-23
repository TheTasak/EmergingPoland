class TreeChart{
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
  #get_suffix = () => {
	  let max = d3.max(this._data.children, d => d.value);
	  if(max >= 1000000){
		  this._data.children.forEach((item) => item.value /= 1000000.0);
		  this.suffix = "mld$";
	  } else if(max >= 1000){
		  this._data.children.forEach((item) => item.value /= 1000.0);
		  this.suffix = "mln$";
    } else {
		  this.suffix = "tys$";
	  }
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
    d3.json("getearnings.php?stock_name=asbis&date=" + this.year).then((d) => {
      this._data = d;
      this._data.forEach((item, i) => {
        item.value = parseFloat(item.value);
      });
      this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
      this._data = {"name": "chart", "children": this._data};
      this.refresh();
    });
  }
  #draw_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.style("font-size", "30px")
			.style("padding", "0 10px")
			.text("Podział przychodów")
			.classed("chart-title", true);
    d3.select(this.container)
			.select(".button-div")
			.append("button")
			.attr("type", "button")
			.text("<")
			.on("click", this.#earlier_year)
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("span")
			.style("font-size", "36px")
			.style("padding", "0 10px")
			.text(this.year)
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("button")
			.attr("type", "button")
			.text(">")
			.on("click", this.#later_year)
			.classed("treechart-button", true);
  }
  #draw_chart = () => {
    let root = d3.hierarchy(this._data);
    this.#get_suffix();
    root.sum(d => d.value);

    let treemap_layout = d3.treemap();
    treemap_layout
      .size([this.width, this.svg_height])
      .paddingOuter(5);
    treemap_layout(root);
    let colors = d3.scaleLinear()
            .domain([d3.min(this._data.children, d => d.value), d3.max(this._data.children, d => d.value)])
            .range(["rgb(150,255,150)", "green"]);
    const g = this.svg.append("g");
    g.selectAll("rect")
          .data(root.descendants())
          .enter()
          .append("rect")
          .attr('x', d => d.x0)
          .attr('y', d => d.y0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('stroke', "white")
          .attr('stroke-width', "1")
          .classed("treechart-chunk", true);

    this.svg.selectAll(".treechart-chunk")
          .filter(d => {return d.data.name != "chart";})
            .attr("fill",d => colors(d.value));
    this.svg.selectAll(".treechart-chunk")
          .filter(d => {return d.data.name == "chart";})
            .attr("fill", "white");

    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .append("text")
            .attr("x", d => d.x0+5)
            .attr("y", d => d.y0+20)
            .filter( d => {return (d.x1 - d.x0)/d.data.name.length > 10 && d.data.name != "chart"; })
              .text(d => d.data.name)
              .attr("font-size", "15px")
              .attr("fill", "white");

    const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .style("fill", "white")
              .style("stroke", "black")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .classed("tooltip-text", true);
    this.svg.selectAll('.treechart-chunk')
  			.on("mousemove", (ev, d) => {
  				let tooltipsize = [(d.data.name.length + String(d.value).length)*12, this.height / 8];
          let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-80];
          tooltip
            .attr("x", tooltippos[0])
		        .attr("y", tooltippos[1])
		        .attr("width", tooltipsize[0])
		        .attr("height", tooltipsize[1])
            .style("opacity", "0.7");

  			tooltiptext
  				.attr("x", tooltippos[0] + tooltipsize[0]/2)
  				.attr("y", (tooltippos[1]+5) + tooltipsize[1]/2)
  				.attr("display", "inherit")
  				.text(d.data.name + " " + d.value + this.suffix);

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
