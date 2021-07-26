class InneChart{
  padding_vertical = 20;
  padding_horizontal = 100;
  constructor(container, stock_name, start_year, end_year, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.language = language;
  }
  load_data = () => {
  	d3.json("php/getinne.php?stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.end_year+ "&lang=" + this.language).then( (d) => {
      // Wyciąga z bazy kolumny z danymi
      this._data = d;
      let properties = Object.getOwnPropertyNames(this._data);
      for(let i = 0; i < properties.length; i++) {
        let temp = this._data[properties[i]];
        temp.forEach((item, i) => {
          item.value = parseFloat(item.value);
        });
      }
      this.init();
  	});
  }
  init = () => {
    const select_list_index = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_index != undefined)
      this.current_chart_index = select_list_index.value;
    else
      this.current_chart_index = 0;
    // Usunięcie starego wykresu
    d3.select(this.container)
      .html("");

    d3.select(this.container)
      .append("div")
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .classed("svg-div", true);
		this.svg = d3.select(this.container)
                 .select(".svg-div")
        				 .append("svg")
        				     .classed("chart",true);
    this.update();
    this.init_inputs();
    this.init_chart();
    this.refresh();
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight)*0.75;

    this.heightpadding = this.height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    this.svg.attr("width", this.width)
            .attr("height", this.height);
  }
  init_inputs = () => {
    const field_type = d3.select(this.container)
                    .select(".button-div")
			              .append("select")
  		                 .on("change", this.init)
  		                 .classed("chart-input", true);
    //Załadowanie opcji do pola
    const field_options = Object.getOwnPropertyNames(this._data);
  	for(let i = 0; i < field_options.length; i++){
  		field_type.append("option")
  			         .attr("value", i)
  			         .text(field_options[i]);
  	}
    //Ustawienie opcji pola na ostatnio wybraną
  	const select_list_type = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_type != undefined){
  		select_list_type.value = this.current_chart_index;
  	}
  }
  init_chart = () => {
    // Ustawienie skali i domeny osi x
    let current_data = this._data[Object.getOwnPropertyNames(this._data)[this.current_chart_index]];
    current_data = current_data.filter(d => !isNaN(d.value));
    const min = d3.min(current_data, d => d.value) < 0 ? d3.min(current_data, d => d.value) : 0;
    const max = d3.max(current_data, d => d.value) > 0 ? d3.max(current_data, d => d.value) : 1;
    this.xScale = d3.scaleBand()
                    .padding(0.4)
                    .domain(current_data.map(d => d.year));
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
    // Dodanie słupków wartości
    this.bars = this.svg
          .selectAll('.bar')
          .data(current_data)
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
            console.log("mouseover bar < 0");
            ev.target.style.fill = "#997777";
          })
          .on("mouseleave", (ev) => {
            console.log(ev);
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
            let text = String(d.value);
            let tooltipsize = [text.length*10+30, 40];
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
      				.text(text);
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
    this.xScale.range([0, this.width-this.padding_horizontal]);
    this.g.select(".axis_bottom")
          .html("")
          .call(d3.axisBottom(this.xScale))
          .attr("transform","translate(0," + this.heightpadding + ")");

    this.g.select(".grid")
          .html("")
          .call(d3.axisLeft(this.yScale).tickSize(-this.width+this.padding_horizontal).tickFormat("").ticks(10));
    this.bars.attr('width', this.xScale.bandwidth())
             .attr('x', data => this.xScale(data.year)+this.padding_horizontal-this.padding_horizontal/3);
  }
  refresh = () => {
    this.update();
    clearTimeout(this.resizeTimer);
  	this.resizeTimer = setTimeout(this.update_chart, 10);
  }
}
