class WorldMap{
	country_arr = [
				  {country: 'Brazil', value: 100},
				  {country: 'Poland', value: 20},
				  {country: 'Spain', value: 50}
	];
	constructor(container){
		this.container = container;
		this.refresh();
	}
	refresh = () => {
		this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
		const old_svg = d3.select(this.container)
						.selectAll("svg")
						.remove();
		const svg = d3.select(this.container)
					  .append("svg")
					  .attr("width", this.width)
					  .attr("height", this.height);
		d3.json("world.geojson").then( (d) => {
			let mapProjection = d3.geoNaturalEarth()
								.scale(this.height / Math.PI)
								.translate([this.width / 2, this.height / 2]);
			let geoPath = d3.geoPath(mapProjection);
			var colors = d3.scaleLinear()
							.domain(d3.ticks(0, d3.max(this.country_arr, d => d.value), 2))
							.range(["#222222", "#4dff00"]);
			svg.append("g")
					.selectAll("path")
					.data(d.features)
					.enter()
					.append("path")
					.attr("d", geoPath)
					.style("stroke", "#220022")
					.style("stroke-width", "1px")
					.classed("country", true);
			svg.selectAll("path")
				.filter( (d) => {
						let result = this.country_arr.map(obj => obj.country);
						return result.includes(d.properties["name"]);
					})
					.attr("fill", (d) => colors(this.country_arr.find(obj => obj.country == d.properties["name"]).value));
			svg.selectAll("path")
				.filter( (d) => {
						let result = this.country_arr.map(obj => obj.country);
						return !result.includes(d.properties["name"]);
					})
					.attr("fill", "#000000");
			svg.call(d3.zoom().scaleExtent([1, 8]).translateExtent([[0, 0], [this.width, this.height]]).on("zoom", function(ev) { 
				svg.select("g").attr("transform", ev.transform)
			}));
		});
	}
}