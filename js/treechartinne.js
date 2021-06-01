class TreeChartInne{
  year = 2020;
  _show_chart = true;
  current_chart_index = -1;
  current_chart_interval = -1;
  constructor(container, stock_name, start_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
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
		if(this.year >= 2020)
			return;
		this.year++;
		this.#load_data();
	}
  #change_chart = () => {
    const select_list_type = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_type != undefined)
      this.current_chart_index = select_list_type.value;
    else
      this.current_chart_index = 0;
    const select_list_interval = this.container.getElementsByClassName("chart-input")[1];
    if(select_list_interval != undefined)
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = "quarter1";
    this.current_data = this._data[this.current_chart_index];
    this.current_data.children.forEach((item, i) => {
      item.quarter1 = parseFloat(item.quarter1);
      item.quarter2 = parseFloat(item.quarter2);
      item.quarter3 = parseFloat(item.quarter3);
      item.quarter4 = parseFloat(item.quarter4);
      item.year = parseFloat(item.year);
    });
    this.current_data.children = this.current_data.children.filter( (d) => { return !isNaN(d[this.current_chart_interval]);});
    this.current_data.children.sort((a,b) => (a[this.current_chart_interval] < b[this.current_chart_interval]) ? 1 : -1);
    this.refresh();
  }
  #reset = () => {
    // Robi reset div'a wykresu, rysuje go od nowa
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
    if(this._show_chart) {
      this.svg = d3.select(this.container)
                    .select(".svg-div")
                    .append("svg")
                      .attr("height", this.svg_height)
                      .attr("width", this.width);
    }
  }
  #load_data = () => {
    d3.json("php/getinnedane.php?stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then((d) => {
      this._data = d;
      this.#change_chart();
    });
  }
  #draw_inputs = () => {
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
      .on("click", () => {this._show_chart = !this._show_chart; this.refresh();})
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
    const field_interval = d3.select(this.container)
                             .select(".chart-input-div")
				                        .append("select")
          				                .on("change", this.#load_data)
          				                .classed("chart-input", true);
    //Załadowanie opcji do pola
    let array_interval = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
    for(let i = 0; i < array_interval.length; i++){
  		field_interval.append("option")
  			         .attr("value", array_interval[i])
  			         .text(array_interval[i]);
  	}
    const select_list_interval = this.container.getElementsByClassName("chart-input")[1];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
  }
  #draw_chart = () => {
    let root = d3.hierarchy(this.current_data);
    root.sum(d => d[this.current_chart_interval]);

    let treemap_layout = d3.treemap();
    treemap_layout
      .size([this.width, this.svg_height])
      .paddingOuter(5);
    treemap_layout(root);
    let colors = d3.scaleLinear()
            .domain([d3.min(this.current_data.children, d => d[this.current_chart_interval]), d3.max(this.current_data.children, d => d[this.current_chart_interval])])
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
          .filter(d => {return d.data.name != this.current_data.name;})
            .attr("fill",d => colors(d.value));
    this.svg.selectAll(".treechart-chunk")
          .filter(d => {return d.data.name == this.current_data.name;})
            .attr("fill", "white");

    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .filter(d => (d.data.name != this.current_data.name && !isNaN(d.data[this.current_chart_interval])))
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
        .filter(d => {return d.data.name != this.current_data.name;})
  			.on("mousemove", (ev, d) => {
  				let tooltipsize = [(d.data.translate.length + String(d[this.current_chart_interval]).length)*12, this.height / 8];
          let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-100];

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
  				.text(d.data.translate + " " + d.data[this.current_chart_interval]);

  			})
  			.on("mouseout", function(ev, d){
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  #draw_table = () => {
    let data_string = '<table class="earnings-table">';
    let data_children = this.current_data.children;
    for(let i = 0; i < data_children.length; i++){
      data_string += "<tr><td align='center'>" + data_children[i].translate + "</td><td align='right'>" + data_children[i][this.current_chart_interval] + "</td></tr>";
    }
    data_string += "</table>";
    d3.select(this.container).select(".svg-div").html(data_string);
  }
  refresh = () => {
    this.#reset();
    this.#draw_inputs();
    if(this._show_chart)
      this.#draw_chart();
    else
      this.#draw_table();
  }
}
