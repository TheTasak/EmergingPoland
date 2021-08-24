class WorldMap{
	country_arr = [];
	map_data = [];
	show_map = true;
	current_chart_interval = -1;
	constructor(container, stock_name, start_year, end_year, currency, language, map){
		this.container = container;
		this.stock_name = stock_name;
		this.start_year = start_year;
		this.end_year = end_year.split("_")[0];
    this.year = this.end_year;
		this.currency = currency;
		this.language = language;
		this.map = map;
	}
	set_year = (year) => {
    this.year = year;
    this.load_data();
  }
	get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let val = d3.max(this.country_arr, d => d[this.current_chart_interval]);
	  if(val >= 1000){
		  this.country_arr.forEach((item) => item[this.current_chart_interval] /= 1000.0);
		  this.suffix = "mln";
		} else {
		  this.suffix = "tys";
	  }
  }
	load_data = () => {
		d3.json("php/"+ this.map +".php?" + "stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then( d => {
			// Wczytanie danych przychodów w krajach w danym roku
			this.country_arr = d;
			// Jeżeli brak danych, to spróbuj w poprzednim roku rekurencyjnie
			if(this.country_arr.length <= 0 && this.year > this.start_year){
				this.year--;
				this.load_data();
				return;
			}
			this.change_chart();
			d3.json("js/world.geojson").then( (d) => {
				// Wczytanie danych geometrii mapy
				this.map_data = d;
				this.init();
			});
		});
	}
	change_chart = () => {
		let temp_array = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
		this.array_interval = [];
		temp_array.forEach((item, i) => {
			let new_arr = d3.map(this.country_arr, d => d[item]).filter(value => value != undefined && !isNaN(value));
			if(new_arr.length != 0)
				this.array_interval.push(item);
		});
		const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
		if(select_list_interval != undefined) {
			let index = this.array_interval.indexOf(select_list_interval.value);
			if(index == -1)
				this.current_chart_interval = this.array_interval[this.array_interval.length-1];
			else
				this.current_chart_interval = select_list_interval.value;
		}
		else
			this.current_chart_interval = this.array_interval[this.array_interval.length-1];
		this.country_arr.forEach((item) => item[this.current_chart_interval] = parseFloat(item[this.current_chart_interval]));
		this.country_arr.sort((a,b) => (a[this.current_chart_interval] < b[this.current_chart_interval]) ? 1 : -1);
		this.get_suffix();
	}

	init = () => {
		d3.select(this.container)
			.html("");
		d3.select(this.container)
			.append("div")
			.style("text-align", "center")
			.classed("button-div", true);
		d3.select(this.container)
			.append("div")
			.classed("svg-div", true);
		if(this.show_map) {
			this.svg = d3.select(this.container)
							.select(".svg-div")
						  .append("svg");
		}
		this.update();
		this.init_inputs();
		if(this.show_map){
			this.draw_map();
		} else {
			this.init_table();
		}
	}
	update = () => {
		this.width = parseInt(this.container.clientWidth) * 0.9;
		this.height = parseInt(this.container.clientHeight);

		this.svg_height = this.height*0.8;
		this.button_height = this.width*0.2;
		d3.select(this.container)
			.select(".button-div")
			.attr("width", this.width)
			.attr("height", this.button_height);
		d3.select(this.container)
			.select(".svg-div")
			.attr("width", this.width)
			.attr("height", this.svg_height);
		this.svg.attr("width", this.width)
						.attr("height", this.svg_height);
		d3.select(this.container)
			.select(".border-rect")
			.attr("width", this.width)
			.attr("height", this.svg_height);
	}
	init_inputs = () => {
		// Tytuł wykresu
		let text = this.map == "getcountries" ? "Podział przychodów ze względu na kraje" : "Podział przychodów ze względu na regiony";
		d3.select(this.container)
			.select(".button-div")
			.append("span")
				.text(text)
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
	draw_map = () => {
		this.svg.html("");
		// Typ projekcji mapy
		this.mapProjection = d3.geoNaturalEarth()
							.scale(this.svg_height / Math.PI)
							.translate([this.width / 2, this.svg_height / 2]);
		let geoPath = d3.geoPath(this.mapProjection);
		// Skala kolorów na podstawie ilości przychodów
		let colors = d3.scaleLinear()
						.domain([d3.min(this.country_arr, d => d[this.current_chart_interval]), d3.max(this.country_arr, d => d[this.current_chart_interval])])
						.range(["rgb(150,255,150)", "green"]);
		this.svg
				.append("rect")
				.style("fill", "#f5f5f5")
				.style("rx", "20px")
				.attr("width", this.width)
				.attr("height", this.svg_height)
				.classed("border-rect", true);
		// Rysowanie geometrii mapy
		this.svg.append("g")
				.selectAll("path")
				.data(this.map_data.features)
				.enter()
				.append("path")
				.attr("d", geoPath);
		// Kolorowanie krajów które znajdują się w tablicy przychodów
		this.svg.selectAll("path")
			.filter( (d) => {
					let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);
					return arr_index != -1 && !isNaN(this.country_arr[arr_index][this.current_chart_interval]);
				})
				.attr("fill",	(d) => {
					let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);
					return colors(parseFloat(this.country_arr[arr_index][this.current_chart_interval]));
				})
				.attr("class", (d) => {
					let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);
					return this.country_arr[arr_index].name;
				})
				.classed("country", true);
		// Kolorowanie reszty krajów
		this.svg.selectAll("path")
			.filter( (d) => {
					let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);
					return arr_index == -1 || isNaN(this.country_arr[arr_index][this.current_chart_interval]);
				})
				.attr("fill", "#e0e0e0")
				.classed("country", true);
		// Dodanie tooltipa
		const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
							.attr("rx", "20px")
              .attr("ry", "20px")
              .style("fill", "white")
              .style("stroke", "black")
							.attr("pointer-events", "none")
              .style("user-select", "none")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
							.attr("pointer-events", "none")
							.style("user-select", "none")
              .classed("tooltip-text", true);
		// Eventy tooltipa - Wyświetlanie tooltipa tylko jeśli kraj znajduje się w tablicy przychodów
    this.svg.selectAll("path")
			.filter(d => {
				let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);
				return arr_index != -1 && this.country_arr[arr_index][this.current_chart_interval] > 0;
			})
			.on("mouseenter", (ev, d) => {
				let region_countries = ev.target.className.baseVal.split(" ")[0];
				d3.select(this.container)
					.selectAll("." + region_countries)
					.attr("fill", "#aa5555");
			})
			.on("mousemove", (ev, d) => {
				let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);

				let name = this.country_arr[arr_index].translate;
				let value = splitValue(this.country_arr[arr_index][this.current_chart_interval]) + this.suffix + " " + this.currency;

				let tooltipsize = [String(name + " " + value).length*10+10, 40];
        let tooltippos = [ev.offsetX, ev.offsetY];
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
					.text(name + " " + value);
			})
			.on("mouseout", (ev, d) => {
				let arr_index = this.country_arr.findIndex(searchIndex, d.properties["name"]);

				let region_countries = ev.target.className.baseVal.split(" ")[0];
				d3.select(this.container)
					.selectAll("." + region_countries)
					.attr("fill", colors(this.country_arr[arr_index][this.current_chart_interval]));

				tooltip
					.style("opacity", "0")
          .attr("width", "0px");
				tooltiptext
					.attr("display", "none");
  	});
		// Dodanie możliwości przybliżenia i przesuwania mapy
		this.svg.call(d3.zoom().scaleExtent([1, 6]).translateExtent([[0, 0], [this.width, this.svg_height]])
		.on("zoom", (ev) => {
			this.svg.select("g").transition().ease(d3.easeCubicOut).duration(150).attr("transform", ev.transform);
		}));
	}
	init_table = () => {
		let rows = d3.select(this.container)
								.select(".svg-div")
								.append("div")
								.classed("map-country-table", true)
								.append("table")
								.selectAll(".table-row")
								.data(this.country_arr)
								.enter()
								.filter(d => !isNaN(d[this.current_chart_interval]))
								.append("tr");
		rows.append("td")
				.style("text-align", "center")
				.html(d => d.translate);
		rows.append("td")
				.style("text-align", "right")
				.html(d => splitValue(parseFloat(d[this.current_chart_interval]).toFixed(3)) + this.suffix + " " + this.currency);
	}

	refresh = () => {
		this.update();
		clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(this.draw_map, 50);
	}
}
function searchIndex(element) {
	let arr = element.country;
	if(arr != undefined) {
		for(let i = 0; i < arr.length; i++) {
			if(arr[i] == this)
				return true;
		}
	}
	return false;
}
