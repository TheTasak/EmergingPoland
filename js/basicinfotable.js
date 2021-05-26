class BasicInfo{
	stock_name = "";
	year = "2020";
	_table = "";
	constructor(container, stock_name, start_year, language){
		this.container = container;
		this.stock_name = stock_name;
		this.language = language;
		this.#load_data();
	}
	#load_data = () => {
		d3.json("php/getbasicinfo.php?" + "stock_name=" + this.stock_name + "&year=" + this.year).then( d => {
			  this._data = d;
        this._table = [
    			{"name":"Nazwa spółki", "data": this._data["name"], "suffix": "PLN"},
    			{"name":"Data debiutu", "data": "", "suffix": ""},
    			{"name":"Ticket", "data": this._data["ticket"], "suffix": ""},
    			{"name":"Indeks", "data": this._data["index"], "suffix": ""},
          {"name":"Sektor", "data": "", "suffix": ""},
    			{"name":"ISIN", "data": this._data["ISIN"], "suffix": ""},
          {"name":"Kapitalizacja", "data": parseInt(this._data["capitalization"]), "suffix": ""}
    		];
        this.refresh();
		});
	}
	reset = () => {
		d3.select(this.container)
			.selectAll(".svg-div")
			.remove();
		this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);

		d3.select(this.container)
			.append("div")
			.attr("width", this.width)
			.attr("height", this.height)
			.classed("svg-div", true);
	}
  draw_table = () => {
    const rows = d3.select(this.container)
      .select(".svg-div")
      .classed("info-table", true)
      .append("table")
        .attr("width", "100%")
        .selectAll(".table-row")
        .data(this._table)
        .enter()
        .append("tr")
          .classed("table-row", true);

    const labels = d3.select(this.container)
											.selectAll(".table-row")
											.append("td")
												.attr("width", "50%")
												.classed("row-name", true);
		const labels_el = labels.nodes();

		const values = d3.select(this.container)
											.selectAll(".table-row")
											.append("td")
												.classed("row-value", true)
												.attr("width", "100%");
		const values_el = values.nodes();

    for(let i = 0; i < this._table.length; i++) {
      d3.select(labels_el[i])
        .text(this._table[i]["name"]);

      d3.select(values_el[i])
        .text(this._table[i]["data"]);
    }
  }
	refresh = () => {
		this.reset();
    this.draw_table();
  }
}
