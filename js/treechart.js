class TreeChart{
  _show_chart = true;
  current_chart_interval = -1;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.year = this.end_year;
    this.currency = currency;
    this.language = language;
  }
  set_year = (year) => {
    this.year = year;
    this.load_data();
  }
  load_data = () => {
    d3.json("php/getearnings.php?stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then((d) => {
      this.data = d;
      this.change_chart();
      this.init();
    });
  }
  change_chart = () => {
    let temp_array = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
		this.array_interval = [];
		temp_array.forEach((item, i) => {
      let is_interval_present = false;
			this.data.children.forEach((child, num) => {
        if(!is_interval_present) {
          for(let i = 0; i < child.children.length; i++) {
            if(child.children[i][item] != undefined && child.children[i][item] > 0 ) {
              this.array_interval.push(item);
              is_interval_present = true;
              break;
            }
          }
        }
      });
		});
    const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_interval != undefined && this.array_interval.includes(select_list_interval.value))
      this.current_chart_interval = select_list_interval.value;
    else
      this.current_chart_interval = this.array_interval[this.array_interval.length-1];
    this.data.children.forEach((item, i) => {
      item.children = d3.filter(item.children, d => parseFloat(d[this.current_chart_interval]) > 0);
    });
    this.data.children.sort((a,b) => {
      let a_sum = d3.sum(a.children, d => d[this.current_chart_interval]);
      let b_sum = d3.sum(b.children, d => d[this.current_chart_interval]);
      return b_sum - a_sum;
    });
    this.data.children.forEach((item, i) => {
      item.children.sort((a, b) => {
        return b[this.current_chart_interval] - a[this.current_chart_interval];
      });
    });
  }
  get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let max = d3.max(this.current_data.children, d => d[this.current_chart_interval]);
	  if(max >= 1000){
		  this.current_data.children.forEach((item) => item[this.current_chart_interval] /= 1000.0);
		  this.suffix = "mln";
    } else {
		  this.suffix = "tys";
	  }
  }
  init = () => {
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
    this.update();
    this.init_inputs();
    if(this._show_chart) {
      this.init_chart();
    } else {
      this.init_table();
    }
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
    this.svg_height = this.height*0.75;
		this.button_height = this.width*0.25;
    d3.select(this.container)
      .select(".button-div")
      .attr("height", this.button_height)
      .attr("width", this.width);
    d3.select(this.container)
      .select(".svg-div")
      .attr("height", this.svg_height)
      .attr("width", this.width);
    if(this._show_chart) {
      this.svg
        .attr("height", this.svg_height)
        .attr("width", this.width);
    }
  }
  init_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("span")
			.text("Podział przychodów")
			.classed("chart-title", true);
    d3.select(this.container)
      .select(".button-div")
      .append("div");
    d3.select(this.container)
      .select(".button-div")
      .append("span")
        .classed("year-small", true)
        .html(this.start_year);
    for(let i = this.start_year; i <= this.end_year; i++) {
      let dot = d3.select(this.container)
                  .select(".button-div")
                  .append("span")
                    .classed("dot", true)
                    .on("click", (ev) => this.set_year(i));
      if(this.year == i) {
        dot.classed("clicked-dot", true);
      }
    }
    d3.select(this.container)
      .select(".button-div")
      .append("span")
        .classed("year-small", true)
        .html(this.end_year);
    d3.select(this.container)
      .select(".button-div")
      .append("div");
    const field_interval = d3.select(this.container)
                             .select(".button-div")
				                        .append("select")
          				                .on("change", this.load_data)
          				                .classed("chart-input", true);
    for(let i = 0; i < this.array_interval.length; i++){
  		field_interval.append("option")
  			         .attr("value", this.array_interval[i])
  			         .text(this.array_interval[i]);
  	}
    const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
  }
  init_chart = () => {
    this.svg.html("");
    if(this.data.children.length == 0) {
      this.svg.append("text")
              .attr("text-anchor", "middle")
              .attr("x", this.width/2)
              .attr("y", this.svg_height/2)
              .text("Brak danych")
              .attr("fill", "black")
              .attr("font-size", "26px");
      return;
    }
    let root = d3.hierarchy(this.data);
    root.sum(d => d[this.current_chart_interval]);

    let treemap_layout = d3.treemap()
                           .size([this.width, this.svg_height])
                           .paddingOuter(5);
    treemap_layout(root);


    const g = this.svg.append("g");
    g.selectAll("rect")
          .data(root.leaves())
          .enter()
          .append("rect")
          .attr('x', d => d.x0)
          .attr('y', d => d.y0)
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('stroke', "black")
          .attr('stroke-width', "1")
          .attr("fill", d => {
            let colors = d3.scaleLinear()
                          .domain([d3.min(d.parent.children, data => data.value),d3.max(d.parent.children, data => data.value)])
                          .range(["rgb(150,255,150)", "green"]);
            return colors(d.data[this.current_chart_interval]);
          })
          .classed("treechart-chunk", true);

    g.selectAll("text")
          .data(root.leaves())
          .enter()
          .filter(d => d.data.name != "chart")
          .append("text")
            .text(d => d.data.translate)
            .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
            .attr("y", d => {
              let cut_text = parseInt((d.x1 - d.x0)*1.5 / d.data.translate.length);
              cut_text = cut_text > 36 ? 36 : cut_text;
              cut_text = cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text;
              return d.y0 + (d.y1 - d.y0) / 2 + (cut_text / 3);
            })
            .attr("font-family", "monospace")
            .attr("font-size", (d) => {
                let cut_text = parseInt((d.x1 - d.x0)*1.5 / d.data.translate.length);
                cut_text = (cut_text > 36 ? 36 : cut_text);
                cut_text = (cut_text > (d.y1 - d.y0) / 2 ? (d.y1 - d.y0) / 2 : cut_text);
                return String(cut_text) + "px";
            })
            .attr("pointer-events", "none")
            .style("user-select", "none")
            .style("text-anchor", "middle")
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
    const tooltiptextgroup = this.svg.append("text")
              .attr("pointer-events", "none")
              .style("user-select", "none")
              .style("font-weight", "bold")
              .classed("tooltip-text", true);
    const tooltiptextvalue = this.svg.append("text")
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
          let children_value = d.data.translate + " " + splitValue(d.data[this.current_chart_interval]) + "tys " + this.currency;
          let parent_value = d.parent.data.translate;
          let value = parent_value.length > children_value.length ? parent_value : children_value;

          let font = parseInt(this.width*1.5 / value.length);
          font = font > 16 ? 16 : font;
  				let tooltipsize = [font*value.length*0.6+10, 80];
          let tooltippos = [ev.offsetX, ev.offsetY];

          if(tooltippos[0]+tooltipsize[0] > this.width)
            tooltippos[0] = this.width - tooltipsize[0];

          tooltip
            .attr("x", tooltippos[0])
		        .attr("y", tooltippos[1])
		        .attr("width", tooltipsize[0])
		        .attr("height", tooltipsize[1])
            .style("opacity", "0.7");
          tooltiptextgroup
    				.attr("x", tooltippos[0] + tooltipsize[0]/2)
    				.attr("y", (tooltippos[1]+5) + tooltipsize[1]/3)
            .attr("font-size", font + "px")
    				.attr("display", "inherit")
    				.text(parent_value);
    			tooltiptextvalue
    				.attr("x", tooltippos[0] + tooltipsize[0]/2)
    				.attr("y", (tooltippos[1]+10) + tooltipsize[1]/3 * 2)
            .attr("font-size", font + "px")
    				.attr("display", "inherit")
    				.text(children_value);
  			})
  			.on("mouseout", (ev, d) => {
  				tooltip
  					.style("opacity", "0")
            .attr("width", "0px");
  				tooltiptextgroup
  					.attr("display", "none");
          tooltiptextvalue
  					.attr("display", "none");
          this.svg.selectAll(".treechart-chunk")
                  .style("opacity", "1");
  			});
  }
  init_table = () => {
    d3.select(this.container).select(".svg-div")
      .append("div")
        .classed("earnings-table", true);
    let earnings_string = '<table>';
		for(let i = 0; i < this.current_data.children.length; i++){
			earnings_string += "<tr><td align='center'>" + this.current_data.children[i].translate + "</td><td align='right'>" + this.current_data.children[i][this.current_chart_interval] + this.suffix + " " + this.currency + "</td></tr>";
		}
    earnings_string += "<tr><td align='center'>" + "Suma przychodów:" + "</td><td align='right'>" + parseFloat(d3.sum(this.current_data.children, d => d[this.current_chart_interval])).toFixed(4) + this.suffix + " " + this.currency + "</td></tr>";
		earnings_string += "</table>";
		d3.select(this.container).select(".earnings-table").html(earnings_string);
  }
  refresh = () => {
    this.update();
    if(this._show_chart) {
        this.init_chart();
    }
  }
}
