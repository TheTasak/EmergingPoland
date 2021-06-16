class WorldMap{
	_country_arr = [];
	_map_data = [];
	_show_map = true;
	current_map = 0;
	maps = ["getcountries", "getregions"];
	stock_name = "";
	year = 2020;
	current_chart_interval = -1;
	constructor(container, stock_name, start_year, currency, language, map_types){
		this.container = container;
		this.stock_name = stock_name;
		this.start_year = start_year;
		this.currency = currency;
		this.language = language;
		this.maps = map_types;
		this.#load_data();
	}
	#get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let val = d3.max(this._country_arr, d => d[this.current_chart_interval]);
	  if(val >= 1000000){
		  this._country_arr.forEach((item) => item[this.current_chart_interval] /= 1000000.0);
		  this.suffix = "mld";
	  } else if(val >= 1000){
		  this._country_arr.forEach((item) => item[this.current_chart_interval] /= 1000.0);
		  this.suffix = "mln";
		} else {
		  this.suffix = "tys";
	  }
  }
	#change_chart = () => {
		const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
		if(select_list_interval != undefined)
			this.current_chart_interval = select_list_interval.value;
		else
			this.current_chart_interval = "year";
		this._country_arr.sort((a,b) => (a[this.current_chart_interval] < b[this.current_chart_interval]) ? 1 : -1);
		this.#get_suffix();
	}
	#load_data = () => {
		d3.json("php/"+ this.maps[this.current_map] +".php?" + "stock_name=" + this.stock_name + "&date=" + this.year + "&lang=" + this.language).then( d => {
			// Wczytanie danych przychodów w krajach w danym roku
			this._country_arr = d;
			// Jeżeli brak danych, to spróbuj w poprzednim roku rekurencyjnie
			if(this._country_arr.length <= 0){
				this.year--;
				this.#load_data();
				return;
			}
			this.#change_chart();
			d3.json("js/world.geojson").then( (d) => {
				// Wczytanie danych geometrii mapy
				this._map_data = d;
				this.init();
			});
		});
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
	init = () => {
		d3.select(this.container)
			.selectAll(".svg-div")
			.remove();
		d3.select(this.container)
			.selectAll(".button-div")
			.remove();
		d3.select(this.container)
			.append("div")
			.style("text-align", "center")
			.classed("button-div", true);
		d3.select(this.container)
			.append("div")
			.classed("svg-div", true);
		if(this._show_map) {
			this.svg = d3.select(this.container)
							.select(".svg-div")
						  .append("svg");
		}
		this.#update();
		this.#init_inputs();
		if(this._show_map){
			this.#draw_map();
		} else {
			this.#init_table();
		}
		this.refresh();
	}
	#update = () => {
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
		if(this._show_map) {
			this.svg.attr("width", this.width)
							.attr("height", this.svg_height);
		}
	}
	#init_inputs = () => {
		// Tytuł wykresu
		let text = this.maps[this.current_map] == "getcountries" ? "Podział przychodów ze względu na kraje" : "Podział przychodów ze względu na regiony";
		d3.select(this.container)
			.select(".button-div")
			.append("span")
				.text(text)
				.classed("chart-title", true);
		d3.select(this.container)
			.select(".button-div")
			.append("div")
				.classed("map-button-div", true);
		// Przycisk poprzedniego roku
		d3.select(this.container)
			.select(".map-button-div")
				.append("button")
				.attr("type", "button")
				.text("🠔")
				.on("click", this.#earlier_year)
				.classed("map-button", true);
		// Przycisk zamiany na tabelę
		d3.select(this.container)
			.select(".map-button-div")
			.append("span")
				.style("padding", "0 10px")
				.on("click", () => { this._show_map = !this._show_map; this.init();})
				.text(this.year)
				.classed("map-button", true);
		// Przycisk następnego roku
		d3.select(this.container)
			.select(".map-button-div")
			.append("button")
				.attr("type", "button")
				.text("🠖")
				.on("click", this.#later_year)
				.classed("map-button", true);
		if(this.maps.length > 1) {
			d3.select(this.container)
				.select(".map-button-div")
				.append("button")
					.attr("type", "button")
					.on("click", () => {
						console.log(this.maps);
						 if(this.current_map < this.maps.length-1)
								this.current_map++;
						 else if(this.current_map > 0)
								this.current_map--;
						 this.#load_data();
					 })
					.classed("map-button", true)
					.append("img")
						.attr("src", "map.png");
		}
		const field_interval = d3.select(this.container)
                             .select(".map-button-div")
				                        .append("select")
          				                .on("change", this.#load_data)
          				                .classed("chart-input", true);
    let array_interval = ["quarter1", "quarter2", "quarter3", "quarter4", "year"];
    for(let i = 0; i < array_interval.length; i++){
  		field_interval.append("option")
  			         .attr("value", array_interval[i])
  			         .text(array_interval[i]);
  	}
    const select_list_interval = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_interval != undefined){
  		select_list_interval.value = this.current_chart_interval;
  	}
	}
	#draw_map = () => {
		this.svg.html("");
		// Typ projekcji mapy
		this.mapProjection = d3.geoNaturalEarth()
							.scale(this.svg_height / Math.PI)
							.translate([this.width / 2, this.svg_height / 2]);
		let geoPath = d3.geoPath(this.mapProjection);
		// Skala kolorów na podstawie ilości przychodów
		let colors = d3.scaleLinear()
						.domain([d3.min(this._country_arr, d => d[this.current_chart_interval]), d3.max(this._country_arr, d => d[this.current_chart_interval])])
						.range(["rgb(150,255,150)", "green"]);
		// Rysowanie geometrii mapy
		this.svg.append("g")
				.selectAll("path")
				.data(this._map_data.features)
				.enter()
				.append("path")
				.attr("d", geoPath);
		// Kolorowanie krajów które znajdują się w tablicy przychodów
		this.svg.selectAll("path")
			.filter( (d) => {
					let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);
					return arr_index != -1 && this._country_arr[arr_index][this.current_chart_interval] > 0;
				})
				.attr("fill",	(d) => {
					let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);
					return colors(parseFloat(this._country_arr[arr_index][this.current_chart_interval]));
				})
				.attr("class", (d) => {
					let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);
					return this._country_arr[arr_index].name;
				})
				.classed("country", true);
		// Kolorowanie reszty krajów
		this.svg.selectAll("path")
			.filter( (d) => {
					let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);
					return arr_index == -1 || this._country_arr[arr_index][this.current_chart_interval] <= 0;
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
				let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);
				return arr_index != -1 && this._country_arr[arr_index][this.current_chart_interval] > 0;
			})
			.on("mouseenter", (ev, d) => {
				let region_countries = ev.target.className.baseVal.split(" ")[0];
				d3.select(this.container)
					.selectAll("." + region_countries)
					.attr("fill", "#aa5555");
			})
			.on("mousemove", (ev, d) => {
				let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);

				let name = this._country_arr[arr_index].translate;
				let value = this._country_arr[arr_index][this.current_chart_interval] + this.suffix + " " + this.currency;

				let tooltipsize = [String(name + " " + value).length*10+10, 40];
        let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-tooltipsize[1]-10];
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
				let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);

				let region_countries = ev.target.className.baseVal.split(" ")[0];
				d3.select(this.container)
					.selectAll("." + region_countries)
					.attr("fill", colors(this._country_arr[arr_index][this.current_chart_interval]));

				tooltip
					.style("opacity", "0")
          .attr("width", "0px");
				tooltiptext
					.attr("display", "none");
  	});
		// Dodanie możliwości przybliżenia i przesuwania mapy
		this.svg.call(d3.zoom().scaleExtent([1, 6]).translateExtent([[0, 0], [this.width, this.svg_height]]).on("zoom", (ev) => {
			this.svg.select("g").transition().ease(d3.easeCubicOut).duration(150).attr("transform", ev.transform)
		}));
	}
	#init_table = () => {
		let country_string = '<table class="map-country-table">';
		console.log(this._country_arr);
		for(let i = 0; i < this._country_arr.length; i++){
			country_string += "<tr><td align='center'>" + this._country_arr[i].translate + "</td><td align='right'>" + parseFloat(this._country_arr[i][this.current_chart_interval]).toFixed(4) + this.suffix + " " + this.currency + "</td></tr>";
		}
		country_string += "<tr><td align='center'>" + "Suma przychodów:" + "</td><td align='right'>" + parseFloat(d3.sum(this._country_arr, d => d[this.current_chart_interval])).toFixed(4) + this.suffix + " " + this.currency + "</td></tr>";
		country_string += "</table>";
		d3.select(this.container).select(".svg-div").html(country_string);
	}

	refresh = () => {
		this.#update();
		clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(this.#draw_map, 10);
	}
}
function search_index(element) {
	let arr = element.country;
	for(let i = 0; i < arr.length; i++) {
		if(arr[i] == this)
			return true;
	}
	return false;
}
