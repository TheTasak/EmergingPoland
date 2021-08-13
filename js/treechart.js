class TreeChart{
  _show_chart = true;
  current_chart_interval = -1;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.year = this.end_year;
    this.currency = currency;
    this.language = language;
  }
  set_year = (year) => {
    this.year = year;
    this.load_data();
  }
  load_data = () => {
    d3.json("php/getearnings.php?stock_name=" + this.stock_name + "&date=" + this.year + "&lang=" + this.language).then((d) => {
      this._data = d;
      this.change_chart();
      this.get_suffix();
      this.init();
    });
  }
  change_chart = () => {
    let temp_array = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
		this.array_interval = [];
		temp_array.forEach((item, i) => {
			let new_arr = d3.map(this._data, d => d[item]).filter(value => value != undefined && !isNaN(value));
			if(new_arr.length != 0)
				this.array_interval.push(item);
		});
    const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_interval != undefined && this.array_interval.includes(select_list_interval.value))
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = this.array_interval[this.array_interval.length-1];
    this._data.forEach((item, i) => {
      item[this.current_chart_interval] = parseFloat(item[this.current_chart_interval]);
    });
    this.current_data = d3.filter(this._data, d => !isNaN(d[this.current_chart_interval]));
    this.current_data.sort((a,b) => (a[this.current_chart_interval] < b[this.current_chart_interval]) ? 1 : -1);
    this.current_data = {"name": "chart", "translate": "", "children": this.current_data};
  }
  get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let max = d3.max(this.current_data.children, d => d[this.current_chart_interval]);
	  if(max >= 1000){
		  this.current_data.children.forEach((item) => item[this.current_chart_interval] /= 1000.0);
		  this.suffix = "mln";
    } else {
		  this.suffix = "tys";
	  }
  }
  init = () => {
    // Robi reset div'a wykresu, rysuje go od nowa
    d3.select(this.container)
      .selectAll(".button-div")
      .remove();
      d3.select(this.container)
        .selectAll(".svg-div")
        .remove();
    d3.select(this.container)
      .append("div")
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .classed("svg-div", true);
    if(this._show_chart) {
      this.svg = d3.select(this.container)
                    .select(".svg-div")
                    .append("svg");
    }
    this.update();
    this.init_inputs();
    if(this._show_chart) {
      this.init_chart();
    } else {
      this.init_table();
    }
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    this.svg_height = this.height*0.75;
		this.button_height = this.width*0.25;
    d3.select(this.container)
      .select(".button-div")
      .attr("height", this.button_height)
      .attr("width", this.width);
    d3.select(this.container)
      .select(".svg-div")
      .attr("height", this.svg_height)
      .attr("width", this.width);
    if(this._show_chart) {
      this.svg
        .attr("height", this.svg_height)
        .attr("width", this.width);
    }
  }
  init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Podział przychodów " + this.year)
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
    const field_interval = d3.select(this.container)
                             .select(".button-div")
				                        .append("select")
          				                .on("change", this.load_data)
          				                .classed("chart-input", true);
    for(let i = 0; i < this.array_interval.length; i++){
  		field_interval.append("option")
  			         .attr("value", this.array_interval[i])
  			         .text(this.array_interval[i]);
  	}
    const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
  }
  init_chart = () => {
    this.svg.html("");
    if(this.current_data.children.length == 0) {
      this.svg.append("text")
              .attr("text-anchor", "middle")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2)
              .text("Brak danych")
              .attr("fill", "black")
              .attr("font-size", "26px");
      return;
    }
    const data = Object.assign({}, this.current_data);
    data.children = d3.filter(data.children, d => d[this.current_chart_interval] > 0);
    let root = d3.hierarchy(data);
    root.sum(d => d[this.current_chart_interval]);

    let treemap_layout = d3.treemap();
    treemap_layout
      .size([this.width, this.svg_height])
      .paddingOuter(5);
    treemap_layout(root);
    let colors = d3.scaleLinear()
            .domain([d3.min(data.children, d => d[this.current_chart_interval]),d3.max(data.children, d => d[this.current_chart_interval])])
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
          .attr("fill", d => colors(d.data[this.current_chart_interval]))
          .classed("treechart-chunk", true);

    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != "chart")
          .append("text")
            .text(d => d.data.translate)
            .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
            .attr("y", d =>  {
              let cut_text = parseInt((d.x1 - d.x0) / d.data.translate.length);
              cut_text = cut_text > 36 ? 36 : cut_text;
              cut_text = cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text;
              return d.y0 + (d.y1 - d.y0) / 2 + (cut_text / 2);
            })
            .attr("font-family", "monospace")
            .attr("font-size", (d) => {
                let cut_text = parseInt((d.x1 - d.x0) / d.data.translate.length);
                cut_text = (cut_text > 36 ? 36 : cut_text);
                cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
                return String(cut_text) + "px";
            })
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .style("text-anchor", "middle")
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
  				let tooltipsize = [String(d.data.translate + splitValue(d.data[this.current_chart_interval]) + this.suffix + this.currency).length*10+10, 40];
          let tooltippos = [ev.offsetX, ev.offsetY];

          if(tooltippos[0]+tooltipsize[0] > this.width)
            tooltippos[0] = this.width - tooltipsize[0];

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
  				.text(d.data.translate + " " + splitValue(d.data[this.current_chart_interval]) + this.suffix + " " + this.currency);

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
  init_table = () => {
    d3.select(this.container).select(".svg-div")
      .append("div")
        .classed("earnings-table", true);
    let earnings_string = '<table>';
		for(let i = 0; i < this.current_data.children.length; i++){
			earnings_string += "<tr><td align='center'>" + this.current_data.children[i].translate + "</td><td align='right'>" + this.current_data.children[i][this.current_chart_interval] + this.suffix + " " + this.currency + "</td></tr>";
		}
    earnings_string += "<tr><td align='center'>" + "Suma przychodów:" + "</td><td align='right'>" + parseFloat(d3.sum(this.current_data.children, d => d[this.current_chart_interval])).toFixed(4) + this.suffix + " " + this.currency + "</td></tr>";
		earnings_string += "</table>";
		d3.select(this.container).select(".earnings-table").html(earnings_string);
  }
  refresh = () => {
    this.update();
    if(this._show_chart) {
        this.init_chart();
    }
  }
}
