class SectorChart{
  year = 2020;
  _show_table = false;
  _show_bar_chart = true;
  current_chart_index = -1;
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
    this.#load_data();
  }
  #earlier_year = () => {
		if(this.year <= this.start_year)
			return;
		this.year--;
		this.#change_chart();
	}
	#later_year = () => {
		if(this.year >= this.end_year)
			return;
		this.year++;
		this.#change_chart();
	}
  #load_data = () => {
    d3.json("php/getsectordata.php?stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.end_year+ "&lang=" + this.language).then((d) => {
      this._data = d;
      this.#change_chart();
    });
  }
  #change_chart = () => {
    this.array_interval = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
    if(this._show_bar_chart)
      this.#change_barchart();
    else
      this.#change_lolipopchart();
    this.#init();
  }
  #change_barchart = () => {
    this.indexes = [];
    for(let i = this.start_year; i <= this.end_year; i++) {
      this._data[i].forEach((item) => {
        this.indexes.push(item.translate);
      });
    }
    this.indexes = this.indexes.filter( (val, index, self) => self.indexOf(val) === index);
    const select_list_type = this.container.getElementsByClassName("chart-input")[1];
    if(select_list_type != undefined)
      this.current_chart_index = select_list_type.value;
    else
      this.current_chart_index = this.indexes[0];
    const select_list_interval = this.container.getElementsByClassName("chart-input")[2];
    if(select_list_interval != undefined)
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = this.array_interval[this.array_interval.length-1];
  }
  #change_lolipopchart = () => {
    this.indexes = [];
    this._data[this.year].forEach((item) => {
      this.indexes.push(item.translate);
    });

    const select_list_interval = this.container.getElementsByClassName("chart-input")[2];
    if(select_list_interval != undefined)
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = this.array_interval[this.array_interval.length-1];

    let index = this.#search_index(this._data[this.year]);
    if(index == -1)
      index = 0;
    this.current_chart_index = this.indexes[index];

    this.current_data = this._data[this.year][index];
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
        this.#init_lolipopchart();
      }
    } else {
      this.#init_table();
    }
  }
  #update = () => {
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
  #init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text(this.current_chart_index)
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
  			.on("click", () => {this._show_bar_chart = !this._show_bar_chart; this.#change_chart();})
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
  	for(let i = 0; i < this.indexes.length; i++){
  		field_type.append("option")
  			         .attr("value", this.indexes[i])
  			         .text(this.indexes[i]);
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
    for(let i = 0; i < this.array_interval.length; i++){
  		field_interval.append("option")
  			         .attr("value", this.array_interval[i])
  			         .text(this.array_interval[i]);
  	}
    const select_list_interval = this.container.getElementsByClassName("chart-input")[2];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
  }
  #init_lolipopchart = () => {
    this.svg.html("");
    const max = d3.max(this.current_data.children, d => d[this.current_chart_interval]);
    this.xScale = d3.scaleLinear()
                    .domain([0, max]).nice()
                    .range([this.padding_left*2, this.width -  this.padding_left]);
    this.g = this.svg.append("g");
    this.g.append("g")
            .classed("axis_bottom", true)
            .attr("transform", "translate(0," + (this.svg_height -  this.padding_down) + ")")
            .call(d3.axisBottom(this.xScale).tickFormat( (d) => {
        			return d.toString();
        		}))
            .selectAll("text")
              .attr("transform", "translate(-10,0)rotate(-30)")
              .style("text-anchor", "end")
              .style("user-select", "none");

    this.yScale = d3.scaleBand()
                    .range([0, this.svg_height - this.padding_down])
                    .domain(this.current_data.children.map(d => d.translate))
                    .padding(1);
    this.g.append("g")
            .classed("axis_left", true)
            .attr("transform", "translate(" + this.padding_left*2 +",0)")
            .call(d3.axisLeft(this.yScale))
            .style("user-select", "none");
    let max_font_size = this.padding_left*2.8 / d3.max(this.current_data.children, d => d.translate.length);
    if(max_font_size > 20)
      max_font_size = 20;
    this.g.select(".axis_left")
          .selectAll(".tick text")
          .style("font-size", parseInt(max_font_size) + "px");

    this.g.selectAll(".lolipop-line")
          .data(this.current_data.children)
          .enter()
          .append("line")
            .attr("x1", d => this.xScale(d[this.current_chart_interval]))
            .attr("x2", this.xScale(0))
            .attr("y1", d => this.yScale(d.translate))
            .attr("y2", d => this.yScale(d.translate))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
      this.g.selectAll(".lolipop-circle")
          .data(this.current_data.children)
          .enter()
          .append("circle")
            .attr("cx", d => this.xScale(d[this.current_chart_interval]))
            .attr("cy", d => this.yScale(d.translate))
            .attr("r", "7")
            .style("fill", "red")
            .attr("stroke", "black")
            .classed("lolipop-circle", true);
      // Dodanie tooltipa pokazującego wartość słupka po najechaniu
      const tooltip = this.svg.append("rect")
     						.attr("width", "0px")
     						.attr("height", "0px")
                .attr("rx", "20px")
                .attr("ry", "20px")
     						.style("fill", "white")
                .attr("pointer-events", "none")
     						.style("stroke", "black")
     						.classed("tooltip", true)
      const tooltiptext = this.svg.append("text")
                .attr("pointer-events", "none")
                .style("user-select", "none")
     						.classed("tooltip-text", true);
       //Obsługa eventów tooltipa
      this.svg.selectAll('.lolipop-circle')
     			.on("mousemove", (ev, d) => {
            let tooltipsize = [String(d.translate + d[this.current_chart_interval] + this.currency).length*12, 40];
     				let tooltippos = [d3.pointer(ev)[0]- tooltipsize[0]/2, d3.pointer(ev)[1] - tooltipsize[1] - 10];

            if(tooltippos[0]+tooltipsize[0] > this.width)
              tooltippos[0] = this.width - tooltipsize[0];
            if(tooltippos[0] < 0)
              tooltippos[0] = 0;
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
       				.text(d.translate + " " + d[this.current_chart_interval] + " " + this.currency);
     			})
     			.on("mouseout", (ev) => {
     				tooltip
     					.style("opacity", "0")
               .attr("width", 0);
     				tooltiptext
     					.attr("display", "none");
     			});
  }
  #search_index = (array) => {
    for(let i = 0; i < array.length; i++) {
      if(array[i].translate == this.current_chart_index)
        return i;
    }
    return -1;
  }
  #init_barchart = () => {
    this.empty_data = false;
    this.heightpadding = this.svg_height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    const keys = [];
    let name_array = [];
    for(let i = this.start_year; i <= this.end_year; i++) {
      if(this._data[i].length > 0) {
        let index = this.#search_index(this._data[i]);
        if(index == -1)
          continue;
        let temp_data = this._data[i][index].children;
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
           this.#change_chart();
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
          this.svg.selectAll(".bar_text")
                  .style("opacity", "0");
  				tooltip
  					.style("opacity", "0")
            .attr("width", 0);
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  #update_barchart = () => {
    if(this.empty_data) {
      this.svg.select("text")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2);
      return;
    }
    let max_font_size = this.padding_horizontal / String(d3.sum(this._data["2020"][0].children, d => d[this.current_chart_interval]) + ",,").length;
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
  #init_table = () => {
    this.#change_lolipopchart();
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
    if(!this._show_table) {
      if(this._show_bar_chart) {
        this.#update_barchart();
      } else {
        this.#init_lolipopchart();
      }
    }
  }
}
