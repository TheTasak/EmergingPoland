class TreeChartUdzial{
  year = 2020;
  _show_chart = true;
  current_chart_index = -1;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year;
    this.currency = currency;
    this.language = language;
    this.#load_data();
  }
  #earlier_year = () => {
		if(this.year <= this.start_year)
			return;
		this.year--;
		this.#load_data();
	}
	#later_year = () => {
		if(this.year >= this.end_year)
			return;
		this.year++;
		this.#load_data();
	}
  #change_chart = () => {
    const select_list_type = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_type != undefined) {
      if(select_list_type.value >= this._data.length)
        this.current_chart_index = 0;
      else
        this.current_chart_index = select_list_type.value;
    }
    else
      this.current_chart_index = 0;
    this.current_data = this._data[this.current_chart_index];
    this.current_data.children.forEach((item, i) => {
      item.year = parseFloat(item.year);
    });
    this.current_data.children = this.current_data.children.filter( (d) => { return !isNaN(d.year);});
    this.current_data.children.sort((a,b) => (a.year < b.year) ? 1 : -1);
  }
  #init = () => {
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
    this.#update();
    this.#init_inputs();
    if(this._show_chart) {
      this.#init_chart();
    } else {
      this.#init_table();
    }
  }
  #update = () => {
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
    if(this._show_chart) {
      this.svg
        .attr("height", this.svg_height)
        .attr("width", this.width);
    }
  }
  #load_data = () => {
    d3.json("php/getudzialdane.php?stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then((d) => {
      this._data = d;
      this.#change_chart();
      this.#init();
    });
  }
  #init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Inne dane")
			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
        .append("div")
        .classed("tree-button-div", true);
    d3.select(this.container)
			.select(".tree-button-div")
			.append("button")
			.attr("type", "button")
			.text("🠔")
			.on("click", this.#earlier_year)
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".tree-button-div")
			.append("span")
			.style("padding", "0 10px")
			.text(this.year)
      .on("click", () => {this._show_chart = !this._show_chart; this.#init();})
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".tree-button-div")
			.append("button")
			.attr("type", "button")
			.text("🠖")
			.on("click", this.#later_year)
			.classed("treechart-button", true);
    const field_type = d3.select(this.container)
                    .select(".tree-button-div")
                    .append("div")
					             .classed("chart-input-div", true)
					             .append("select")
				                 .on("change", this.#load_data)
				                 .classed("chart-input", true);
    //Załadowanie opcji do pola
  	for(let i = 0; i < this._data.length; i++){
  		field_type.append("option")
  			         .attr("value", i)
  			         .text(this._data[i].name);
  	}
    //Ustawienie opcji pola na ostatnio wybraną
  	const select_list_type = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_type != undefined){
      select_list_type.value = this.current_chart_index;
  	}
  }
  #init_chart = () => {
    this.svg.html("");
    let root = d3.hierarchy(this.current_data);
    root.sum(d => d.year);

    let treemap_layout = d3.treemap();
    treemap_layout
      .size([this.width, this.svg_height])
      .paddingOuter(5);
    treemap_layout(root);
    let colors = d3.scaleLinear()
            .domain([d3.min(this.current_data.children, d => d.year), d3.max(this.current_data.children, d => d.year)])
            .range(["rgb(150,255,150)", "green"]);
    const g = this.svg.append("g");
    g.selectAll("rect")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != this.current_data.name)
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
          .filter(d => (d.data.name != this.current_data.name && !isNaN(d.data.year)))
          .append("text")
            .text(d => d.data.translate)
            .attr("x", d => d.x0+5)
            .attr("y", (d) => {
              let cut_text = parseInt((d.x1 - d.x0) / d.data.translate.length);
              if(cut_text*1.4 > 26)
                cut_text = 24;
              return d.y0+(cut_text*1.4);
            })
            .attr("font-family", "monospace")
            .attr("font-size", (d) => {
                let cut_text = parseInt((d.x1 - d.x0) / d.data.translate.length);
                if(cut_text*1.4 > 26)
                  cut_text = 24;
                return String(cut_text*1.4) + "px";
            })
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .attr("fill", "white");
    const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .attr("rx", "20px")
              .attr("ry", "20px")
              .style("fill", "white")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .style("stroke", "black")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .classed("tooltip-text", true);
    this.svg.selectAll('.treechart-chunk')
        .filter(d => {return d.data.name != this.current_data.name;})
  			.on("mousemove", (ev, d) => {
  				let tooltipsize = [String(d.data.translate + " " + parseFloat(d.data.year*100).toFixed(2) + "%").length*12, 40];
          let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-tooltipsize[1]-10];

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
  				.text(d.data.translate + " " + parseFloat(d.data.year*100).toFixed(2) + "%");
  			})
  			.on("mouseout", function(ev, d){
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  #init_table = () => {
    let data_string = '<table class="earnings-table">';
    let data_children = this.current_data.children;
    for(let i = 0; i < data_children.length; i++){
      data_string += "<tr><td align='center'>" + data_children[i].translate + "</td><td align='right'>" + parseFloat(data_children[i].year*100).toFixed(2) + "%" + "</td></tr>";
    }
    data_string += "</table>";
    d3.select(this.container).select(".svg-div").html(data_string);
  }
  refresh = () => {
    this.#update();
    if(this._show_chart) {
        this.#init_chart();
    }
  }
}
