class DividendChart{
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
    this.chart_types = [{"name":"Dywidenda na akcję", "variable": "value"}, {"name":"Stopa dywidendy", "variable": "yield"}, {"name":"Stopień wypłaty", "variable": "ratio"}];
    this.show_table = false;
  }
  load_data = () => {
	let json_data = d3.json("php/getdividenddata.php?&stock_name=" + String(this.stock_name)).then( (d) => {
    // Wyciąga z bazy kolumny z danymi
		this._data = d;

    this.keys = d3.map(this._data, d => d.year).filter( (val, index, self) => self.indexOf(val) === index);
    for(let i = 0; i < this.keys.length; i++) {
      let objects = [];
      let dividend_yield = 0;
      let dividend_value = 0;
      let dividend_ratio = 0;
      for(let j = 0; j < this._data.length; j++) {
        if(this._data[j].year == this.keys[i]) {
          let current_ratio = 0;
          if(this._data[j].value != 0) {
            current_ratio = parseFloat(this._data[j].stocks * this._data[j].value / this._data[j].earnings * 100).toFixed(2);
          }
          let current_yield = 0;
          if(this._data[j].stock_price != null) {
            current_yield = parseFloat(this._data[j].value * this._data[j].exchange_rate / this._data[j].stock_price * 100).toFixed(2);
          }
          objects.push({"value" : this._data[j].value, "yield": current_yield, "ratio": current_ratio});
        }
      }
      this.keys[i] = {"year": this.keys[i], "children" : objects, "yield" : dividend_yield, "value": dividend_value, "ratio" : dividend_ratio};
    }
    this.init();
	  });
  }
  init = () => {
    const select_list_type = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_type != undefined)
      this.chart_index = select_list_type.value;
    else
      this.chart_index = 0;
    // Usunięcie starego wykresu
    d3.select(this.container)
      .html("");
    d3.select(this.container)
      .append("div")
      .classed("button-div", true);
  	this.svg = d3.select(this.container)
  					.append("svg")
  					.classed("chart",true);
    this.update();
    this.init_inputs();
    this.init_chart();
    this.update_chart();
  }
  update = () => {
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
    this.svg.attr("width", this.width)
            .attr("height", this.svg_height)
  }
  init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Dywidenda")
			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
        .append("div")
        .classed("innerbutton-div", true);
    const field_type = d3.select(this.container)
                         .select(".button-div")
                            .append("select")
                              .on("change", this.init)
                              .classed("chart-input", true);
    for(let i = 0; i < this.chart_types.length; i++){
      field_type.append("option")
                 .attr("value", i)
                 .text(this.chart_types[i].name);
    }
    const select_list_type = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_type != undefined){
      select_list_type.value = this.chart_index;
    }
  }
  init_chart = () => {
    // Ustawienie skali i domeny osi x
    let chart_type = this.chart_types[this.chart_index].variable;
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
    if(this._data.length == 0) {
      this.svg.append("text")
              .attr("text-anchor", "middle")
              .attr("font-size", "24px")
              .text("Brak dywidend")
              .classed("nodata-text", true);
      return;
    }
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
            let tooltipstring = String(d[chart_type] + " " + (chart_type == "value" ? this.currency : "%"));
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
  update_chart = () => {
    if(this._data.length == 0) {
      this.svg.select(".nodata-text")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2);
      return;
    }
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
  refresh = () => {
    this.update();
    this.update_chart();
  }
}
