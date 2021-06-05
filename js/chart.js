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
  constructor(container, stock_name, data_name, chart_type, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.data_name = data_name;
    this.chart_type = chart_type;
    this.start_year = start_year;
    this.end_year = end_year;
    this.currency = currency;
    this.language = language;
    this.#load_data();
  }
  #get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
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
	let input_value = d3.select(this.container).select(".chart-input");
  // Jeżeli inputy nie są jeszcze narysowane ustawia pobierane dane na wartość domyślną
	if(input_value.size() > 0 && input_value.property("value") != "")
		this._current_data_index = input_value.property("value");
	else
		this._current_data_index = this.data_name;
	let slider = this.container.getElementsByClassName("slider-div")[0];
	if(slider != undefined){
      this._date_start = parseInt(slider.noUiSlider.get()[0]);
  		this._date_end = parseInt(slider.noUiSlider.get()[1]);
	}

	let temp = [];
	let json_data = d3.json("php/getdata.php?data_index=" + String(this._current_data_index) + "&stock_name=" + String(this.stock_name) + "&start_year=" + String(this._date_start) + "&end_year=" + String(this._date_end)+ "&type=" + this.chart_type).then( (d) => {
    // Wyciąga z bazy kolumny z danymi
    let array = d;
    for(let i = 0; i < array.length; i++) {
      let push_object_data = {id: "d"+(i+1), value: parseFloat(array[i]["value"]), date: array[i]["date"]};
      temp.push(push_object_data);
    }
		this._data = temp;
		this.#get_suffix();
		temp = [];
		d3.json("php/getcolumnstranslate.php?stock_name=" + String(this.stock_name) + "&year=" + String(this.start_year) + "&lang=" + String(this.language)).then( (columns) => {
      // A potem ich tłumaczenie na bazie języka
      let col_array = columns;
			for(let i = 0; i < col_array.length; i++) {
				let column = col_array[i];
				temp.push(column);
			}
			this._columns = temp;
      this.init();
		});
	});

  }
  init = () => {
    // Usunięcie starego wykresu
    d3.select(this.container)
      .selectAll(".chart")
      .remove();
    d3.select(this.container)
      .selectAll(".chart-input-field")
      .remove();
  	d3.select(this.container)
  	  .selectAll(".table-div")
  	  .remove();

  	if(this._show_chart){
  		this.svg = d3.select(this.container)
  					.append("svg")
  					.classed("chart",true);
  	}
    this.#update();
    if(this._show_chart) {
      this.#init_inputs();
      this.#init_chart();
      this.#init_title();
    } else {
      this.#init_table();
      this.#init_inputs();
    }
    this.refresh();
  }
  #update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight)-100;
    this.heightpadding = this.height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    if(this._show_chart) {
      this.svg.attr("width", this.width)
              .attr("height", this.height)
    }
  }
  #init_inputs = () => {
    //Pojemnik na inputy
    const fieldset = d3.select(this.container)
                      .append("fieldset")
                      .classed("chart-input-field", true);
    //Pole pozwalające wybrać typ danych
    const field = fieldset.append("div")
					.classed("chart-input-div", true)
					.append("select")
						.on("change", this.#load_data)
						.classed("chart-input", true);
    //Załadowanie opcji do pola
  	for(let i = 0; i < this._columns.length; i++){
  		field.append("option")
  			.attr("value", this._columns[i].dane_ksiegowe)
  			.text(this._columns[i].tlumaczenie);
  	}
    //Ustawienie opcji pola na ostatnio wybraną
  	const select_list = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list != undefined){
  		select_list.value = this._current_data_index;
  	}
    //Pojemnik na suwak dat
  	const buttons = fieldset.append("div")
  			.classed("chart-button-div", true);

    buttons.append("div")
      .classed("slider-div", true);

  	const drag_slider = this.container.getElementsByClassName("slider-div")[0];
    if(this.chart_type == "year") {
      noUiSlider.create(drag_slider, {
        start: [this._date_start, this._date_end],
        step: 1,
        behaviour: 'drag',
        pips: {
            mode: 'values',
            values: [parseInt(this.start_year), parseInt(this.start_year) + parseInt((2020-this.start_year)/2), 2020],
            density: 10,
            stepped: true
        },
        connect: true,
        range: {
            'min': parseInt(this.start_year),
            'max': 2020
        }
      });
    } else if(this.chart_type == "quarter") {
      noUiSlider.create(drag_slider, {
        start: [this._date_end-1, this._date_end],
        step: 1,
        limit: 1,
        behaviour: 'drag-fixed',
        pips: {
            mode: 'values',
            values: [parseInt(this.start_year), parseInt(this.start_year) + parseInt((2020-this.start_year)/2), 2020],
            density: 10,
            stepped: true
        },
        connect: true,
        range: {
            'min': parseInt(this.start_year),
            'max': 2020
        }
      });
    }
	  drag_slider.noUiSlider.on("change", this.#load_data);

    //Przyciski do zmiany typu wykresu i zamiany na tabelę
	  buttons.append("div")
            .append("button")
      				.attr("type", "button")
      				.on("click", () => {this._show_chart = !this._show_chart; this.init();})
      				.classed("chart-input", true)
              .append("img")
                .attr("src", "table_icon.png");
    buttons.append("div")
				   .append("button")
  				    .attr("type", "button")
              .attr("font-size", "16px")
      				.on("click", () => {this.chart_type = (this.chart_type == "year") ? "quarter" : "year"; this.#load_data();})
      				.classed("chart-input", true)
              .append("img")
                .attr("src", "chart_type.png");
  }
  #init_title = () => {
    //Wczytanie tłumaczenia tytułu wykresu
    let index = this._columns.findIndex( (data) => {
      return data.dane_ksiegowe == this._current_data_index;
    });
    this.chart_title = this._columns[index].tlumaczenie;
    // Dodanie tytułu wykresu
    this.svg.append("text")
         .attr("text-anchor", "middle")
         .attr("font-size", "24px")
         .text(this.chart_title)
         .classed("title", true);
  }
  #update_title = () => {
    this.svg.select(".title")
            .attr("x", (this.width / 2))
            .attr("y", this.padding_vertical/2 + this.padding_vertical);
  }
  #init_chart = () => {
    // Ustawienie skali i domeny osi x
    const min = (d3.min(this._data, d => d.value) < 0) ? d3.min(this._data, d => d.value) : 0;
    const max = d3.max(this._data, d => d.value);
    this.xScale = d3.scaleBand()
                    .padding(0.4)
                    .domain(this._data.map(dataPoint => dataPoint.date));
    // Ustawienie skali i domeny osi y
    this.yScale = d3.scaleLinear()
                    .domain([min*0.9, max*1.2]).nice()
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
      			return d.toString() + this.suffix;
      		}).ticks(10))
          .style("user-select", "none")
      		.append("text")
      		.attr("text-anchor", "end")
      		.text("value");
    // Dodanie poziomych linii pomocniczych
  	this.g.append("g")
		      .classed("grid", true);
    // Dodanie słupków wartości
    this.bars = this.svg
          .selectAll('.bar')
          .data(this._data)
          .enter()
          .append('rect')
          .classed('bar',true)
          .attr('height', 0);
    //Ustawienie kolorów słupków na bazie ich wartości - powyżej 0, poniżej 0
    this.svg.selectAll(".bar")
          .filter(data => data.value >= 0)
          .style("fill", "#FC3535")
          .attr('y', data => this.yScale(0))
          .on("mouseover", (ev) => {
            ev.target.style.fill = "#FC7777";
          })
          .on("mouseleave", (ev) => {
            ev.target.style.fill = "#FC3535";
          });
     this.svg.selectAll(".bar")
          .filter(data => data.value < 0)
          .style("fill", "#993535")
          .attr('y', data => this.yScale(min))
          .on("mouseover", (ev) => {
            ev.target.style.fill = "#997777";
          })
          .on("mouseleave", (ev) => {
            ev.target.style.fill = "#993535";
          });
     // Animacja pojawiania się słupków z opóźnieniem - dla wartości dodatnich
     this.svg.selectAll(".bar")
          .filter(data => data.value >= 0)
          .transition()
          .duration(600)
          .delay(function(d,i){return(i*200)})
          .attr("y", data => this.yScale(data.value))
          .attr("height", data => this.heightpadding - this.yScale(data.value) - (this.heightpadding - this.yScale(0)));
     // Animacja pojawiania się słupków z opóźnieniem - dla wartości ujemnych
     this.svg.selectAll(".bar")
          .filter(data => data.value < 0)
          .transition()
          .duration(600)
          .delay(function(d,i){return(i*200)})
          .attr("y", data => this.yScale(0))
          .attr("height", data => this.yScale(data.value) - this.yScale(0));
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
            let tooltipsize = [String(d.value + this.suffix + this.currency).length*12, 40];
    				let tooltippos = [d3.pointer(ev)[0]- tooltipsize[0]/2, d3.pointer(ev)[1] - tooltipsize[1] - 10];

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
  #update_chart = () => {
    this.xScale.range([0, this.width-this.padding_horizontal]);
    this.g.select(".axis_bottom")
          .html("")
          .call(d3.axisBottom(this.xScale))
          .attr("transform","translate(0," + this.heightpadding + ")");

    this.g.select(".grid")
          .html("")
          .call(d3.axisLeft(this.yScale).tickSize(-this.width+this.padding_horizontal).tickFormat("").ticks(10));
    this.bars.attr('width', this.xScale.bandwidth())
             .attr('x', data => this.xScale(data.date)+this.padding_horizontal-this.padding_horizontal/3);
  }
  #init_table = () => {
	  let data_string = '<table class="data_table">';
	  for(let i = 0; i < this._data.length; i++){
      let percent = "";
      if(i != 0 && this._data[i-1].value != 0) {
        percent = parseFloat(this._data[i].value/this._data[i-1].value*100 - 100).toFixed(2);
        percent = (percent > 0) ? "+" + percent + "%" : percent + "%";
      }
		  data_string += "<tr><td>" + this._data[i].date + "</td><td>" + this._data[i].value + this.suffix + " " + this.currency + "</td><td>" + percent + "</td></tr>";
	  }
	  data_string += "</table>";
	  d3.select(this.container)
		.append("div")
  		.html(data_string)
  		.classed("table-div", true);
  }
  #update_table = () => {
    d3.select(".table-div")
      .attr("width", this.width)
      .attr("height", this.height);
  }
  refresh = () => {
    this.#update();
  	if(this._show_chart){
  		this.#update_chart();
      this.#update_title();
  	} else {
  		this.#update_table();
	  }
  }
}
