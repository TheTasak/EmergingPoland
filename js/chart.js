class Chart{
  _width = 0;
  _height = 0;
  _current_data_index = "";
  _data = [];
  _columns = [];
  _date_start = 2015;
  _date_end = 2020;
  _show_chart = true;
  stock_name = "";
  data_name = "";
  padding_vertical = 20;
  padding_horizontal = 100;
  chart_title = "";
  constructor(container, stock_name, data_name, start_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.data_name = data_name;
    this.start_year = start_year;
    this.currency = currency;
    this.language = language;
    this.reset();
    this.#load_data();
  }
  #get_suffix = () => {
	  let max = d3.max(this._data, d => d.value);
	  if(max >= 1000000){
		  this._data.forEach((item) => item.value /= 1000000.0);
		  this.suffix = "mld";
	  } else if(max >= 1000){
		  this._data.forEach((item) => item.value /= 1000.0);
		  this.suffix = "mln";
	  } else if(this._current_data_index == "dywidenda") {
		  this.suffix = "";
	  } else {
		  this.suffix = "tys";
	  }
  }
  #load_data = () => {
	let input_value_size = d3.select(this.container).select(".chart-input").size();
	if(input_value_size > 0)
		this._current_data_index = d3.select(this.container).select(".chart-input").property("value");
	else
		this._current_data_index = this.data_name;
	let slider = this.container.getElementsByClassName("chart-input-div")[1];
	if(slider != undefined){
		this._date_start = parseInt(slider.noUiSlider.get()[0]);
		this._date_end = parseInt(slider.noUiSlider.get()[1]);
	}

	let temp = [];
	let json_data = d3.json("php/getdata.php?data_index=" + String(this._current_data_index) + "&stock_name=" + String(this.stock_name) + "&year=" + String(this.start_year)).then( (d) => {
		let array = d;
		for(let i = 0; i < array.length; i++) {
				let date = (this.start_year*1 + i);
				if(date >= this._date_start && date <= this._date_end) {
					let push_object_data = {id: "d"+(i+1), value: parseFloat(array[i]), date: date};
          temp.push(push_object_data);
				}

		  }
		this._data = temp;
		this.#get_suffix();
		temp = [];
		d3.json("php/getcolumnstranslate.php?stock_name=" + String(this.stock_name) + "&year=" + String(this.start_year) + "&lang=" + String(this.language)).then( (columns) => {
			let col_array = columns;
			for(let i = 0; i < col_array.length; i++) {
				let column = col_array[i];
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
	d3.select(this.container)
	  .selectAll(".table-div")
	  .remove();
    // Dodanie nowego kontenera na wykres
	if(this._show_chart == true){
		this.svg = d3.select(this.container)
					.append("svg")
					.attr("width", this.width)
					.attr("height", this.height)
					.classed("chart",true);
	}
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
			.attr("value", this._columns[i].dane_ksiegowe)
			.text(this._columns[i].tlumaczenie);
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
        values: [2010,2015, 2020],
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
	fieldset.append("div")
			.classed("chart-input-div", true)
				.append("button")
				.attr("type", "button")
				.text("\u2666")
				.on("click", (d) => {this._show_chart = !this._show_chart; this.refresh();})
				.classed("chart-input", true);
  }
  #draw_title = () => {
    let index = this._columns.findIndex( (data) => {
      return data.dane_ksiegowe == this._current_data_index;
    });
    this.chart_title = this._columns[index].tlumaczenie;
    // Dodanie tytułu wykresu
    this.svg.append("text")
         .attr("x", (this.width / 2))
         .attr("y", this.padding_vertical/2 + this.padding_vertical)
         .attr("text-anchor", "middle")
         .attr("font-size", "24px")
         .text(this.chart_title);
  }
  #draw_chart = () => {
    // Ustawienie skali i domeny osi x
    const min = (d3.min(this._data, d => d.value) < 0) ? d3.min(this._data, d => d.value) : 0;
    const max = d3.max(this._data, d => d.value);
    const xScale = d3.scaleBand()
                    .range([0, this.width-this.padding_horizontal])
                    .padding(0.4)
                    .domain(this._data.map(dataPoint => dataPoint.date));
    // Ustawienie skali i domeny osi y
    const yScale = d3.scaleLinear()
                    .domain([min*1.1, max*1.1]).nice()
                    .range([this.heightpadding,this.padding_vertical]);
    const g = this.svg.append("g")
                .attr("transform", "translate(" + this.padding_horizontal*(2/3) + ",0)");
    // Dodanie dolnej osi wykresu
    g.append("g")
		.classed("axis_bottom",true)
		.call(d3.axisBottom(xScale))
		.attr("transform","translate(0," + this.heightpadding + ")");
    // Dodanie lewej osi wykresu
    g.append("g")
		.classed("axis_left",true)
		.call(d3.axisLeft(yScale).tickFormat( (d) => {
			return d.toString() + this.suffix;
		}).ticks(10))
		.append("text")
		.attr("text-anchor", "end")
		.text("value");
  // Dodanie poziomych linii pomocniczych
	g.append("g")
		.classed("grid", true)
	    .call(d3.axisLeft(yScale).tickSize(-this.width+this.padding_horizontal).tickFormat("").ticks(10));
    // Dodanie słupków wartości
  const bars = this.svg
      .selectAll('.bar')
      .data(this._data)
      .enter()
      .append('rect')
      .classed('bar',true)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('x', data => xScale(data.date)+this.padding_horizontal-this.padding_horizontal/3);
  //Ustawienie kolorów słupków na bazie ich wartości - powyżej 0, poniżej 0
  this.svg.selectAll(".bar")
      .filter(data => data.value >= 0)
      .style("fill", "#FC3535")
      .attr('y', data => yScale(0));
  this.svg.selectAll(".bar")
      .filter(data => data.value < 0)
      .style("fill", "#993535")
      .attr('y', data => yScale(min))
  // Animacja pojawiania się słupków z opóźnieniem - dla wartości dodatnich
  this.svg.selectAll(".bar")
      .filter(data => data.value >= 0)
      .transition()
      .duration(600)
      .delay(function(d,i){return(i*200)})
      .attr("y", data => yScale(data.value))
      .attr("height", data => this.heightpadding - yScale(data.value) - (this.heightpadding - yScale(0)));
  // Animacja pojawiania się słupków z opóźnieniem - dla wartości ujemnych
  this.svg.selectAll(".bar")
      .filter(data => data.value < 0)
      .transition()
      .duration(600)
      .delay(function(d,i){return(i*200)})
      .attr("y", data => yScale(0))
      .attr("height", data => yScale(data.value) - yScale(0));
  // Dodanie tooltipa pokazującego wartość słupka po najechaniu
	const tooltip = this.svg.append("rect")
						.attr("width", "0px")
						.attr("height", "0px")
						.style("fill", "white")
						.style("stroke", "black")
						.classed("tooltip", true)
	const tooltiptext = this.svg.append("text")
						.classed("tooltip-text", true);
  //Obsługa eventów tooltipa
	this.svg.selectAll('.bar')
			.on("mousemove", (ev, d) => {
        let tooltipsize = [String(d.value + this.suffix + this.currency).length*12, this.height / 8];
				let tooltippos = [d3.pointer(ev)[0]- tooltipsize[0]/2, d3.pointer(ev)[1]-80];

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
  				.text(d.value + this.suffix + " " + this.currency);
			})
			.on("mouseout", function(ev){
				tooltip
					.style("opacity", "0")
          .attr("width", 0);
				tooltiptext
					.attr("display", "none");
			});
  }
  #draw_table = () => {
	  let data_string = '<table class="data_table">';
	  for(let i = 0; i < this._data.length; i++){
		  data_string += "<tr><td>" + this._data[i].date + "</td><td>" + this._data[i].value + this.suffix + "</td></tr>";
	  }
	  data_string += "</table>";
	  d3.select(this.container)
		.append("div")
  		.attr("width", this.width)
  		.attr("height", this.height)
  		.html(data_string)
  		.classed("table-div", true);
  }
  refresh = () => {
    this.reset();
	if(this._show_chart){
		this.#draw_inputs();
		this.#draw_chart();
		this.#draw_title();
	} else {
		this.#draw_table();
		this.#draw_inputs();
	}
  }
}
