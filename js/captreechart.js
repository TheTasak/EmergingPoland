class CapTreeChart{
  _show_chart = true;
  constructor(container, index_name, language, data_file, chart_title){
    this.container = container;
    this.index_name = index_name;
    this.language = language;
    this.data_file = data_file;
    this.chart_title = chart_title;
    this.#load_data();
  }
  #get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  this.suffix = "";
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
  #load_data = () => {
    d3.json("php/" + this.data_file + "?index=" + this.index_name).then((d) => {
      this._data = d;
      this._data.forEach((item, i) => {
        item.value = parseInt(item.value);
      });
      this._data = d3.filter(this._data, d => d.value > 0);
      this._data.sort((a,b) => (a.value < b.value) ? 1 : -1);
      this._data = {"name": "chart", "children": this._data};
      this.#get_suffix();
      this.#init();
    });
  }
  #init = () => {
    // Robi reset div'a wykresu, rysuje go od nowa
    d3.select(this.container)
      .selectAll(".button-div")
      .remove();
    d3.select(this.container)
        .selectAll(".svg-div")
        .remove();
    d3.select(this.container)
      .append("div")
        .classed("button-div", true);
    d3.select(this.container)
      .append("div")
        .classed("svg-div", true);
    if(this._show_chart) {
      this.svg = d3.select(this.container)
                    .select(".svg-div")
                    .append("svg");
    }
    this.#update();
    this.#init_inputs();
    if(this._show_chart) {
      this.#init_chart();
    } else {
      this.#init_table();
    }
  }
  #update = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    this.svg_height = this.height*0.8;
		this.button_height = this.height*0.2;
    d3.select(this.container)
      .select(".svg-div")
      .attr("height", this.svg_height)
      .attr("width", this.width);
    d3.select(this.container)
      .select(".button-div")
      .attr("height", this.button_height)
      .attr("width", this.width);
    if(this._show_chart) {
      this.svg
        .attr("height", this.svg_height)
        .attr("width", this.width);
    }
  }
  #init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text(this.chart_title)
			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
        .append("div")
        .classed("tree-button-div", true);
    d3.select(this.container)
      .select(".tree-button-div")
      .append("button")
				.attr("type", "button")
				.on("click", () => {this._show_chart = !this._show_chart; this.#init();})
				.classed("chart-input", true)
        .append("img")
          .attr("src", "table_icon.png");
  }
  #init_chart = () => {
    this.svg.html("");
    if(this._data.children.length == 0) {
      this.svg.append("text")
              .attr("text-anchor", "middle")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2)
              .text("Brak danych")
              .attr("fill", "black")
              .attr("font-size", "26px");
      return;
    }
    let root = d3.hierarchy(this._data);
    root.sum(d => d.value);

    let treemap_layout = d3.treemap();
    treemap_layout
      .size([this.width, this.svg_height])
      .paddingOuter(5);
    treemap_layout(root);
    let colors = d3.scaleLinear()
            .domain([d3.min(this._data.children, d => d.value),d3.max(this._data.children, d => d.value)])
            .range(["rgb(150,255,150)", "green"]);

    const g = this.svg.append("g");
    g.selectAll("rect")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != "chart" && d.data.value > 0)
          .append("rect")
          .attr('x', d => d.x0)
          .attr('y', d => d.y0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('stroke', "black")
          .attr('stroke-width', "1")
          .attr("fill", d => colors(d.data.value))
          .classed("treechart-chunk", true);

    g.selectAll("text")
          .data(root.descendants())
          .enter()
          .filter(d => d.data.name != "chart"  && d.data.value > 0)
          .append("text")
            .text(d => d.data.name)
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .attr("x", d => d.x0+5)
            .attr("y", (d) => {
              let cut_text = parseInt((d.x1 - d.x0) / d.data.name.length);
              if(cut_text*1.4 > 26)
                cut_text = 24;
              return d.y0+(cut_text*1.3);
            })
            .attr("font-family", "monospace")
            .attr("font-size", (d) => {
                let cut_text = parseInt((d.x1 - d.x0) / d.data.name.length);
                if(cut_text*1.4 > 26)
                  cut_text = 24;
                return String(cut_text*1.3) + "px";
            })

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
          let sum = d3.sum(this._data.children, d => d.value);
  				let tooltipsize = [String(d.data.name + (d.data.value / sum * 100) + "%" + this.suffix).length*10+10, 40];
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
  				.text(d.data.name + " " + (d.data.value / sum * 100).toFixed(2) + "%");

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
  #init_table = () => {
    d3.select(this.container).select(".svg-div")
      .append("div")
        .classed("earnings-table", true);
    let earnings_string = '<table>';
		for(let i = 0; i < this._data.children.length; i++){
			earnings_string += "<tr><td align='center'>" + this._data.children[i].name + "</td><td align='right'>" + this.#split_value(String(this._data.children[i].value)) + this.suffix + " " + "PLN" + "</td></tr>";
		}
    earnings_string += "<tr><td align='center'>" + "Suma:" + "</td><td align='right'>" + this.#split_value(String(d3.sum(this._data.children, d => d.value))) + this.suffix + " " + "PLN" + "</td></tr>";
		earnings_string += "</table>";
		d3.select(this.container).select(".earnings-table").html(earnings_string);
  }
  refresh = () => {
    this.#update();
    this.#init_chart();
  }
}
