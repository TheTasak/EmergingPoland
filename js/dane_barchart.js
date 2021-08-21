class Chart{
  current_data_index = "";
  columns = [];
  padding_vertical = 20;
  padding_horizontal = 100;
  constructor(container, stock_name, data_name, chart_type, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.data_name = data_name;
    this.chart_type = chart_type;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.end_quarter = end_year.split("_")[1];
    this.current_chart_end = this.end_year;
    this.current_chart_start = (this.end_year - this.start_year > 5 ? this.end_year-5 : this.start_year);
    this.currency = currency;
    this.language = language;
  }
  getSuffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let max = d3.max(this.data, d => d.value);
	  if(max >= 1000000){
		  this.data.forEach((item) => item.value /= 1000000.0);
		  this.suffix = "mld";
	  } else if(max >= 1000){
		  this.data.forEach((item) => item.value /= 1000.0);
		  this.suffix = "mln";
	  } else {
		  this.suffix = "tys";
	  }
  }
  load_data = () => {
    // Jeżeli inputy nie są jeszcze narysowane ustawia pobierane dane na wartość domyślną
    let input_value = d3.select(this.container).select(".chart-input");
  	if(input_value.size() > 0 && input_value.property("value") != "")
  		this.current_data_index = input_value.property("value");
  	else
  		this.current_data_index = this.data_name;
    let slider = this.container.getElementsByClassName("slider-div")[0];
    if(slider != undefined){
        this.current_chart_start = parseInt(slider.noUiSlider.get()[0]);
        this.current_chart_end = parseInt(slider.noUiSlider.get()[1]);
    }
	  d3.json("php/getdata.php?stock_name=" + String(this.stock_name) + "&data_index=" + String(this.current_data_index) + "&start_year=" + String(this.current_chart_start) + "&end_year=" + String(this.current_chart_end)+ "&type=" + this.chart_type).then( (data) => {
    // Wyciąga z bazy kolumny z danymi
      this.data = [];
      for(let i = 0; i < data.length; i++) {
        this.data.push({
          id: "d"+(i+1),
          value: parseFloat(data[i]["value"]),
          date: data[i]["date"]
        });
      }
  		this.getSuffix();
  		d3.json("php/getcolumnstranslate.php?stock_name=" + String(this.stock_name) + "&year=" + String(this.start_year) + "&lang=" + String(this.language)).then( (columns) => {
        // A potem ich tłumaczenie na bazie języka
        this.columns = columns;
        this.init();
  		});
	   });
  }
  init = () => {
    // Usunięcie starego wykresu
    d3.select(this.container)
      .html("");

		this.svg = d3.select(this.container)
					.append("svg")
					.classed("chart",true);
    d3.select(this.container)
      .append("div")
      .classed("button-div", true);

    this.update();
    this.initInputs();
    this.initChart();
    this.initTitle();
    this.refresh();
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight);
    this.button_height = parseInt(this.container.clientHeight)*0.2;
    this.svg_height = parseInt(this.container.clientHeight)*0.8;

    this.heightpadding = this.svg_height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;

    this.svg.attr("width", this.width)
            .attr("height", this.svg_height);
    d3.select(this.container)
      .select(".button-div")
      .attr("width", this.width)
      .attr("height", this.button_height);
  }
  initInputs = () => {
    //Pole pozwalające wybrać typ danych
    const button_div = d3.select(this.container)
                        .select(".button-div");
    const field = button_div.append("select")
                						.on("change", this.load_data)
                						.classed("chart-input", true);
    //Załadowanie opcji do pola
  	for(let i = 0; i < this.columns.length; i++){
  		field.append("option")
  			.attr("value", this.columns[i].dane_ksiegowe)
  			.text(this.columns[i].tlumaczenie);
  	}
    //Ustawienie opcji pola na ostatnio wybraną
  	const select_list = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list != undefined){
  		select_list.value = this.current_data_index;
  	}
    //Pojemnik na suwak dat
    button_div.append("div").classed("button-div", true);
    const slider_button_div = button_div.append("div")
                                        .classed("input-div", true);
    slider_button_div.append("div")
                    .classed("slider-div", true);

  	const drag_slider = this.container.getElementsByClassName("slider-div")[0];
    if(this.chart_type == "year") {
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
    } else if(this.chart_type == "quarter") {
      noUiSlider.create(drag_slider, {
        start: [this.current_chart_end-1, this.current_chart_end],
        step: 1,
        limit: 1,
        behaviour: 'drag-fixed',
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
    }
	  drag_slider.noUiSlider.on("change", this.load_data);

    //Przyciski do zmiany typu wykresu i zamiany na tabelę
    slider_button_div.append("button")
        .classed("chart-button", true)
        .attr("type", "button")
        .on("click", () => {this.chart_type = (this.chart_type == "year" ? "quarter" : "year"); this.load_data();})
        .html( this.chart_type == "year" ? "<b>Rok</b>/Kwartał" : "Rok/<b>Kwartał</b>");
  }
  initTitle = () => {
    //Wczytanie tłumaczenia tytułu wykresu
    let index = this.columns.findIndex( (data) => {
      return data.dane_ksiegowe == this.current_data_index;
    });
    this.chart_title = this.columns[index].tlumaczenie;
    // Dodanie tytułu wykresu
    this.svg.append("text")
         .attr("text-anchor", "middle")
         .attr("font-size", "24px")
         .text(this.chart_title)
         .classed("title", true);
  }
  update_title = () => {
    this.svg.select(".title")
            .attr("x", (this.width / 2))
            .attr("y", this.padding_vertical/2 + this.padding_vertical);
  }
  initChart = () => {
    // Ustawienie skali i domeny osi x
    const min = d3.min(this.data, d => d.value) < 0 ? d3.min(this.data, d => d.value) : 0;
    const max = d3.max(this.data, d => d.value) > 0 ? d3.max(this.data, d => d.value) : 1;
    this.xScale = d3.scaleBand()
                    .padding(0.4)
                    .domain(this.data.map(dataPoint => dataPoint.date));
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
          .data(this.data)
          .enter()
          .append("g")
          .classed("bar-group", true)
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
     this.bars
          .filter(data => data.value >= 0)
          .transition()
          .ease(d3.easeQuadOut)
          .duration(800)
          .delay(function(d,i){return(i*200)})
          .attr("y", data => this.yScale(data.value))
          .attr("height", data => this.heightpadding - this.yScale(data.value) - (this.heightpadding - this.yScale(0)));
     // Animacja pojawiania się słupków z opóźnieniem - dla wartości ujemnych
     this.bars
          .filter(data => data.value < 0)
          .transition()
          .ease(d3.easeQuadOut)
          .duration(800)
          .delay(function(d,i){return(i*200)})
          .attr("y", data => this.yScale(0))
          .attr("height", data => this.yScale(data.value) - this.yScale(0));
     this.svg.selectAll(".bar-group")
          .filter( (d,i) => i > 0)
          .append("text")
          .style("user-select", "none")
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .html( (d,i) => {
            let percent = parseFloat(this.data[i+1].value / this.data[i].value * 100 - 100).toFixed(2);
            if(percent >= 0)
              return "+" + percent + "%";
            else if(this.data[i].value < 0)
              return "+" + String(percent).slice(1) + "%";
            else
              return percent + "%";
          })
          .attr("y", (d,i) => {
            if(d.value > 0)
              return this.yScale(this.data[i+1].value) - 10;
            else
              return this.yScale(this.data[i+1].value) + 15;
          })
          .attr("fill", (d,i) => {
            let percent = parseFloat(this.data[i+1].value / this.data[i].value * 100 - 100).toFixed(2);
            if(percent >= 0)
              return "green";
            else if(this.data[i].value < 0)
              return "green";
            else
              return "red";
          })
          .classed("percent-change", true);
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
            let value = d.value + this.suffix + " " + this.currency;
            let tooltipsize = [String(value).length*10+10, 40];
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
  updateChart = () => {
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
    this.svg.selectAll(".percent-change")
            .attr("x", data =>  this.xScale(data.date)+this.padding_horizontal-this.padding_horizontal/3 + this.xScale.bandwidth() / 2);
  }
  refresh = () => {
    this.update();
    clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout(this.updateChart, 50);
    this.update_title();
  }
}
