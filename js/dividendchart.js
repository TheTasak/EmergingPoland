class DividendChart{
  _width = 0;
  _height = 0;
  _data = [];
  stock_name = "";
  padding_vertical = 20;
  padding_horizontal = 60;
  chart_index = 0;
  constructor(container, stock_name, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.currency = currency;
    this.language = language;
    this.chart_types = ["value", "yield"];
    this.show_table = false;
    this.#load_data();
  }
  #load_data = () => {
	let json_data = d3.json("php/getdividenddata.php?&stock_name=" + String(this.stock_name)).then( (d) => {
    // Wyciąga z bazy kolumny z danymi
		this._data = d;

    this.keys = d3.map(this._data, d => d.year).filter( (val, index, self) => self.indexOf(val) === index);
    for(let i = 0; i < this.keys.length; i++) {
      let objects = [];
      let dividend_yield = 0;
      let dividend_value = 0;
      for(let j = 0; j < this._data.length; j++) {
        if(this._data[j].year == this.keys[i]) {
          dividend_value += parseFloat(this._data[j].value);
          let current_yield = 0;
          if(this._data[j].stock_price != null) {
            current_yield = parseFloat(this._data[j].value * this._data[j].exchange_rate / this._data[j].stock_price * 100).toFixed(2);
            dividend_yield += parseFloat(current_yield);
          }
          objects.push({"value" : this._data[j].value, "yield": current_yield});
        }
      }
      if(isNaN(parseFloat(dividend_yield)))
        dividend_yield = 0;
      if(isNaN(parseFloat(dividend_value)))
        dividend_value = 0;
      this.keys[i] = {"year": this.keys[i], "children" : objects, "yield" : dividend_yield, "value": dividend_value};
    }
		this.init();
	  });
  }
  init = () => {
    // Usunięcie starego wykresu
    d3.select(this.container)
      .html("");
    d3.select(this.container)
      .append("div")
      .classed("button-div", true);
    if(!this.show_table) {
    	this.svg = d3.select(this.container)
    					.append("svg")
    					.classed("chart",true);
    }
    this.#update();
    this.#init_inputs();
    if(this.show_table) {
      this.#init_table();
    } else {
      this.#init_chart();
    }
    this.refresh();
  }
  #update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight);
    this.button_height = this.height*0.2;
    this.svg_height = this.height*0.8;
    this.heightpadding = this.svg_height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    d3.select(this.container)
      .select(".button-div")
      .attr("width", this.width)
      .attr("height", this.button_height)
    if(!this.show_table) {
      this.svg.attr("width", this.width)
              .attr("height", this.svg_height)
    }
  }
  #init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Dywidenda")
			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
        .append("div")
        .classed("innerbutton-div", true);
    d3.select(this.container)
      .select(".innerbutton-div")
      .append("button")
  	    .attr("type", "button")
        .attr("font-size", "16px")
  			.classed("chart-input", true)
        .on("click", () => {
          if(this.chart_index < this.chart_types.length-1)
            this.chart_index++;
          else
            this.chart_index = 0;
          this.init();
        })
        .append("img")
          .attr("src", "chart_type.png");
    d3.select(this.container)
			.select(".innerbutton-div")
			.append("button")
        .attr("type", "button")
        .attr("font-size", "16px")
        .classed("chart-input", true)
        .on("click", () => {this.show_table = !this.show_table; this.init();})
        .append("img")
          .attr("src", "table_icon.png");
  }
  #init_chart = () => {
    // Ustawienie skali i domeny osi x
    let chart_type = this.chart_types[this.chart_index];
    const min = 0;
    const max = d3.max(this.keys, d => d3.sum(d.children, d => d[chart_type]));
    this.xScale = d3.scaleBand()
                    .padding(0.4)
                    .domain(this.keys.map(d => d.year));
    // Ustawienie skali i domeny osi y
    this.yScale = d3.scaleLinear()
                    .domain([min, max*1.2]).nice()
                    .range([this.heightpadding,this.padding_vertical]);
    this.g = this.svg.append("g")
                .attr("transform", "translate(" + this.padding_horizontal*(2/3) + ",0)");
    // Dodanie dolnej osi wykresu
    this.g.append("g")
      		.classed("axis_bottom",true)
          .style("user-select", "none");
    // Dodanie lewej osi wykresu
    this.g.append("g")
      		.classed("axis_left",true)
      		.call(d3.axisLeft(this.yScale).tickFormat( (d) => {
      			return d.toString();
      		}).ticks(10))
          .style("user-select", "none")
      		.append("text")
      		.attr("text-anchor", "end")
      		.text("value");
    // Dodanie poziomych linii pomocniczych
  	this.g.append("g")
		      .classed("grid", true);
    for(let i = 0; i < this.keys.length; i++) {
      let accumulated_height = 0;
      for(let index = 0; index < this.keys[i].children.length; index++) {
          accumulated_height += this.yScale(0) - this.yScale(this.keys[i].children[index][chart_type]);
          this.keys[i].children[index]["y"] = this.yScale(0) - accumulated_height;
          this.keys[i].children[index]["height"] = this.yScale(0) - this.yScale(this.keys[i].children[index][chart_type]);
      }
    }
    // Dodanie słupków wartości
    this.bars_group = this.g.selectAll(".bar-group")
                            .data(this.keys)
                            .enter()
                            .append("g")
                              .classed("bar-group", true)
                              .each( function(d, i) {
                                d3.select(this)
                                  .selectAll(".bar")
                                  .data(d.children)
                                  .enter()
                                  .filter(data => !isNaN(data[chart_type]))
                                  .append("rect")
                                    .attr('stroke', "#f7f7f7")
                                    .attr('height', data => data["height"])
                                    .attr("y", data => data["y"])
                                    .classed("bar", true);
                              });
     this.bars = this.g.selectAll(".bar")
                     .style("fill", "#FC3535")
                     .style("stroke", "black")
                     .on("mouseover", (ev) => {
                       ev.target.style.fill = "#FC7777";
                     })
                     .on("mouseleave", (ev) => {
                       ev.target.style.fill = "#FC3535";
                     });
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
     this.svg.selectAll('.bar')
    			.on("mousemove", (ev, d) => {
            let tooltipstring = String(d[chart_type] + " " + (chart_type == "yield" ? "%" : this.currency));
            let tooltipsize = [tooltipstring.length*12, 40];
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
      				.text(tooltipstring);
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
              });
  }
  #init_table = () => {
    const table = d3.select(this.container)
      .append("div")
        .classed("dividend-table", true)
		    .append("table")
          .attr("width", "100%");
		const table_el = table.nodes();
		let table_string = "";
		table_string += '<tr class="table-row">';
		table_string += "<td width='33%'>" + "Rok" + "</td>";
		table_string += "<td width='33%'>" + "Dywidenda na akcję" + "</td>";
		table_string += "<td width='33%'>" + "Stopa dywidendy" + "</td>";
		table_string += "</tr>";
		for(let i = this.keys.length-1; i > 0; i--) {
			table_string += '<tr class="table-row">';
			table_string += "<td width='33%'>" + this.keys[i].year + "</td>";
			table_string += "<td width='33%'>" + parseFloat(this.keys[i].value).toFixed(2) + this.currency + "</td>";
			table_string += "<td width='33%'>" +  parseFloat(this.keys[i].yield).toFixed(2) + "%" + "</td>";
			table_string += "</tr>";
		}
		d3.select(table_el[0])
			.html(table_string);
  }
  refresh = () => {
    this.#update();
    if(!this.show_table) {
      this.#update_chart();
    }
  }
}
