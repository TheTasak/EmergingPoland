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
      console.log(this._data);
      this.refresh();
    });
  }
  #draw_inputs = () => {
  }
  #draw_chart = () => {
    let radius = Math.min(this.width, this.svg_height) / 2;
    const g = d3.select(this.container).select("svg")
                .append("g")
                .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")");
    let colors = d3.scaleLinear()
            .domain([0, d3.max(this._data, d => d.value)])
            .range(["white", "green"]);
    let pie = d3.pie()
      .value( d => d.value);
    let data_ready = pie(this._data);

    g.selectAll(".pie-chunk")
            .data(data_ready)
            .enter()
            .append("path")
              .attr("d", d3.arc().innerRadius(100).outerRadius(radius))
              .attr("fill", d => colors(d.value))
              .attr("stroke", "black")
              .style("stroke-width", "1");
  }
  refresh = () => {
    this.#reset();
    this.#draw_inputs();
    this.#draw_chart();
  }
}
