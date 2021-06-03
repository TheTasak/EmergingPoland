class WorldMap{
	_country_arr = [];
	_map_data = [];
	_show_map = true;
	current_map = 0;
	maps = ["getcountries", "getregions"];
	stock_name = "";
	year = 2020;
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
	  let val = d3.max(this._country_arr, d => d.value);
	  if(val >= 1000000){
		  this._country_arr.forEach((item) => item.value /= 1000000.0);
		  this.suffix = "mld";
	  } else if(val >= 1000){
		  this._country_arr.forEach((item) => item.value /= 1000.0);
		  this.suffix = "mln";
		} else {
		  this.suffix = "tys";
	  }
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
			this._country_arr.sort((a,b) => (a.value < b.value) ? 1 : -1);
			this.#get_suffix();
			d3.json("js/world.geojson").then( (d) => {
				// Wczytanie danych geometrii mapy
				this._map_data = d;
				this.refresh();
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
	reset = () => {
		d3.select(this.container)
			.selectAll(".svg-div")
			.remove();
		d3.select(this.container)
			.selectAll(".button-div")
			.remove();
		this.width = parseInt(this.container.clientWidth) * 0.9;
		this.height = parseInt(this.container.clientHeight);

		this.svg_height = this.height*0.8;
		this.button_height = this.width*0.2;
		d3.select(this.container)
			.append("div")
			.attr("width", this.width)
			.attr("height", this.button_height)
			.style("text-align", "center")
			.style("line-height", "1")
			.classed("button-div", true);

		d3.select(this.container)
			.append("div")
			.attr("width", this.width)
			.attr("height", this.svg_height)
			.classed("svg-div", true);
		if(this._show_map){
			this.svg = d3.select(this.container)
							.select(".svg-div")
						  .append("svg")
							  .attr("width", this.width)
							  .attr("height", this.svg_height);
		}
		this.#draw_inputs();
	}

	#draw_map = () => {
		// Typ projekcji mapy
		let mapProjection = d3.geoNaturalEarth()
							.scale(this.svg_height / Math.PI)
							.translate([this.width / 2, this.svg_height / 2]);
		let geoPath = d3.geoPath(mapProjection);
		// Skala kolorów na podstawie ilości przychodów
		let colors = d3.scaleLinear()
						.domain([d3.min(this._country_arr, d => d.value), d3.max(this._country_arr, d => d.value)])
						.range(["rgb(150,255,150)", "green"]);
		// Rysowanie geometrii mapy
		this.svg.append("g")
				.selectAll("path")
				.data(this._map_data.features)
				.enter()
				.append("path")
				.attr("d", geoPath)
				.classed("country", true);
		// Kolorowanie krajów które znajdują się w tablicy przychodów
		this.svg.selectAll("path")
			.filter( (d) => {
					let country_array = this._country_arr.map(obj => obj.country);
					for(let i = 0; i < country_array.length; i++) {
						let country = country_array[i].find(element => element == d.properties["name"]);
						if(country != undefined)
							return true;
					}
					return false;
				})
				.attr("fill",	(d) => {
					let country_array = this._country_arr.map(obj => obj.country);
					for(let i = 0; i < country_array.length; i++) {
						let country = country_array[i].find(element => element == d.properties["name"]);
						if(country != undefined)
							return colors(this._country_arr[i].value);
					}
				})
				.attr("class", (d) => {
					let country_array = this._country_arr.map(obj => obj.country);
					for(let i = 0; i < country_array.length; i++) {
						let country = country_array[i].find(element => element == d.properties["name"]);
						if(country != undefined)
							return this._country_arr[i].name;
					}
				});
		// Kolorowanie reszty krajów
		this.svg.selectAll("path")
			.filter( (d) => {
					let country_array = this._country_arr.map(obj => obj.country);
					for(let i = 0; i < country_array.length; i++) {
						let country = country_array[i].find(element => element == d.properties["name"]);
						if(country != undefined)
							return false;
					}
					return true;
				})
				.attr("fill", "#e0e0e0");
		// Dodanie możliwości przybliżenia i przesuwania mapy
		this.svg.call(d3.zoom().scaleExtent([1, 6]).translateExtent([[0, 0], [this.width, this.svg_height]]).on("zoom", (ev) => {
			this.svg.select("g").transition().ease(d3.easeCubicOut).duration(150).attr("transform", ev.transform)
		}));
		// Dodanie tooltipa
		const tooltip = this.svg.append("rect")
              .attr("width", "0px")
              .attr("height", "0px")
              .style("fill", "white")
              .style("stroke", "black")
              .classed("tooltip", true);
    const tooltiptext = this.svg.append("text")
              .classed("tooltip-text", true);
		// Eventy tooltipa - Wyświetlanie tooltipa tylko jeśli kraj znajduje się w tablicy przychodów
    this.svg.selectAll("path")
			.filter(data => {
				let country_array = this._country_arr.map(obj => obj.country);
				for(let i = 0; i < country_array.length; i++) {
					let country = country_array[i].find(element => element == data.properties["name"]);
					if(country != undefined)
						return true;
				}
				return false;
			})
			.on("mouseenter", (ev, d) => {
				let region_countries = ev.target.className.baseVal;
				d3.select(this.container)
					.selectAll("." + region_countries)
					.transition()
					.attr("fill", "#aa5555")
					.duration(500);
			})
			.on("mousemove", (ev, d) => {
				let country_array = this._country_arr.map(obj => obj.country);
				let index_main;
				for(let i = 0; i < country_array.length; i++) {
					let index = country_array[i].findIndex(element => element == d.properties["name"]);
					if(index != -1) {
						index_main = i;
						break;
					}
				}
				let name = this._country_arr[index_main].translate;
				let value = this._country_arr[index_main].value + this.suffix + " " + this.currency;

				let tooltipsize = [String(name + " " + value).length*10, this.height / 16];
        let tooltippos = [d3.pointer(ev)[0] - tooltipsize[0]/2, d3.pointer(ev)[1]-80];
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
				let country_array = this._country_arr.map(obj => obj.country);
				for(let i = 0; i < country_array.length; i++) {
					let index = country_array[i].findIndex(element => element == d.properties["name"]);
					if(index != -1) {
						let region_countries = ev.target.className.baseVal;
						d3.select(this.container)
							.selectAll("." + region_countries)
							.transition()
							.attr("fill", colors(this._country_arr[i].value))
							.duration(200);
							break;
					}
				}
				tooltip
					.style("opacity", "0")
          .attr("width", "0px");
				tooltiptext
					.attr("display", "none");
  	});
	}
	#draw_table = () => {
		let country_string = '<table class="map-country-table">';
		for(let i = 0; i < this._country_arr.length; i++){
			country_string += "<tr><td align='center'>" + this._country_arr[i].translate + "</td><td align='right'>" + parseFloat(this._country_arr[i].value).toFixed(4) + this.suffix + " " + this.currency + "</td></tr>";
		}
		country_string += "</table>";
		d3.select(this.container).select(".svg-div").html(country_string);
	}
	#draw_inputs = () => {
		// Tytuł wykresu
		d3.select(this.container)
			.select(".button-div")
			.append("span")
				.text("Podział przychodów ze względu na kraje")
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
				.on("click", () => { this._show_map = !this._show_map; this.refresh();})
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
		d3.select(this.container)
			.select(".map-button-div")
			.append("button")
				.attr("type", "button")
				.on("click", () => {
					 if(this.current_map < this.maps.length-1)
					 		this.current_map++;
					 else
					 		this.current_map--;
					 this.#load_data();
					 this.refresh();
				 })
				.classed("map-button", true)
				.append("img")
					.attr("src", "map.png");
	}
	refresh = () => {
		this.reset();
		if(this._show_map){
			this.#draw_map();
		} else {
			this.#draw_table();
		}
	}
}
