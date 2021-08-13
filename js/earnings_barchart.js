class EarningsChart{
  year = 2020;
  _show_table = false;
  current_chart_interval = -1;
  padding_down = 80;
  padding_left = 100;
  padding_vertical = 20;
  padding_horizontal = 100;
  empty_data = false;
  indexes = [];
  data_index = -1;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.currency = currency;
    this.language = language;
  }
  set_year = (year) => {
    this.year = year;
    this.load_data();
  }
  load_data = () => {
    d3.json("php/getearningsrange.php?stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.end_year + "&lang=" + this.language).then((d) => {
      this._data = d;
      this.change_chart();
    });
  }
  change_chart = () => {
    this.array_interval = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
    this.change_barchart();
    this.init();
  }
  change_barchart = () => {
    const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_interval != undefined)
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = this.array_interval[this.array_interval.length-1];
  }
  init = () => {
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
    this.update();
    this.init_inputs();
    if(!this._show_table) {
      this.init_barchart();
      this.update_barchart();
    } else {
      this.init_table();
    }
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    this.padding_left = this.width / 8;
    this.svg_height = this.height*0.75;
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
  init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Podział przychodów")
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
    //Załadowanie opcji do pola
    const field_interval = d3.select(this.container)
                             .select(".button-div")
				                        .append("select")
          				                .on("change", this.load_data)
          				                .classed("chart-input", true);
    //Załadowanie opcji do pola
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
  search_index = (array) => {
    for(let i = 0; i < array.length; i++) {
      if(array[i].translate == this.current_chart_index)
        return i;
    }
    return -1;
  }
  init_barchart = () => {
    this.empty_data = false;
    this.heightpadding = this.svg_height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    const keys = [];
    let name_array = [];
    for(let i = this.start_year; i <= this.end_year; i++) {
      if(this._data[i].length > 0) {
        let temp_data = this._data[i];
        for(let j = 0; j < temp_data.length; j++) {
          temp_data.sort((a,b) => {
            return a.translate > b.translate ? 1 : -1;
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
    if(keys.length == 0) {
      this.svg.html("");
      this.svg.append("text")
              .attr("text-anchor", "middle")
              .text("Brak danych")
              .attr("fill", "black")
              .attr("font-size", "26px");
      this.empty_data = true;
      return;
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
       let filter = d3.filter(keys[i].children, d => d[this.current_chart_interval] > 0);
       let sum = d3.sum(filter, d => d[this.current_chart_interval]);
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
          if(!name_array.includes(keys[i].children[index].translate)) {
            name_array.push(keys[i].children[index].translate);
          }
          keys[i].children[index].id = name_array.indexOf(keys[i].children[index].translate);
        }
      }
    }
    for(let i = 0; i < keys.length; i++) {
      let accumulated_height = 0;
      keys[i].children.sort((a,b) => {
        return parseFloat(a[this.current_chart_interval]) < parseFloat(b[this.current_chart_interval]) ? 1 : -1;
      });
      for(let index = 0; index < keys[i].children.length; index++) {
          let current_child = keys[i].children[index];
          if(current_child[this.current_chart_interval] != null && current_child[this.current_chart_interval] > 0) {
            accumulated_height += this.yScale(0) - this.yScale(current_child[this.current_chart_interval]);
            current_child["y"] = this.yScale(0) - accumulated_height;
            current_child["height"] = this.yScale(0) - this.yScale(current_child[this.current_chart_interval]);
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
                .filter(data => data[current_interval] != undefined && data[current_interval] > 0)
                .append("rect")
                  .attr('stroke', "#f7f7f7")
                  .attr('height', data => data["height"])
                  .attr('fill', data => colorScale(data.id))
                  .attr("y", data => data["y"])
                  .attr("class", data => data.name)
                  .classed("bar", true);
              d3.select(this)
                .selectAll(".bar_text")
                .data(d.children)
                .enter()
                .filter(data => data[current_interval] != undefined && data[current_interval] > 0)
                .append("text")
                  .style('font-size', "10px")
                  .attr("y", data => data["y"] + data["height"] / 2)
                  .attr("class", data => data.name)
                  .attr("fill", "black")
                  .attr("letter-spacing", 1.2)
                  .attr("pointer-events", "none")
                  .attr("text-anchor", "middle")
                  .style("user-select", "none")
                  .style("opacity", "0")
                  .text(data => parseInt(data[current_interval]))
                  .classed("bar_text", true);
            });
    this.g.selectAll(".bar-group")
         .on("click", (ev, d) => {
           this._show_bar_chart = false;
           this.year = d.year;
           this.change_chart();
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
          this.svg.selectAll(".bar_text")
                  .style("opacity", "0");
          let className = ev.target.classList[0];
          this.svg.selectAll("." + className)
                  .filter(".bar")
                  .style("fill", "#f03030")
                  .style("opacity", "1");
          this.svg.selectAll("." + className)
                  .filter(".bar_text")
                  .style("fill", "black")
                  .style("opacity", "1");
        })
  			.on("mousemove", (ev, d) => {
          let value = d.translate + " " + parseFloat(d[this.current_chart_interval]);
          let tooltipsize = [String(value).length*10 + 5, 40];
  				let tooltippos = [ev.offsetX, ev.offsetY];

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
    				.text(value);
  			})
  			.on("mouseout", (ev) => {
          this.svg.selectAll(".bar")
                  .style("fill", data => colorScale(data.id))
                  .style("opacity", "1");
          this.svg.selectAll(".bar_text")
                  .style("opacity", "0");
  				tooltip
  					.style("opacity", "0")
            .attr("width", 0);
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  update_barchart = () => {
    if(this.empty_data) {
      this.svg.select("text")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2);
      return;
    }
    let max_font_size = this.padding_horizontal / String(d3.sum(this._data["2020"], d => d[this.current_chart_interval]) + ",,").length;
    if(max_font_size > 20)
      max_font_size = 20;
    this.g.select(".axis_left")
          .selectAll(".tick text")
          .style("font-size", max_font_size + "px");
    this.xScale.range([0, this.width-this.padding_horizontal]);
    this.g.select(".axis_bottom")
          .html("")
          .call(d3.axisBottom(this.xScale))
          .attr("transform","translate(0," + this.heightpadding + ")");

    this.g.select(".grid")
          .html("")
          .call(d3.axisLeft(this.yScale).tickSize(-this.width+this.padding_horizontal).tickFormat("").ticks(10));
    let scale = this.xScale;
    this.svg.selectAll(".bar-group")
            .each( function(d, i) {
                d3.select(this)
                  .selectAll(".bar")
                  .attr('width', scale.bandwidth())
                  .attr('x', scale(d.year));
                d3.select(this)
                  .selectAll(".bar_text")
                  .attr("x", scale(d.year) + scale.bandwidth() / 2);
              });
  }
  init_table = () => {
    let data_string = '<table class="earnings-table">';
    for(let i = 0; i < this._data[this.year].length; i++){
      data_string += "<tr><td align='center'>" + this._data[this.year][i].translate + "</td><td align='right'>" + parseFloat(this._data[this.year][i][this.current_chart_interval]).toFixed(0) + "tys" + this.currency + "</td></tr>";
    }
    data_string += "</table>";
    d3.select(this.container).select(".svg-div").html(data_string);
  }
  refresh = () => {
    this.update();
    if(!this._show_table) {
      this.update_barchart();
    }
  }
}
