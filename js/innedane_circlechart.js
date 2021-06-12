class CircleChart{
  year = 2020;
  _show_table = false;
  _show_bar_chart = true;
  current_chart_index = -1;
  current_chart_interval = -1;
  padding_vertical = 20;
  padding_horizontal = 100;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.currency = currency;
    this.language = language;
    this.#load_data();
  }
  #earlier_year = () => {
		if(this.year <= this.start_year)
			return;
		this.year--;
		this.#change_chart();
    this.#init();
	}
	#later_year = () => {
		if(this.year >= this.end_year)
			return;
		this.year++;
		this.#change_chart();
    this.#init();
	}
  #load_data = () => {
    d3.json("php/getinnedane.php?stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.end_year+ "&lang=" + this.language).then((d) => {
      this._data = d;
      this.#change_chart();
      this.#init();
    });
  }
  #change_chart = () => {
    const select_list_type = this.container.getElementsByClassName("chart-input")[1];
    if(select_list_type != undefined)
      this.current_chart_index = select_list_type.value;
    else
      this.current_chart_index = 0;
    const select_list_interval = this.container.getElementsByClassName("chart-input")[2];
    if(select_list_interval != undefined)
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = "quarter1";
    this.current_data = this._data[this.year][this.current_chart_index];
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
    if(!this._show_table) {
      this.svg = d3.select(this.container)
                    .select(".svg-div")
                    .append("svg");
    }
    this.#update();
    this.#init_inputs();
    if(!this._show_table) {
      if(this._show_bar_chart) {
        this.#init_barchart();
        this.#update_barchart();
      } else {
        this.#init_circlechart();
        this.#update_circlechart();
      }
    } else {
      this.#init_table();
    }
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
    if(!this._show_table) {
      this.svg
        .attr("height", this.svg_height)
        .attr("width", this.width);
    }
  }

  #init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text(this._data[this.year][this.current_chart_index].name)
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
      .on("click", () => {this._show_table = !this._show_table; this.#init();})
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".tree-button-div")
			.append("button")
			.attr("type", "button")
			.text("🠖")
			.on("click", this.#later_year)
			.classed("treechart-button", true);
    d3.select(this.container)
      .select(".tree-button-div")
      .append("button")
  	    .attr("type", "button")
        .attr("font-size", "16px")
  			.on("click", () => {this._show_bar_chart = !this._show_bar_chart; this.#init();})
  			.classed("chart-input", true)
        .append("img")
          .attr("src", "chart_type.png");
    const field_type = d3.select(this.container)
                    .select(".tree-button-div")
                    .append("div")
					             .classed("chart-input-div", true)
					             .append("select")
				                 .on("change", this.#load_data)
				                 .classed("chart-input", true);
    //Załadowanie opcji do pola
  	for(let i = 0; i < this._data[this.year].length; i++){
  		field_type.append("option")
  			         .attr("value", i)
  			         .text(this._data[this.year][i].name);
  	}
    //Ustawienie opcji pola na ostatnio wybraną
  	const select_list_type = this.container.getElementsByClassName("chart-input")[1];
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
    const select_list_interval = this.container.getElementsByClassName("chart-input")[2];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
  }
  #init_circlechart = () => {
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
                                this.simulation.alphaTarget(0.01).restart();
                              d.subject.x = d.x;
                              d.subject.y = d.y;
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
                         .force("manyBody", d3.forceManyBody().strength(40))
                         .force("collide", d3.forceCollide().strength(.6).radius( d => scale(d[this.current_chart_interval])+3).iterations(1))
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
  #update_circlechart = () => {
    this.simulation.force("center", d3.forceCenter().strength(1).x(this.width / 2).y(this.svg_height / 2))
                   .alpha(0.3)
                   .restart();
    this.node.attr("cx", this.width / 2)
             .attr("cy", this.svg_height / 2);
  }
  #init_barchart = () => {
    this.heightpadding = this.svg_height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    const keys = [];
    let name_array = [];
    for(let i = this.start_year; i <= this.end_year; i++) {
      if(this._data[i].length > 0) {
        let temp_data = this._data[i][this.current_chart_index].children;
        for(let j = 0; j < temp_data.length; j++) {
          temp_data.sort((a,b) => {
            return a.name > b.name ? 1 : -1;
          });
          if(temp_data[j][this.current_chart_interval] != null) {
            let temp_obj = {
              "year" : String(i),
              "children" : temp_data
            };
            keys.push(temp_obj);
            break;
          }

        }
      }
    }
    this.g = this.svg.append("g")
                     .attr("transform", "translate(" + this.padding_horizontal*(2/3) + ",0)");
    this.xScale = d3.scaleBand()
                     .domain(d3.map(keys, d => d.year))
                     .padding(0.4)
                     .range([0, this.widthpadding]);
    this.g.append("g")
          .classed("axis_bottom",true)
          .style("user-select", "none")
          .call(d3.axisBottom(this.xScale))
          .attr("transform","translate(0," + this.heightpadding + ")");
    let min = undefined;
    let max = undefined;
    for(let i = 0; i < keys.length; i++) {
       let sum = d3.sum(keys[i].children, d => d[this.current_chart_interval]);
       min = sum < min || min == undefined ? sum : min;
       max = sum > max || max == undefined ? sum : max;
    }
    this.yScale = d3.scaleLinear()
                     .domain([0,max*1.1])
                     .range([this.heightpadding,this.padding_vertical]);
    this.g.append("g")
     		.classed("axis_left",true)
     		.call(d3.axisLeft(this.yScale))
        .style("user-select", "none")
     		.append("text")
     		.attr("text-anchor", "end")
     		.text("value");
    const colorScale = d3.scaleOrdinal()
                         .domain([0, 20])
                         .range(["#4c1511","#661c16","#80231c","#992922","#b33027","#cc372d","#e63e32", "#ff4538", "#ff584c", "#ff6a60", "#ff7d74", "#ff8f88", "#ffa29c", "#ffb5af", "#ffc7c3"]);
    for(let i = 0; i < keys.length; i++) {
      for(let index = 0; index < keys[i].children.length; index++) {
        if(keys[i].children[index][this.current_chart_interval] != null) {
          if(!name_array.includes(keys[i].children[index].name)) {
            name_array.push(keys[i].children[index].name);
          }
          keys[i].children[index].id = name_array.indexOf(keys[i].children[index].name);
        }
      }
    }
    for(let i = 0; i < keys.length; i++) {
      let accumulated_height = 0;
      keys[i].children.sort((a,b) => {
        return parseFloat(a[this.current_chart_interval]) < parseFloat(b[this.current_chart_interval]) ? 1 : -1;
      });
      for(let index = 0; index < keys[i].children.length; index++) {
          if(keys[i].children[index][this.current_chart_interval] != null) {
            accumulated_height += this.yScale(0) - this.yScale(keys[i].children[index][this.current_chart_interval]);
            keys[i].children[index]["y"] = this.yScale(0) - accumulated_height;
            keys[i].children[index]["height"] = this.yScale(0) - this.yScale(keys[i].children[index][this.current_chart_interval]);
        }
      }
    }
    this.g.append("g")
		      .classed("grid", true);

    let current_interval = this.current_chart_interval;
    this.g.selectAll(".bar-group")
          .data(keys)
          .enter()
          .append("g")
            .classed("bar-group", true)
            .each( function(d, i) {
              d3.select(this)
                .selectAll(".bar")
                .data(d.children)
                .enter()
                .filter(data => data[current_interval] != undefined)
                .append("rect")
                  .attr('stroke', "#f7f7f7")
                  .attr('height', data => data["height"])
                  .attr('fill', data => colorScale(data.id))
                  .attr("y", data => data["y"])
                  .attr("class", data => data.name)
                  .classed("bar", true);
            })
    this.g.selectAll(".bar-group")
         .on("click", (ev, d) => {
           this._show_bar_chart = false;
           this.year = d.year;
           this.#change_chart();
           this.#init();
         });
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
  	this.svg.selectAll('.bar')
        .on("mouseover", (ev, d) => {
          this.svg.selectAll(".bar")
                  .style("opacity", "0.4");
          let className = ev.target.classList[0];
          this.svg.selectAll("." + className)
                  .style("opacity", "1");
        })
  			.on("mousemove", (ev, d) => {
          let tooltipsize = [String(d.translate + parseFloat(d[this.current_chart_interval])).length*10 + 5, 40];
  				let tooltippos = [d3.pointer(ev)[0] + this.padding_horizontal*(2/3) - tooltipsize[0]/2, d3.pointer(ev)[1]-tooltipsize[1]-10];

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
    				.text(d.translate + " " + parseFloat(d[this.current_chart_interval]));
  			})
  			.on("mouseout", (ev) => {
          this.svg.selectAll(".bar")
                  .style("opacity", "1");
  				tooltip
  					.style("opacity", "0")
            .attr("width", 0);
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  #update_barchart = () => {
    this.xScale.range([0, this.width-this.padding_horizontal]);
    this.g.select(".axis_bottom")
          .html("")
          .call(d3.axisBottom(this.xScale))
          .attr("transform","translate(0," + this.heightpadding + ")");

    this.g.select(".grid")
          .html("")
          .call(d3.axisLeft(this.yScale).tickSize(-this.width+this.padding_horizontal).tickFormat("").ticks(10));
    let scale = this.xScale;
    let padding = this.padding_horizontal;
    this.svg.selectAll(".bar-group")
            .each( function(d, i) {
                d3.select(this)
                  .selectAll(".bar")
                  .attr('width', scale.bandwidth())
                  .attr('x', scale(d.year));
              });
  }
  #init_table = () => {
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
    console.log(this._show_bar_chart);
    if(!this._show_table) {
      if(this._show_bar_chart) {
        this.#update_barchart();
      } else {
        this.#update_circlechart();
      }
    }
  }
}
