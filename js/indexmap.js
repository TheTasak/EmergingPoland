class IndexMap{
	_country_arr = [];
	_map_data = [];
	_show_map = true;
	constructor(container, index_name, language){
		this.container = container;
		this.index_name = index_name;
		this.language = language;
		this.load_data();
	}
	split_value = (value) => {
    let new_value = [];
    let split_value = String(value).split(".")[0];
		let rev_value = split_value.length % 3;
		let string = "";
    if(rev_value != 0) {
      new_value.push(split_value.substr(0, rev_value));
    }
    for(let i = 0 + rev_value; i < split_value.length; i += 3) {
      new_value.push(split_value.substr(i, 3));
    }
		for(let i = 0; i < new_value.length; i++) {
      string += new_value[i] + " ";
    }
		string = string.slice(0, -1);
    return string + (String(value).split(".")[1] != undefined ? "." + String(value).split(".")[1] : "");
  }
	load_data = () => {
		d3.json("php/getstockscountries.php?index=" + this.index_name + "&lang=" + this.language).then( d => {
			// Wczytanie danych przychodów w krajach w danym roku
			this._country_arr = d;
			// Jeżeli brak danych, to spróbuj w poprzednim roku rekurencyjnie
      this._country_arr.forEach((item) => item.value = parseFloat(item.value));
      this._country_arr.sort((a,b) => (a.value < b.value) ? 1 : -1);
			d3.json("js/world.geojson").then( (d) => {
				// Wczytanie danych geometrii mapy
				this._map_data = d;
				this.init();
			});
		});
	}
	earlier_year = () => {
		if(this.year <= this.start_year)
			return;
		this.year--;
		this.load_data();
	}
	later_year = () => {
		if(this.year >= 2020)
			return;
		this.year++;
		this.load_data();
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
		this.update();
		this.init_inputs();
		if(this._show_map){
			this.draw_map();
		} else {
			this.init_table();
		}
		this.refresh();
	}
	update = () => {
		this.width = parseInt(this.container.clientWidth)*0.9;
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
	init_inputs = () => {
		// Tytuł wykresu
		d3.select(this.container)
			.select(".button-div")
			.append("span")
				.style("padding", "0 10px")
				.on("click", () => { this._show_map = !this._show_map; this.init();})
				.text("Podział indeksu ze względu na źródło przychodów")
				.classed("map-button", true);
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
						.domain([d3.min(this._country_arr, d => d.value), d3.max(this._country_arr, d => d.value)])
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
					return arr_index != -1 && !isNaN(this._country_arr[arr_index].value);
				})
				.attr("fill",	(d) => {
					let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);
					return colors(parseFloat(this._country_arr[arr_index].value));
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
					return arr_index == -1 || isNaN(this._country_arr[arr_index].value);
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
				return arr_index != -1 && this._country_arr[arr_index].value > 0;
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
				let value = this._country_arr[arr_index].value;

				let tooltipsize = [String(name + " " + this.split_value(value) + " PLN").length*10+10, 40];
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
				.text(name + " " + this.split_value(value) + " PLN");
			})
			.on("mouseout", (ev, d) => {
				let arr_index = this._country_arr.findIndex(search_index, d.properties["name"]);

				let region_countries = ev.target.className.baseVal.split(" ")[0];
				d3.select(this.container)
					.selectAll("." + region_countries)
					.attr("fill", colors(this._country_arr[arr_index].value));

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
	init_table = () => {
		let country_string = '<table class="map-country-table">';
		console.log(this._country_arr);
		for(let i = 0; i < this._country_arr.length; i++){
			if(!isNaN(this._country_arr[i].value)) {
				country_string += "<tr><td align='center' width='50%'>" + this._country_arr[i].translate + "</td><td align='right'>" + this.split_value(parseFloat(this._country_arr[i].value).toFixed(0)) + " PLN" + "</td><td width='5%'></td></tr>";
			}
		}
		country_string += "<tr><td align='center' width='50%'>" + "Suma przychodów:" + "</td><td align='right'>" + this.split_value(parseFloat(d3.sum(this._country_arr, d => d.value)).toFixed(0)) + " PLN" + "</td><td width='5%'></td></tr>";
		country_string += "</table>";
		d3.select(this.container).select(".svg-div").html(country_string);
	}

	refresh = () => {
		this.update();
		clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(this.draw_map, 10);
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
