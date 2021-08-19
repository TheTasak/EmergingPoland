class BasicInfo{
	constructor(container, stock_name, end_year, language){
		this.container = container;
		this.stock_name = stock_name;
		this.language = language;
		this.year = end_year.split("_")[0];
	}
	getSuffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let val = parseInt(this.data["capitalization"]);
	  if(val >= 1000000000){
		  this.data["capitalization"] /= 1000000000.0;
		  this.suffix = "mld";
	  } else if(val >= 1000000){
		  this.data["capitalization"] /= 1000000.0;
		  this.suffix = "mln";
		} else if(val >= 1000){
			this.data["capitalization"] /= 1000.0;
		  this.suffix = "tys";
	  } else {
			this.suffix = "";
		}
  }
	load_data = () => {
		d3.json("php/getbasicinfo.php?" + "stock_name=" + this.stock_name + "&year=" + this.year + "&lang=" + this.language).then( d => {
			  this.data = d;
				this.getSuffix();
        this.table = [
    			{"name":"Nazwa spółki", "data": this.data["name"], "suffix": ""},
    			{"name":"Data debiutu", "data": this.data["debut_date"], "suffix": ""},
    			{"name":"Ticket", "data": this.data["ticket"], "suffix": ""},
    			{"name":"Indeks", "data": this.data["index"], "suffix": ""},
          {"name":"Branża", "data": this.data["industry"], "suffix": ""},
    			{"name":"ISIN", "data": this.data["ISIN"], "suffix": ""},
					{"name":"Cena akcji", "data": parseFloat(this.data["price"]).toFixed(2), "suffix": "PLN"},
          {"name":"Kapitalizacja", "data": parseFloat(this.data["capitalization"]).toFixed(2), "suffix": this.suffix}
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
		this.drawTable();
	}
	update = () => {
		this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);
	}
  drawTable = () => {
    const table = d3.select(this.container)
			.select(".info-table")
      .append("table")
        .attr("width", "80%");
		table.append("tr")
				 .append("td")
				 .attr("colspan", "2")
				 .html("Informacje o spółce")
				 .classed("table-title", true);
		table.selectAll(".table-row")
				.data(this.table)
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

    for(let i = 0; i < this.table.length; i++) {
      d3.select(labels_el[i])
        .text(this.table[i]["name"]);

      d3.select(values_el[i])
        .text(this.table[i]["data"] + " " + this.table[i]["suffix"]);
    }
  }
	refresh = () => {
  }
}
