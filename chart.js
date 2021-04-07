class Chart{
  _width = 0;
  _height = 0;
  _current_data_index = "";
  _data = [];
  _columns = [];
  _date_start = 2015;
  _date_end = 2020;
  stock_name = "";
  data_name = "";
  padding_vertical = 20;
  padding_horizontal = 100;
  chart_title = "";
  suffix = "";
  constructor(container, stock_name, data_name, suffix){
    this.container = container;
    this.stock_name = stock_name;
    this.chart_title = data_name;
    this.suffix = suffix;
    this.reset();
    this.#load_data();
  }
  #get_suffix = () => {
	  let max = d3.max(this._data, d => d.value);
	  if(max >= 1000000){
		  this._data.forEach((item) => item.value = item.value / 1000000.0);
		  this.suffix = "mld$";
	  } else if(max >= 1000){
		  this._data.forEach((item) => item.value = item.value / 1000.0);
		  this.suffix = "mln$";
	  } else if(this._current_data_index == "dywidenda") {
		  this.suffix = "$";
	  } else {
		  this.suffix = "tys$";
	  }
  }
  #load_data = () => {
	let input_value_size = d3.select(this.container).select(".chart-input").size();
	if(input_value_size > 0)
		this._current_data_index = d3.select(this.container).select(".chart-input").property("value");
	else
		this._current_data_index = this.chart_title;
	this.chart_title = this._current_data_index;
	this.chart_title = this.chart_title.replace(/_/g, " ");
	
	let slider = this.container.getElementsByClassName("chart-input-div")[1];
	if(slider != undefined){
		this._date_start = parseInt(slider.noUiSlider.get()[0]);
		this._date_end = parseInt(slider.noUiSlider.get()[1]);
	}
	
	let temp = [];
	let json_data = d3.json("getdata.php?data_index=" + String(this._current_data_index) + "&stock_name=" + String(this.stock_name)).then( (d) => {
		let array = d;
		for(let i = 0; i < array.length; i++) {
				let date = "20" + (10+i);
				if(date >= this._date_start && date <= this._date_end) {
					let push_object_data = {id: "d"+(i+1), value: array[i], date: date};
					temp.push(push_object_data);
				}
		  }
		this._data = temp;
		this.#get_suffix();
		temp = [];
		d3.json("getcolumns.php?stock_name=" + String(this.stock_name)).then( (columns) => {
			let col_array = columns;
			for(let i = 0; i < col_array.length; i++) {
				let column = col_array[i].dane_ksiegowe;
				temp.push(column);
			}
			this._columns = temp;
			this.refresh();
		});
	});
	
  }
  reset = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight)-80;
    this.heightpadding = this.height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    // Usunięcie starego wykresu
    const old_svg = d3.select(this.container)
                  .selectAll(".chart")
                  .remove();
    d3.select(this.container)
      .selectAll(".chart-input-field")
      .remove();
    // Dodanie nowego kontenera na wykres
    this.svg = d3.select(this.container)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .classed("chart",true);
  }
  #draw_inputs = () => {
    const fieldset = d3.select(this.container)
                      .append("fieldset")
                      .classed("chart-input-field", true);
    const field = fieldset.append("div")
					.classed("chart-input-div", true)
					.append("select")
						.on("blur", this.#load_data)
						.classed("chart-input", true);
	for(let i = 0; i < this._columns.length; i++){
		field.append("option")
			.attr("value", this._columns[i])
			.text(this._columns[i]);
	}
	const select_list = this.container.getElementsByClassName("chart-input")[0];
	if(select_list != undefined){
		select_list.value = this._current_data_index;
	}
	fieldset.append("div")
			.classed("chart-input-div", true);
			
	const drag_slider = this.container.getElementsByClassName("chart-input-div")[1];
	
	noUiSlider.create(drag_slider, {
    start: [this._date_start, this._date_end],
	step: 1,
    behaviour: 'drag',
	pips: {
        mode: 'values',
        values: [2010, 2015, 2020],
        density: 10,
        stepped: true
    },
    connect: true,
    range: {
        'min': 2010,
        'max': 2020
    }
	});
	drag_slider.noUiSlider.on("change", this.#load_data);
  }
  #draw_title = () => {
    // Dodanie tytułu wykresu
    this.svg.append("text")
         .attr("x", (this.width / 2))
         .attr("y", this.padding_vertical/2 + this.padding_vertical)
         .attr("text-anchor", "middle")
         .attr("font-size", "20px")
         .text(this.chart_title);
  }
  #draw_chart = () => {
    // Ustawienie skali i domeny osi x
    const xScale = d3.scaleBand()
                    .range([0, this.width-this.padding_horizontal])
                    .padding(0.4)
                    .domain(this._data.map(dataPoint => dataPoint.date));
    // Ustawienie skali i domeny osi y
    const yScale = d3.scaleLinear()
                    .domain([0,d3.max(this._data, d => d.value)*1.1]).nice()
                    .range([this.heightpadding,this.padding_vertical]);
    const g = this.svg.append("g")
                .attr("transform", "translate(" + this.padding_horizontal*(2/3) + ",0)");
    // Dodanie dolnej osi wykresu
    g.append("g")
      .classed("axis_bottom",true)
      .call(d3.axisBottom(xScale))
      .attr("transform","translate(0," + this.heightpadding + ")");
    // Dodanie lewej osi wykresu
	let suf = this.suffix;
    g.append("g")
       .classed("axis_left",true)
       .call(d3.axisLeft(yScale).tickFormat(function(d){
           return d.toString() + suf;
       }).ticks(10))
       .append("text")
       .attr("text-anchor", "end")
       .text("value");
	   
    // Dodanie słupków wartości
    const bars = this.svg
        .selectAll('.bar')
        .data(this._data)
        .enter()
        .append('rect')
        .classed('bar',true)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('x', data => xScale(data.date)+this.padding_horizontal-this.padding_horizontal/3)
        .attr('y', data => yScale(0));
    // Animacja pojawiania się słupków z opóźnieniem
    this.svg.selectAll("rect")
        .transition()
        .duration(600)
        .attr("y", data => yScale(data.value) )
        .attr("height", data => this.height - yScale(data.value) - this.padding_vertical)
        .delay(function(d,i){return(i*200)});
		
	const tooltip = this.svg.append("rect")
						.attr("width", "0px")
						.attr("height", "0px")
						.style("fill", "white")
						.style("stroke", "black")
						.classed("tooltip", true)
	const tooltiptext = this.svg.append("text")
						.classed("tooltip-text", true);
			
	this.svg.selectAll('.bar')
			.on("mousemove", (ev, d) => {
				let tooltippos = [d3.pointer(ev)[0]-55, d3.pointer(ev)[1]-60];
				let tooltipsize = [this.width / 6, this.height / 8];
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
				.text(d.value + this.suffix);
			})
			.on("mouseout", function(ev){ 
				tooltip
					.attr("width", "0px")
					.attr("height", "0px")
					.style("opacity", "0");
				tooltiptext
					.attr("display", "none");
			});
  }
  refresh = () => {
    this.reset();
    this.#draw_inputs();
    this.#draw_chart();
    this.#draw_title();
  }
}
