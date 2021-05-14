class PieChart{
  year = 2020;
  show_table = false;
  constructor(container, stock_name, start_year){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
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
  #reset = () => {
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
    if(!this.show_table) {
      this.svg = d3.select(this.container)
                   .select(".svg-div")
                   .append("svg")
                    .attr("height", this.svg_height)
                    .attr("width", this.width);
    }
  }
  #load_data = () => {
    d3.json("php/getgroupstocks.php?stock_name=" + this.stock_name + "&date=" + this.year).then((d) => {
      if(d == null || d.length == 0)
        throw "undefined data";
      else {
        this._data = d;
        this._data.forEach((item, i) => {
          item.value = parseInt(item.value);
        });
        this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
        this._data.forEach((item, i) => {
          item.id = parseInt(i);
        });
        this.refresh();
      }
    }).catch(error => {
        console.error(error);
    });
  }
  #draw_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
  			.text("Podział akcji spółki")
  			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
      .append("div")
        .classed("pie-button-div", true);
    d3.select(this.container)
			.select(".pie-button-div")
			.append("button")
  			.attr("type", "button")
  			.text("🠔")
  			.on("click", this.#earlier_year)
  			.classed("piechart-button", true);
		d3.select(this.container)
			.select(".pie-button-div")
			.append("span")
  			.style("padding", "0 10px")
  			.text(this.year)
        .on("click", () => {this.show_table = !this.show_table; this.refresh();})
  			.classed("piechart-button", true);
		d3.select(this.container)
			.select(".pie-button-div")
			.append("button")
  			.attr("type", "button")
  			.text("🠖")
  			.on("click", this.#later_year)
  			.classed("piechart-button", true);
  }
  #draw_chart = () => {
    let radius = Math.min(this.width, this.svg_height) / 2;
    const g = d3.select(this.container).select("svg")
                .append("g")
                .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")");
    let colors = d3.scaleLinear()
                   .domain([0,this._data.length])
                   .range(["red", "black"]);
    let pie = d3.pie()
      .value( d => d.value);
    let data_ready = pie(this._data);

    let arc = d3.arc()
                .innerRadius(radius * 0.5)
                .outerRadius(radius * 0.8);
    let middleArc = d3.arc()
                      .innerRadius(radius * 0.75)
                      .outerRadius(radius * 0.75);

    g.selectAll(".pie-chunk")
            .data(data_ready)
            .enter()
            .append("g")
              .classed("pie-component", true)
              .append("path")
                .attr("d", arc)
                .attr("fill", d => colors(d.data.id))
                .classed("pie-chunk", true);

    g.selectAll(".pie-component")
            .append('polyline')
              .attr('stroke', 'black')
              .style('fill', 'none')
              .attr('stroke-width', 1)
              .attr('points', d => {
                  let scale = d3.scaleSqrt()
                                .domain([d3.min(this._data, d => d.value), d3.max(this._data, d => d.value)])
                                .range([0, 1]);
                  let arc = d3.arc()
                              .innerRadius(radius * (0.95 - (scale(d.value) * 0.15)))
                              .outerRadius(radius * (0.95 - (scale(d.value) * 0.15)));
                  let posA = middleArc.centroid(d);
                  let posB = arc.centroid(d);
                  let posC = arc.centroid(d);
                  let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                  posC[0] = radius * 0.9 * (midAngle < Math.PI ? 1 : -1);
                  return [posA, posB, posC];
              })
              .classed("pie-polyline");

    g.selectAll(".pie-component")
            .append('text')
              .text( d => d.data.name)
              .attr('transform', d => {
                let scale = d3.scaleSqrt()
                              .domain([d3.min(this._data, d => d.value), d3.max(this._data, d => d.value)])
                              .range([0, 1]);
                let arc = d3.arc()
                            .innerRadius(radius * (0.95 - (scale(d.value) * 0.15)))
                            .outerRadius(radius * (0.95 - (scale(d.value)* 0.15)));
                let pos = arc.centroid(d);
                let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.92 * (midAngle < Math.PI ? 1 : -1);
                return 'translate(' + pos + ')';
              })
              .style('text-anchor', d => {
                let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return (midAngle < Math.PI ? 'start' : 'end');
              })
              .style("opacity", "1")
              .style("font-size", "14px")
              .classed("pie-label", true);


    const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .style("fill", "white")
              .style("stroke", "black")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .classed("tooltip-text", true);
    let data_sum = d3.sum(this._data, d => d.value);
    this.svg.selectAll(".pie-chunk")
  			.on("mousemove", (ev, d) => {
  				let tooltipsize = [(d.data.name.length + String(d.value).length)*12, this.height / 8];
          let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-80];

          tooltip
            .attr("x", tooltippos[0])
		        .attr("y", tooltippos[1])
		        .attr("width", tooltipsize[0])
		        .attr("height", tooltipsize[1])
            .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")")
            .style("opacity", "0.7");

  			tooltiptext
  				.attr("x", tooltippos[0] + tooltipsize[0]/2)
  				.attr("y", (tooltippos[1]+5) + tooltipsize[1]/2)
          .attr("transform", "translate(" + this.width/2 + "," + this.svg_height/2 + ")")
  				.attr("display", "inherit")
  				.text(d.data.name + " " + Number.parseFloat(d.value / data_sum * 100).toPrecision(4) + "%");
  			})
  			.on("mouseout", function(ev, d){
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptext
  					.attr("display", "none");
  			});
  }
  #draw_table = () => {
    let stock_string = '<table class="stock-table">';
		for(let i = 0; i < this._data.length; i++){
			stock_string += "<tr><td align='center'>" + this._data[i].name + "</td><td align='right'>" + this._data[i].value + "</td></tr>";
		}
		stock_string += "</table>";
		d3.select(this.container).select(".svg-div").html(stock_string);
  }
  refresh = () => {
    this.#reset();
    this.#draw_inputs();
    if(this.show_table) {
      this.#draw_table();
    } else {
      this.#draw_chart();
    }

  }
}
