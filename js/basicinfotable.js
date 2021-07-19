class BasicInfo{
	stock_name = "";
	year = "2020";
	_table = "";
	constructor(container, stock_name, end_year, language){
		this.container = container;
		this.stock_name = stock_name;
		this.language = language;
		this.year = end_year.split("_")[0];
	}
	get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let val = parseInt(this._data["capitalization"]);
	  if(val >= 1000000000){
		  this._data["capitalization"] /= 1000000000.0;
		  this.suffix = "mld";
	  } else if(val >= 1000000){
		  this._data["capitalization"] /= 1000000.0;
		  this.suffix = "mln";
		} else if(val >= 1000){
			this._data["capitalization"] /= 1000.0;
		  this.suffix = "tys";
	  } else {
			this.suffix = "";
		}
  }
	load_data = () => {
		d3.json("php/getbasicinfo.php?" + "stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then( d => {
			  this._data = d;
				this.get_suffix();
        this._table = [
    			{"name":"Nazwa spółki", "data": this._data["name"], "suffix": ""},
    			{"name":"Data debiutu", "data": this._data["debut_date"], "suffix": ""},
    			{"name":"Ticket", "data": this._data["ticket"], "suffix": ""},
    			{"name":"Indeks", "data": this._data["index"], "suffix": ""},
          {"name":"Branża", "data": this._data["industry"], "suffix": ""},
    			{"name":"ISIN", "data": this._data["ISIN"], "suffix": ""},
					{"name":"Cena akcji", "data": parseFloat(this._data["price"]).toFixed(2), "suffix": "PLN"},
          {"name":"Kapitalizacja", "data": parseFloat(this._data["capitalization"]).toFixed(2), "suffix": this.suffix}
    		];
				this.init();
		});
	}
	init = () => {
		d3.select(this.container)
			.html("");

		d3.select(this.container)
			.append("div")
			.classed("info-table", true);
		this.update();
		this.draw_table();
	}
	update = () => {
		this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
	}
  draw_table = () => {
    const rows = d3.select(this.container)
			.select(".info-table")
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
												.attr("width", "50%");
		const values_el = values.nodes();

    for(let i = 0; i < this._table.length; i++) {
      d3.select(labels_el[i])
        .text(this._table[i]["name"]);

      d3.select(values_el[i])
        .text(this._table[i]["data"] + " " + this._table[i]["suffix"]);
    }
  }
	refresh = () => {
  }
}
