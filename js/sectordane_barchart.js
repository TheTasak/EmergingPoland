class SectorChart{
  current_chart_index = -1;
  current_chart_interval = -1;
  padding_down = 80;
  padding_left = 100;
  padding_vertical = 20;
  padding_horizontal = 100;
  empty_data = false;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.end_quarter = end_year.split("_")[1];
    this.year = this.end_quarter == 4 ? this.end_year : this.end_year-1;
    this.current_chart_start = this.end_year-6 > this.start_year ? this.end_year-6 : this.start_year;
    this.current_chart_end = this.end_year;
    this.currency = currency;
    this.language = language;
  }
  setYear = (year) => {
    this.year = year;
    this.load_data();
  }
  load_data = () => {
    let slider = this.container.getElementsByClassName("slider-div")[0];
    if(slider != undefined){
        this.current_chart_start = parseInt(slider.noUiSlider.get()[0]);
        this.current_chart_end = parseInt(slider.noUiSlider.get()[1]);
    }
    d3.json("php/getsectordata.php?stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.end_year+ "&lang=" + this.language).then((d) => {
      this.data = d;
      this.changeChart();
      this.init();
    });
  }
  changeChart = () => {
    this.array_interval = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
    this.indexes = [];
    for(let i = this.start_year; i <= this.end_year; i++) {
      this.data[i].forEach((item) => {
        this.indexes.push(item.translate);
      });
    }
    this.indexes = this.indexes.filter( (val, index, self) => self.indexOf(val) === index);
    const select_list_type = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_type != undefined)
      this.current_chart_index = select_list_type.value;
    else
      this.current_chart_index = this.indexes[0];
    const select_list_interval = this.container.getElementsByClassName("chart-input")[1];
    if(select_list_interval != undefined)
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = this.array_interval[this.array_interval.length-1];
    this.init();
  }
  init = () => {
    d3.select(this.container)
      .html("");
    d3.select(this.container)
      .append("div")
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .style("position", "relative")
        .classed("svg-div", true);
    this.svg = d3.select(this.container)
                  .select(".svg-div")
                  .append("svg");
    d3.select(this.container)
      .append("div")
        .style("margin-top", "10px")
        .classed("input-div", true);
    this.update();
    this.initInputs();
    this.initBarchart();
    this.refresh();
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    this.svg_height = this.height*0.7;
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
  initInputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text(this.current_chart_index)
			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
      .append("div");

    const field_type = d3.select(this.container)
                    .select(".button-div")
				             .append("select")
			                 .on("change", this.load_data)
			                 .classed("chart-input", true);
    //Załadowanie opcji do pola
  	for(let i = 0; i < this.indexes.length; i++){
  		field_type.append("option")
  			         .attr("value", this.indexes[i])
  			         .text(this.indexes[i]);
  	}
    //Ustawienie opcji pola na ostatnio wybraną
  	const select_list_type = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_type != undefined){
  		select_list_type.value = this.current_chart_index;
  	}
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
    const select_list_interval = this.container.getElementsByClassName("chart-input")[1];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
    d3.select(this.container)
      .select(".button-div")
      .append("button")
  	    .attr("type", "button")
        .attr("font-size", "16px")
        .classed("chart-button", true)
  			.on("click", () => this.showLegendCaption())
        .html("Filtruj");
    const slider_div = d3.select(this.container)
                          .select(".input-div")
                          .append("div")
                            .classed("slider-div", true);

  	const drag_slider = slider_div.nodes()[0];
    noUiSlider.create(drag_slider, {
      start: [this.current_chart_start, this.current_chart_end],
      step: 1,
      behaviour: 'drag',
      pips: {
          mode: 'values',
          values: [this.start_year, this.end_year],
          density: 100/(this.end_year-this.start_year),
          stepped: true
      },
      connect: true,
      range: {
          'min': parseInt(this.start_year),
          'max': parseInt(this.end_year)
      }
    });
    drag_slider.noUiSlider.on("change", this.load_data);
  }
  searchIndex = (array) => {
    for(let i = 0; i < array.length; i++) {
      if(array[i].translate == this.current_chart_index)
        return i;
    }
    return -1;
  }
  getAllBarArray = () => {
    let keys = [];
    for(let i = this.current_chart_start; i <= this.current_chart_end; i++) {
      if(this.data[i].length > 0) {
        let index = this.searchIndex(this.data[i]);
        if(index == -1)
          continue;
        let temp_data = this.data[i][index].children;
        temp_data = temp_data.filter(d => d[this.current_chart_interval] > 0);
        temp_data.sort((a,b) => {
          return a.translate > b.translate ? 1 : -1;
        });
        if(this.currentChartName != undefined) {
          temp_data = temp_data.filter(d => d.name == this.currentChartName);
        }
        for(let j = 0; j < temp_data.length; j++) {
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
    keys = this.getAllBarIdArray(keys);
    return keys;
  }
  getAllBarIdArray = (keys) => {
    let name_array = [];
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
    return keys;
  }
  getBarNameArray = (keys) => {
    let name_array = [];
    for(let i = 0; i < keys.length; i++) {
      for(let index = 0; index < keys[i].children.length; index++) {
        if(keys[i].children[index][this.current_chart_interval] != null) {
          let found_value = false;
          for(let j = 0; j < name_array.length; j++) {
            if(name_array[j].name == keys[i].children[index].name) {
              found_value = true;
              break;
            }
          }
          if(!found_value) {
            name_array.push({
              "name" : keys[i].children[index].name,
              "translate" : keys[i].children[index].translate
            });
          }
          keys[i].children[index].id = name_array.indexOf(keys[i].children[index].translate);
        }
      }
    }
    return name_array;
  }
  showLegendCaption = () => {
    if(this.legend.style("display") != "none") {
      this.removeLegendCaption();
      return;
    }
    this.legend.style("display", "initial").html("");
    let keys = this.getAllBarArray();
    let names = this.getBarNameArray(keys);
    this.legend.append("h2")
               .html("Usuń filtry")
               .on("click", (ev, d) => {
                 this.currentChartName = undefined;
                 this.currentMarkName = undefined;
                 this.init();
               })
    const rows = this.legend
                      .append("table")
                      .selectAll("p")
                      .data(names)
                      .enter()
                      .append("tr");
    rows.append("td")
        .append("span")
        .html(d => d.translate)
        .filter(d => d.name == this.currentChartName || d.name == this.currentMarkName)
        .style("font-style", "italic");
    let cells = rows.append("td");
    cells.append("button")
        .classed("legend-button", true)
        .on("click", (ev, d) => {
          this.currentChartName = d.name;
          this.init();
        })
        .html("Wykres");
    cells.append("button")
        .classed("legend-button", true)
        .on("click", (ev, d) => {
          this.currentMarkName = d.name;
          this.init();
        })
        .html("Zaznacz");
  }
  removeLegendCaption = () => {
    this.legend.style("display", "none");
  }
  initBarchart = () => {
    this.empty_data = false;
    this.heightpadding = this.svg_height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    const keys = this.getAllBarArray();
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
    this.legend = d3.select(this.container).select(".svg-div")
                           .append("div")
                           .style("display", "none")
                           .classed("legend-div", true);
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
    let mark_name = this.currentMarkName;
    this.g.selectAll(".bar-group")
          .data(keys)
          .enter()
          .append("g")
            .classed("bar-group", true)
            .each( function(d, i) {
              let bars = d3.select(this)
                          .selectAll(".bar")
                          .data(d.children)
                          .enter()
                            .filter(data => data[current_interval] != undefined)
                            .append("rect")
                              .attr('height', data => data["height"])
                              .attr('stroke', "#f7f7f7")
                              .attr("y", data => data["y"])
                              .attr("class", data => data.name)
                              .attr('fill', data => colorScale(data.id))
                              .classed("bar", true);
              let text_rect = d3.select(this)
                                .selectAll(".bar-text-rect")
                                .data(d.children)
                                .enter()
                                .filter(data => data[current_interval] != undefined && data[current_interval] > 0)
                                .append("rect")
                                  .attr("y", data => data["y"] + data["height"] / 2 - 13)
                                  .attr("class", data => data.name)
                                  .attr('height', "20px")
                                  .attr("fill", "white")
                                  .attr("stroke", "black")
                                  .style("user-select", "none")
                                  .attr("pointer-events", "none")
                                  .attr("rx", "10px")
                                  .classed("bar-text-rect", true);
              let text = d3.select(this)
                          .selectAll(".bar_text")
                          .data(d.children)
                          .enter()
                          .filter(data => data[current_interval] != undefined && data[current_interval] > 0)
                          .append("text")
                            .style('font-size', "10px")
                            .attr("y", data => data["y"] + data["height"] / 2)
                            .attr("class", data => data.name)
                            .attr("fill", "black")
                            .attr("letter-spacing", 1)
                            .attr("pointer-events", "none")
                            .attr("text-anchor", "middle")
                            .style("user-select", "none")
                            .text(data => splitValue(parseInt(data[current_interval])))
                            .classed("bar_text", true);
              if(mark_name != undefined) {
                bars.filter(d => d.name == mark_name)
                    .style("opacity", "1");
                bars.filter(d => d.name != mark_name)
                    .style("opacity", "0.4");
                text.filter(d => d.name == mark_name)
                    .style("opacity", "1");
                text.filter(d => d.name != mark_name)
                    .style("opacity", "0");
                text_rect.filter(d => d.name == mark_name)
                    .style("opacity", "1");
                text_rect.filter(d => d.name != mark_name)
                    .style("opacity", "0");
              } else {
                bars.style("opacity", "1");
                text.style("opacity", "0");
                text_rect.style("opacity", "0");
              }
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
    this.svg.selectAll(".bar-group")
            .filter( (d,i) => i > 0)
            .append("text")
            .style("user-select", "none")
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .html( (d,i) => {
              let previous_sum = d3.sum(keys[i].children, data => data[this.current_chart_interval]);
              let current_sum = d3.sum(keys[i+1].children, data => data[this.current_chart_interval]);
              let percent = parseFloat(current_sum / previous_sum * 100 - 100).toFixed(2);
              if(percent >= 0)
                return "+" + percent + "%";
              else
                return percent + "%";
            })
            .attr("y", (d,i) => {
              let current_sum = d3.sum(keys[i+1].children, data => data[this.current_chart_interval]);
              return this.yScale(current_sum*1.01);
            })
            .attr("fill", (d,i) => {
              let previous_sum = d3.sum(keys[i].children, data => data[this.current_chart_interval]);
              let current_sum = d3.sum(keys[i+1].children, data => data[this.current_chart_interval]);
              let percent = parseFloat(current_sum / previous_sum * 100 - 100).toFixed(2);
              if(percent >= 0)
                return "green";
              else
                return "red";
            })
            .classed("percent-change", true);
    //Obsługa eventów tooltipa
  	this.svg.selectAll('.bar')
        .on("mouseover", (ev, d) => {
          if(this.currentMarkName == undefined) {
            this.svg.selectAll(".bar")
                    .style("opacity", "0.4");
            this.svg.selectAll(".bar_text")
                    .style("opacity", "0");
            this.svg.selectAll(".bar-text-rect")
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
            this.svg.selectAll("." + className)
                    .filter(".bar-text-rect")
                    .style("fill", "white")
                    .style("opacity", "1");
          }
        })
  			.on("mousemove", (ev, d) => {
          let value = d.translate + " " + splitValue(parseFloat(d[this.current_chart_interval]));
          let tooltipsize = [String(value).length*10 + 10, 40];
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
  			.on("mouseout", (ev, d) => {
          if(this.currentMarkName == undefined) {
            this.svg.selectAll(".bar")
                    .style("fill", data => colorScale(data.id))
                    .style("opacity", "1");
            this.svg.selectAll(".bar_text")
                    .style("opacity", "0");
            this.svg.selectAll(".bar-text-rect")
                    .style("opacity", "0");
          }
          tooltip
            .style("opacity", "0")
            .attr("width", 0);
          tooltiptext
            .attr("display", "none");
  			});
  }
  updateBarchart = () => {
    if(this.empty_data) {
      this.svg.select("text")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2);
      return;
    }
    let max_font_size = this.padding_horizontal / splitValue(String(parseInt(this.yScale.domain()[1]))).length;
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
    let current_interval = this.current_chart_interval;
    console.log(this.current_interval);
    this.svg.selectAll(".bar-group")
            .each( function(d, i) {
                d3.select(this)
                  .selectAll(".bar")
                  .attr('width', scale.bandwidth())
                  .attr('x', scale(d.year));
                d3.select(this)
                  .selectAll(".bar_text")
                  .attr("x", scale(d.year) + scale.bandwidth() / 2);
                d3.select(this)
                  .selectAll(".bar-text-rect")
                  .attr("x", data => scale(d.year) + scale.bandwidth() / 2 - String(splitValue(parseInt(data[current_interval]))).length*4)
                  .attr('width', data => String(splitValue(parseInt(data[current_interval]))).length*8);
              })
              .select(".percent-change")
              .attr("x", d => this.xScale(d.year) + this.xScale.bandwidth() / 2);
  }
  refresh = () => {
    this.update();
    this.updateBarchart();
  }
}
