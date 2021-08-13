class TreeChartUdzial{
  _show_chart = true;
  current_chart_index = -1;
  max_font_size = 24;
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
    d3.json("php/getudzialdane.php?stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then((d) => {
      this._data = d;
      this.change_chart();
      this.init();
    });
  }
  change_chart = () => {
    const select_list_type = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_type != undefined && select_list_type.value < this._data.length) {
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
  init = () => {
    // Robi reset div'a wykresu, rysuje go od nowa
    d3.select(this.container)
      .html("");
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
			.text("Udział")
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
    const field_type = d3.select(this.container)
                    .select(".button-div")
                    .append("div")
					             .classed("chart-input-div", true)
					             .append("select")
				                 .on("change", this.load_data)
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
          .attr("fill", d => colors(d.value))
          .classed("treechart-chunk", true);
    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .filter(d => (d.data.name != this.current_data.name && !isNaN(d.data.year)))
          .append("text")
            .text(d => d.data.translate)
            .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
            .attr("y", d =>  {
              let cut_text = parseInt((d.x1 - d.x0) / d.data.translate.length);
              cut_text = (cut_text > 36 ? 36 : cut_text);
              cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
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
        .on("mouseover", (ev, d) => {
          this.svg.selectAll(".treechart-chunk")
                  .style("opacity", "0.4");
          ev.target.style.opacity = "1";
        })
  			.on("mousemove", (ev, d) => {
          let text = d.data.translate + " " + parseFloat(d.data.year*100).toFixed(2) + "%";
  				let tooltipsize = [text.length*10+10, 40];
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
  				.text(text);
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
    let font_size = parseInt(this.width / d3.max(this.current_data.children, d => String(d.translate).length));
    font_size = (font_size > this.max_font_size ?  this.max_font_size : font_size);

    let rows = d3.select(this.container).select(".svg-div")
                  .append("div")
                    .classed("earnings-table", true)
                    .append("table")
                    .selectAll(".rows")
                    .data(this.current_data.children)
                    .enter()
                      .append("tr")
                      .style("font-size", font_size + "px");
    rows.append("td")
        .style("text-align", "center")
        .html(d => d.translate);
    rows.append("td")
        .style("text-align", "right")
        .html(d => parseFloat(d.year*100).toFixed(2) + "%");
  }
  update_table = () => {
    let font_size = parseInt(this.width / d3.max(this.current_data.children, d => String(d.translate).length));
    font_size = (font_size > this.max_font_size ?  this.max_font_size : font_size);

    d3.select(this.container).select(".earnings-table table")
      .selectAll("tr")
      .style("font-size", font_size + "px");
  }
  refresh = () => {
    this.update();
    if(this._show_chart) {
      this.init_chart();
    } else {
      this.update_table();
    }
  }
}
