class CircleChart{
  year = 2020;
  _show_chart = true;
  current_chart_index = -1;
  current_chart_interval = -1;
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
  #load_data = () => {
    d3.json("php/getinnedane.php?stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then((d) => {
      this._data = d;
      this.#change_chart();
      this.#init();
      this.#update_chart();
    });
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
  }
  #init = () => {
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
    this.svg = d3.select(this.container)
                  .select(".svg-div")
                  .append("svg");
    this.#update();
    this.#init_inputs();
    this.#init_chart();
  }
  #update = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    this.svg_height = this.height*0.8;
		this.button_height = this.width*0.2;
    d3.select(".button-div")
      .attr("height", this.button_height)
      .attr("width", this.width);
    d3.select(".svg-div")
      .attr("height", this.svg_height)
      .attr("width", this.width);
    this.svg
      .attr("height", this.svg_height)
      .attr("width", this.width);
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
  #init_chart = () => {
    const scale = d3.scaleLinear()
                    .domain([d3.min(this.current_data.children, d => d[this.current_chart_interval]),d3.max(this.current_data.children, d => d[this.current_chart_interval])])
                    .range([20, 120]);
    const g = this.svg.append("g");
    this.node = g.selectAll("circle")
                   .data(this.current_data.children)
                   .enter()
                   .append("circle")
                    .attr("r", d => scale(d[this.current_chart_interval]))
                    .attr("cx", this.width / 2)
                    .attr("cy", this.svg_height / 2)
                    .style("fill", "#66a3b2")
                    .style("fill-opacity", 0.5)
                    .attr("stroke", "#66a2b3")
                    .style("stroke-width", 3)
                    .classed("circle-node", true)
                    .call(d3.drag()
                            .on("start", d => {
                              if (!d.target.active)
                                this.simulation.alphaTarget(0.3).restart();
                            })
                            .on("drag", d => {
                              tooltip
                      					.style("opacity", "0")
                                .attr("width", 0);
                      				tooltiptext
                      					.attr("display", "none");
                              d.subject.x = d.x;
                              d.subject.y = d.y;
                            })
                            .on("end", d => {
                              if (!d.target.active)
                                this.simulation.alphaTarget(0.3);
                            }));

    const node_text = g.selectAll("text")
                        .data(this.current_data.children)
                        .enter()
                        .append("text")
                          .text(d => d.translate)
                          .attr("font-family", "monospace")
                          .attr("pointer-events", "none")
                          .style("user-select", "none")
                          .attr("text-anchor", "middle")
                          .attr("font-size", (d) => {
                              let cut_text = scale(d[this.current_chart_interval])*2 / d.translate.length;
                              if(cut_text*1.4 > 26)
                                cut_text = 24;
                              return String(cut_text*1.4) + "px";
                          })
                          .attr("fill", "black");
    this.simulation = d3.forceSimulation()
                         .force("manyBody", d3.forceManyBody().strength(10))
                         .force("collide", d3.forceCollide().strength(.25).radius( d => scale(d[this.current_chart_interval])+3).iterations(1))
                         .alpha(0.03)
                         .restart();
    this.simulation.nodes(this.current_data.children)
               .on("tick", () => {
                 this.node
                     .attr("cx", d => d.x)
                     .attr("cy", d => d.y);
                 node_text
                     .attr("x", d => d.x)
                     .attr("y", d => d.y + scale(d[this.current_chart_interval]) / 10);
               });
    // Dodanie tooltipa pokazującego wartość słupka po najechaniu
  	const tooltip = this.svg.append("rect")
  						.attr("width", "0px")
  						.attr("height", "0px")
              .attr("rx", "20px")
              .attr("ry", "20px")
              .attr("pointer-events", "none")
  						.style("fill", "white")
  						.style("stroke", "black")
  						.classed("tooltip", true)
  	const tooltiptext = this.svg.append("text")
              .attr("pointer-events", "none")
              .style("user-select", "none")
  						.classed("tooltip-text", true);
    //Obsługa eventów tooltipa
  	this.svg.selectAll('circle')
  			.on("mousemove", (ev, d) => {
          let tooltipsize = [String(d.name + d[this.current_chart_interval]).length*12, 40];
  				let tooltippos = [d3.pointer(ev)[0]- tooltipsize[0]/2, d3.pointer(ev)[1]-tooltipsize[1]-10];

          tooltip
            .attr("x", tooltippos[0])
    			  .attr("y", tooltippos[1])
    			  .attr("width", tooltipsize[0])
    			  .attr("height", tooltipsize[1])
            .style("opacity", "0.8");

  			  tooltiptext
    				.attr("x", tooltippos[0] + tooltipsize[0]/2)
    				.attr("y", (tooltippos[1]+5) + tooltipsize[1]/2)
    				.attr("display", "inherit")
    				.text(d.translate + " " + d[this.current_chart_interval]);
  			})
  			.on("mouseout", function(ev){
  				tooltip
  					.style("opacity", "0")
            .attr("width", 0);
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  #update_chart = () => {
    this.simulation.force("center", d3.forceCenter().strength(1).x(this.width / 2).y(this.svg_height / 2))
                   .alpha(0.3)
                   .restart();
    this.node.attr("cx", this.width / 2)
             .attr("cy", this.svg_height / 2);
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
    this.#update();
    this.#update_chart();
  }
}
