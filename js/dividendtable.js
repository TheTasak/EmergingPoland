class DividendTable{
  _data = [];
  stock_name = "";
  constructor(container, stock_name, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.currency = currency;
    this.language = language;
    this.chart_types = [{"name":"Dywidenda na akcję", "variable": "value"}, {"name":"Stopa dywidendy", "variable": "yield"}, {"name":"Stopień wypłaty", "variable": "ratio"}];
    this.show_table = false;
    this.#load_data();
  }
  #load_data = () => {
	let json_data = d3.json("php/getdividenddata.php?&stock_name=" + String(this.stock_name)).then( (d) => {
    // Wyciąga z bazy kolumny z danymi
		this._data = d;
    this.keys = d3.map(this._data, d => d.year).filter( (val, index, self) => self.indexOf(val) === index);
    for(let i = 0; i < this.keys.length; i++) {
      let objects = [];
      let dividend_yield = 0;
      let dividend_value = 0;
      let dividend_ratio = 0;
      for(let j = 0; j < this._data.length; j++) {
        if(this._data[j].year == this.keys[i]) {
          dividend_value += parseFloat(this._data[j].value);
          let current_ratio = 0;
          if(this._data[j].value != 0) {
            current_ratio = parseFloat(this._data[j].stocks * this._data[j].value / this._data[j].earnings * 100).toFixed(2);
            dividend_ratio += parseFloat(current_ratio);
          }
          let current_yield = 0;
          if(this._data[j].stock_price != null) {
            current_yield = parseFloat(this._data[j].value * this._data[j].exchange_rate / this._data[j].stock_price * 100).toFixed(2);
            dividend_yield += parseFloat(current_yield);
          }
          objects.push({"value" : this._data[j].value, "yield": current_yield, "ratio": current_ratio});
        }
      }
      if(isNaN(parseFloat(dividend_yield)))
        dividend_yield = 0;
      if(isNaN(parseFloat(dividend_value)))
        dividend_value = 0;
      if(isNaN(parseFloat(dividend_ratio)))
        dividend_ratio = 0;
      this.keys[i] = {"year": this.keys[i], "children" : objects, "yield" : dividend_yield, "value": dividend_value, "ratio" : dividend_ratio};
    }
		this.init();
	  });
  }
  init = () => {
    // Usunięcie starego wykresu
    d3.select(this.container)
      .html("");
    this.#update();
    this.#init_table();
    this.refresh();
  }
  #update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight);
  }
  #init_table = () => {
    const table = d3.select(this.container)
      .append("div")
        .classed("dividend-table", true)
		    .append("table")
          .attr("width", "100%");
		const table_el = table.nodes();
		let table_string = "";
		table_string += '<tr class="table-row">';
		table_string += "<td width='25%'>" + "Rok" + "</td>";
		table_string += "<td width='25%'>" + "Dywidenda na akcję" + "</td>";
		table_string += "<td width='25%'>" + "Stopa dywidendy" + "</td>";
    table_string += "<td width='25%'>" + "Stopień wypłaty" + "</td>";
		table_string += "</tr>";
		for(let i = this.keys.length-1; i >= 0; i--) {
			table_string += '<tr class="table-row">';
			table_string += "<td width='25%'>" + this.keys[i].year + "</td>";
      if(this.keys[i].value == 0) {
        table_string += "<td width='25%'>" + "-" + "</td>";
  			table_string += "<td width='25%'>" + "-" + "</td>";
        table_string += "<td width='25%'>" + "-" + "</td>";
      } else {
        table_string += "<td width='25%'>" + parseFloat(this.keys[i].value).toFixed(2) + this.currency + "</td>";
        table_string += "<td width='25%'>" + parseFloat(this.keys[i].yield).toFixed(2) + "%" + "</td>";
        table_string += "<td width='25%'>" + parseFloat(this.keys[i].ratio).toFixed(2) + "%" + "</td>";
      }
			table_string += "</tr>";
		}
		d3.select(table_el[0])
			.html(table_string);
  }
  refresh = () => {
    this.#update();
  }
}
