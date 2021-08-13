class AkcjeChart{
  show_table = false;
  constructor(container, stock_name, start_year, end_year){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.year = this.end_year;
  }
  set_year = (year) => {
    this.year = year;
    this.load_data();
  }
  load_data = () => {
    d3.json("php/getgroupstocks.php?stock_name=" + this.stock_name + "&date=" + this.year).then((d) => {
      this._data = d;
      this._data.forEach((item, i) => {
        item.value = parseInt(item.value);
      });
      this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
      this._data = {"name": "chart", "translate": "", "children": this._data};
      this.init();
    }).catch(error => {
        console.error(error);
    });
  }
  init = () => {
    d3.select(this.container)
      .html("");
    d3.select(this.container)
      .append("div")
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .classed("svg-div", true);
    if(!this.show_table) {
      this.svg = d3.select(this.container)
                   .select(".svg-div")
                   .append("svg");
    }
    this.update();
    this.draw_inputs();
    if(this.show_table) {
      this.draw_table();
    } else {
      this.draw_chart();
    }
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight);
    this.svg_height = this.height*0.8;
		this.button_height = this.width*0.2;
    d3.select(this.container)
      .select(".button-div")
      .attr("height", this.button_height)
      .attr("width", this.width);
    d3.select(this.container)
      .select(".svg-div")
      .attr("height", this.svg_height)
      .attr("width", this.width);
    if(!this.show_table) {
      this.svg.attr("height", this.svg_height)
              .attr("width", this.width);
    }
  }
  draw_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
  			.text("Podział akcji spółki")
  			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
      .append("div");
    d3.select(this.container)
      .select(".button-div")
      .append("span")
        .classed("year-small", true)
        .html(this.start_year);
    for(let i = this.start_year; i <= this.end_year; i++) {
      let dot = d3.select(this.container)
                  .select(".button-div")
                  .append("span")
                    .classed("dot", true)
                    .on("click", (ev) => this.set_year(i));
      if(this.year == i) {
        dot.classed("clicked-dot", true);
      }
    }
    d3.select(this.container)
      .select(".button-div")
      .append("span")
        .classed("year-small", true)
        .html(this.end_year);
    d3.select(this.container)
      .select(".button-div")
      .append("div");
  }
  draw_chart = () => {
    if(this._data.children.length == 0) {
      this.svg.append("text")
              .attr("text-anchor", "middle")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2)
              .text("Brak danych")
              .attr("fill", "black")
              .attr("font-size", "26px");
      return;
    }
    let root = d3.hierarchy(this._data);
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
          .filter(d => d.data.name != "chart")
          .append("rect")
          .attr('x', d => d.x0)
          .attr('y', d => d.y0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('stroke', "black")
          .attr('stroke-width', "1")
          .attr("fill",d => colors(d.value))
          .classed("treechart-chunk", true);

    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != "chart")
          .append("text")
            .text(d => d.data.name)
            .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
            .attr("y", d =>  {
              let cut_text = parseInt((d.x1 - d.x0) / d.data.name.length);
              cut_text = (cut_text > 26 ? 26 : cut_text);
              cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
              return d.y0 + (d.y1 - d.y0) / 2 + (cut_text / 2);
            })
            .attr("font-family", "monospace")
            .attr("font-size", (d) => {
                let cut_text = parseInt((d.x1 - d.x0) / d.data.name.length);
                cut_text = (cut_text > 26 ? 26 : cut_text);
                cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
                return String(cut_text*1.4) + "px";
            })
            .style("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .attr("fill", "white");

    const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .style("fill", "white")
              .attr("rx", "20px")
              .attr("ry", "20px")
              .style("stroke", "black")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .classed("tooltip-text", true);
    this.svg.selectAll('.treechart-chunk')
        .on("mouseover", (ev, d) => {
          this.svg.selectAll(".treechart-chunk")
                  .style("opacity", "0.4");
          ev.target.style.opacity = "1";
        })
  			.on("mousemove", (ev, d) => {
          let value = d.data.name + " " + splitValue(String(d.value));
  				let tooltipsize = [String(value).length*10+10, 40];
          let tooltippos = [ev.offsetX, ev.offsetY];

          if(tooltippos[0]+tooltipsize[0] > this.width)
            tooltippos[0] = this.width - tooltipsize[0];
          if(tooltippos[0] < 0)
            tooltippos[0] = 0;

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
          .classed("tooltip-text", true)
  				.text(value);

  			})
  			.on("mouseout", (ev, d) => {
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptext
  					.attr("display", "none");

          this.svg.selectAll(".treechart-chunk")
                  .style("opacity", "1");
  			});
  }
  draw_table = () => {
    let stock_string = '<table class="stock-table">';
		for(let i = 0; i < this._data.children.length; i++){
      let value = String(this._data.children[i].value);
			stock_string += "<tr><td align='center'>" + this._data.children[i].name + "</td><td align='right'>" + splitValue(value) + "</td></tr>";
		}
    stock_string += "<tr><td align='center'>" + "Suma akcji:" + "</td><td align='right'>" + splitValue(String(parseInt(d3.sum(this._data.children, d => d.value)))) + "</td></tr>";
		stock_string += "</table>";
		d3.select(this.container).select(".svg-div").html(stock_string);
  }
  refresh = () => {
    this.init();
    this.update();
    if(this.show_table) {
      this.draw_table();
    } else {
      this.draw_chart();
    }
  }
}
