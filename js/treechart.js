class TreeChart{
  year = 2020;
  _show_chart = true;
  constructor(container, stock_name, start_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.currency = currency;
    this.language = language;
    this.#load_data();
  }
  #earlier_year = () => {
		if(this.year <= this.start_year)
			return;
		this.year--;
		this.#load_data();
	}
	#later_year = () => {
		if(this.year >= 2020)
			return;
		this.year++;
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
    } else {
		  this.suffix = "tys";
	  }
  }
  #reset = () => {
    // Robi reset div'a wykresu, rysuje go od nowa
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    d3.select(this.container)
      .selectAll(".button-div")
      .remove();
      d3.select(this.container)
        .selectAll(".svg-div")
        .remove();
    this.svg_height = this.height*0.8;
		this.button_height = this.width*0.2;
    d3.select(this.container)
      .append("div")
        .attr("height", this.button_height)
        .attr("width", this.width)
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .attr("height", this.svg_height)
        .attr("width", this.width)
        .classed("svg-div", true);
    this.svg = d3.select(this.container)
                 .select(".svg-div")
                 .append("svg")
                  .attr("height", this.svg_height)
                  .attr("width", this.width);

  }
  #load_data = () => {
    d3.json("php/getearnings.php?stock_name=" + this.stock_name + "&date=" + this.year + "&lang=" + this.language).then((d) => {
      this._data = d;
      if(this._data.length <= 0){
				this.year--;
				this.#load_data();
				return;
			}
      this._data.forEach((item, i) => {
        item.value = parseFloat(item.value);
      });
      this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
      this.#get_suffix();
      this.refresh();
    });
  }
  #draw_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Podział przychodów")
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
      .on("click", () => {this._show_chart = !this._show_chart; this.refresh();})
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".tree-button-div")
			.append("button")
			.attr("type", "button")
			.text("🠖")
			.on("click", this.#later_year)
			.classed("treechart-button", true);
  }
  #draw_chart = () => {
    let padding_vertical = 40;
    let padding_horizontal = 50;
    const max = d3.max(this._data, d => d.value);
    this.xScale = d3.scaleLinear()
                    .domain([0, max]).nice()
                    .range([padding_horizontal, this.width - padding_horizontal]);
    this.g = this.svg.append("g")
                    .attr("transform", "translate(" + padding_horizontal*(2/3) + ",0)");
    this.g.append("g")
            .attr("transform", "translate(0," + (this.svg_height - padding_vertical) + ")")
            .call(d3.axisBottom(this.xScale).tickFormat( (d) => {
        			return d.toString() + this.suffix;
        		}));
    this.yScale = d3.scaleBand()
                    .range([0, this.svg_height - padding_vertical])
                    .domain(this._data.map(d => d.name))
                    .padding(1);
    this.g.append("g")
            .attr("transform", "translate(" + padding_horizontal +",0)")
            .call(d3.axisLeft(this.yScale));
    this.g.selectAll(".lolipop-line")
          .data(this._data)
          .enter()
          .append("line")
            .attr("x1", d => this.xScale(d.value))
            .attr("x2", this.xScale(0))
            .attr("y1", d => this.yScale(d.name))
            .attr("y2", d => this.yScale(d.name))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
      this.g.selectAll(".lolipop-circle")
          .data(this._data)
          .enter()
          .append("circle")
            .attr("cx", d => this.xScale(d.value))
            .attr("cy", d => this.yScale(d.name))
            .attr("r", "7")
            .style("fill", "red")
            .attr("stroke", "black");
  }
  #draw_table = () => {
    let earnings_string = '<table class="earnings-table">';
		for(let i = 0; i < this._data.length; i++){
			earnings_string += "<tr><td align='center'>" + this._data[i].translate + "</td><td align='right'>" + this._data[i].value + this.suffix + " " + this.currency + "</td></tr>";
		}
    earnings_string += "<tr><td align='center'>" + "Suma przychodów:" + "</td><td align='right'>" + parseFloat(d3.sum(this._data, d => d.value)).toFixed(4) + this.suffix + " " + this.currency + "</td></tr>";
		earnings_string += "</table>";
		d3.select(this.container).select(".svg-div").html(earnings_string);
  }
  refresh = () => {
    this.#reset();
    this.#draw_inputs();
    if(this._show_chart)
      this.#draw_chart();
    else
      this.#draw_table();
  }
}
