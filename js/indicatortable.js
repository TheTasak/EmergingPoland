class Indicators{
	stock_name = "";
	year = "2020";
	constructor(container, stock_name, start_year, currency, language){
		this.container = container;
		this.stock_name = stock_name;
		this.start_year = start_year;
		this.currency = currency;
		this.language = language;
		this.#load_data();
	}
  #earlier_year = () => {
		if(this.year <= this.start_year)
			return;
		this.year--;
    this.refresh();
	}
	#later_year = () => {
		if(this.year >= 2020)
			return;
		this.year++;
    this.refresh();
	}
  #earnings_per_share = (year) => {
    return parseFloat(this._data[year]["kurs_waluty"]*this._data[year]["zysk_netto"]*1000 / this._data[year]["akcje"]).toFixed(2);
  }
  #price_earnings = (year) => {
    return parseFloat(this._data[year]["cena_akcji"] / this.#earnings_per_share(year)).toFixed(2);
  }
  #price_book_value = (year) => {
    return parseFloat(this._data[year]["cena_akcji"] / (this._data[year]["kurs_waluty"]*this._data[year]["kapital_wlasny"]*1000 /  this._data[year]["akcje"])).toFixed(2);
  }
  #price_revenue = (year) => {
    return parseFloat(this._data[year]["cena_akcji"] / (this._data[year]["kurs_waluty"]*this._data[year]["przychody"]*1000 /  this._data[year]["akcje"])).toFixed(2);
  }
  #dividend_yield = (year) => {
    return parseFloat(this._data[year]["kurs_waluty"]*this._data[year]["dywidenda"] / this._data[year]["cena_akcji"] * 100).toFixed(2);
  }
	#load_data = () => {
		d3.json("php/getalldata.php?" + "stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.year).then( d => {
			this._data = d;
      this.refresh();
		});
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
	}
  #draw_inputs = () => {
    d3.select(this.container)
			.select(".button-div")
			.append("button")
			.attr("type", "button")
			.text("🠔")
      .on("click", this.#earlier_year)
			.classed("treechart-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("span")
			.style("padding", "0 10px")
			.text(this.year)
			.classed("indicator-button", true);
		d3.select(this.container)
			.select(".button-div")
			.append("button")
			.attr("type", "button")
			.text("🠖")
      .on("click", this.#later_year)
			.classed("indicator-button", true);
  }
  draw_table = () => {
    let indicator_string = '<table class="indicator-table">';
		indicator_string += "<tr><td>Zysk na akcję</td><td>" + this.#earnings_per_share(this.year) + "</td></tr>";
    indicator_string += "<tr><td>Cena/Zysk</td><td>" + this.#price_earnings(this.year) + "</td></tr>";
    indicator_string += "<tr><td>Cena/Wartość księgowa</td><td>" + this.#price_book_value(this.year) + "</td></tr>";
    indicator_string += "<tr><td>Cena/Przychody</td><td>" + this.#price_revenue(this.year) + "</td></tr>";
    indicator_string += "<tr><td>Stopa dywidendy</td><td>" + this.#dividend_yield(this.year) + "% </td></tr>";
		indicator_string += "</table>";
		d3.select(this.container).select(".svg-div").html(indicator_string);
  }
	refresh = () => {
		this.reset();
    this.#draw_inputs();
    this.draw_table();
  }
}
