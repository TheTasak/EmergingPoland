class AkcjeChart{
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
  #split_value = (value) => {
    let new_value = [];
    let rev_value = value.length % 3;
    let string = "";
    if(rev_value != 0) {
      new_value.push(value.substr(0, rev_value));
    }
    for(let i = 0 + rev_value; i < value.length; i += 3) {
      new_value.push(value.substr(i, 3));
    }
    for(let i = 0; i < new_value.length; i++) {
      string += new_value[i] + " ";
    }
    return string;
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
      this._data = d;
      if(this._data.length <= 0){
				this.year--;
				this.#load_data();
				return;
			}
      this._data.forEach((item, i) => {
        item.value = parseInt(item.value);
      });
      this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
      this._data = {"name": "chart", "translate": "", "children": this._data};
      this.refresh();
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
    let root = d3.hierarchy(this._data);
    root.sum(d => d.value);

    let treemap_layout = d3.treemap();
    treemap_layout
      .size([this.width, this.svg_height])
      .paddingOuter(5);
    treemap_layout(root);
    let colors = d3.scaleLinear()
            .domain([d3.min(this._data.children, d => d.value), d3.max(this._data.children, d => d.value)])
            .range(["rgb(150,255,150)", "green"]);
    const g = this.svg.append("g");
    g.selectAll("rect")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != "chart")
          .append("rect")
          .attr('x', d => d.x0)
          .attr('y', d => d.y0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('stroke', "black")
          .attr('stroke-width', "1")
          .attr("fill",d => colors(d.value))
          .classed("treechart-chunk", true);

    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != "chart")
          .append("text")
            .text(d => d.data.name)
            .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
            .attr("y", d =>  {
              let cut_text = parseInt((d.x1 - d.x0) / d.data.name.length);
              cut_text = (cut_text > 26 ? 26 : cut_text);
              cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
              return d.y0 + (d.y1 - d.y0) / 2 + (cut_text / 2);
            })
            .attr("font-family", "monospace")
            .attr("font-size", (d) => {
                let cut_text = parseInt((d.x1 - d.x0) / d.data.name.length);
                cut_text = (cut_text > 26 ? 26 : cut_text);
                cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
                return String(cut_text*1.4) + "px";
            })
            .style("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .attr("fill", "white");

    const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .style("fill", "white")
              .attr("rx", "20px")
              .attr("ry", "20px")
              .style("stroke", "black")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .classed("tooltip-text", true);
    this.svg.selectAll('.treechart-chunk')
        .on("mouseover", (ev, d) => {
          this.svg.selectAll(".treechart-chunk")
                  .style("opacity", "0.4");
          ev.target.style.opacity = "1";
        })
  			.on("mousemove", (ev, d) => {
          let value = this.#split_value(String(d.value));
  				let tooltipsize = [String(d.data.name + value).length*10, 40];
          let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-tooltipsize[1]-10];

          if(tooltippos[0]+tooltipsize[0] > this.width)
            tooltippos[0] = this.width - tooltipsize[0];
          if(tooltippos[0] < 0)
            tooltippos[0] = 0;

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
  				.text(d.data.name + " " + value);

  			})
  			.on("mouseout", (ev, d) => {
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptext
  					.attr("display", "none");

          this.svg.selectAll(".treechart-chunk")
                  .style("opacity", "1");
  			});
  }
  #draw_table = () => {
    let stock_string = '<table class="stock-table">';
		for(let i = 0; i < this._data.children.length; i++){
      let value = String(this._data.children[i].value);
			stock_string += "<tr><td align='center'>" + this._data.children[i].name + "</td><td align='right'>" + this.#split_value(value) + "</td></tr>";
		}
    stock_string += "<tr><td align='center'>" + "Suma akcji:" + "</td><td align='right'>" + this.#split_value(String(parseInt(d3.sum(this._data.children, d => d.value)))) + "</td></tr>";
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
