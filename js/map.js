class WorldMap{
	_country_arr = [];
	_map_data = [];
	_show_map = true;
	stock_name = "";
	year = 2020;
	constructor(container, stock_name, start_year, currency, language){
		this.container = container;
		this.stock_name = stock_name;
		this.start_year = start_year;
		this.currency = currency;
		this.language = language;
		this.#load_data();
	}
	#load_data = () => {
		d3.json("php/getcountries.php?" + "stock_name=" + this.stock_name + "&date=" + this.year + "&lang=" + this.language).then( d => {
			this._country_arr = d;
			if(this._country_arr.length <= 0){
				this.year--;
				this.#load_data();
				return;
			}
			this._country_arr.sort((a,b) => (a.value > b.value) ? 1 : -1);
			d3.json("js/world.geojson").then( (d) => {
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
		this.width = parseInt(this.container.clientWidth);
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
			let mapProjection = d3.geoNaturalEarth()
								.scale(this.svg_height / Math.PI)
								.translate([this.width / 2, this.svg_height / 2]);
			let geoPath = d3.geoPath(mapProjection);
			let colors = d3.scaleLinear()
							.domain([d3.min(this._country_arr, d => d.value), d3.max(this._country_arr, d => d.value)])
							.range(["rgb(150,255,150)", "green"]);

			this.svg.append("g")
					.selectAll("path")
					.data(this._map_data.features)
					.enter()
					.append("path")
					.attr("d", geoPath)
					.classed("country", true);
			this.svg.selectAll("path")
				.filter( (d) => {
						let result = this._country_arr.map(obj => obj.country);
						return result.includes(d.properties["name"]);
					})
					.attr("fill", (d) => colors(this._country_arr.find(obj => obj.country == d.properties["name"]).value));
			this.svg.selectAll("path")
				.filter( (d) => {
						let result = this._country_arr.map(obj => obj.country);
						return !result.includes(d.properties["name"]);
					})
					.attr("fill", "#e0e0e0");
			this.svg.call(d3.zoom().scaleExtent([1, 6]).translateExtent([[0, 0], [this.width, this.svg_height]]).on("zoom", (ev) => {
				this.svg.select("g").transition().ease(d3.easeCubicOut).duration(150).attr("transform", ev.transform)
			}));

			const tooltip = this.svg.append("rect")
	              .attr("width", "0px")
	              .attr("height", "0px")
	              .style("fill", "white")
	              .style("stroke", "black")
	              .classed("tooltip", true);
	    const tooltiptext = this.svg.append("text")
	              .classed("tooltip-text", true);
	    this.svg.selectAll("path")
				.filter(data => {
					let index = this._country_arr.findIndex( country => {
						return country.country == data.properties.name;
					});
					return index != -1;
				})
  			.on("mousemove", (ev, d) => {
					let index = this._country_arr.findIndex( country => {
						return country.country == d.properties.name;
					});
					let name = this._country_arr[index].translate;
					let value = this._country_arr[index].value + "tys " + this.currency;

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
  			.on("mouseout", function(ev, d){
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
			country_string += "<tr><td align='center'>" + this._country_arr[i].translate + "</td><td align='right'>" + parseInt(this._country_arr[i].value) + "tys " + this.currency + "</td></tr>";
		}
		country_string += "</table>";
		d3.select(this.container).select(".svg-div").html(country_string);
	}
	#draw_inputs = () => {
		d3.select(this.container)
			.select(".button-div")
			.append("span")
				.style("font-size", "30px")
				.style("padding", "0 10px")
				.text("Podział przychodów ze względu na kraje")
				.classed("chart-title", true);
		d3.select(this.container)
			.select(".button-div")
				.append("button")
				.attr("type", "button")
				.text("<")
				.on("click", this.#earlier_year)
				.classed("map-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("span")
				.style("font-size", "36px")
				.style("padding", "0 10px")
				.on("click", () => { this._show_map = !this._show_map; this.refresh();})
				.text(this.year)
				.classed("map-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("button")
				.attr("type", "button")
				.text(">")
				.on("click", this.#later_year)
				.classed("map-button", true);
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
