class Indicators{
	stock_name = "";
	year = "2020";
	_table = "";
	constructor(container, stock_name, start_year, currency, language){
		this.container = container;
		this.stock_name = stock_name;
		this.start_year = start_year;
		this.currency = currency;
		this.language = language;
		this._table = [
			{"name":"Zysk na akcję", "function": this.#earnings_per_share, "suffix": "PLN"},
			{"name":"Cena/Zysk", "function": this.#price_earnings, "suffix": ""},
			{"name":"Cena/Wartość księgowa", "function": this.#price_book_value, "suffix": ""},
			{"name":"Cena/Przychody", "function": this.#price_revenue, "suffix": ""},
			{"name":"Stopa dywidendy", "function": this.#dividend_yield, "suffix": "%"},
			{"name":"ROE", "function": this.#roe, "suffix": "%"},
			{"name":"ROA", "function": this.#roa, "suffix": "%"},
			{"name":"Piotrkowski F-Score", "function": this.#piotrkowski_fscore, "suffix": ""},
			{"name":"Marża zysku ze sprzedaży", "function": this.#gross_margin_ratio, "suffix": "%"},
			{"name":"Produktywność aktywów", "function": this.#asset_turnover_ratio, "suffix": "%"},
			{"name":"Płynność bieżąca", "function": this.#current_ratio, "suffix": ""},
			{"name":"Zadłużenie długoterminowe", "function": this.#longtermdebt_ratio, "suffix": ""},
			{"name":"Jakość zysku", "function": this.#earnings_quality, "suffix": ""},
			{"name":"Marża operacyjna", "function": this.#operating_margin, "suffix": "%"}
		];
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
	#sum_data = (year, data) => {
		let string = String(year);
		let array = string.split("_", 2);
		let sum = 0;
		if(array[1] != undefined) {
			let ar_year = parseInt(array[0]);
			let ar_quarter = parseInt(array[1]);
			for(let i = 0; i < 4; i++) {
				if(ar_quarter < 1) {
					ar_year--;
					ar_quarter = 4;
				}
				sum += parseFloat(this._data[ar_year + "_" + ar_quarter][data]).toFixed(2);
				ar_quarter--;
			}
		} else {
			sum = parseFloat(this._data[year][data]).toFixed(2);
		}
		return sum;
	}
  #earnings_per_share = (year) => {
		let sum = this.#sum_data(year, "zysk_netto");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
    return parseFloat((kurs*sum*1000) / this._data[year]["akcje"]).toFixed(2);
  }
  #price_earnings = (year) => {
    return parseFloat(this._data[year]["cena_akcji"] / this.#earnings_per_share(year)).toFixed(2);
  }
  #price_book_value = (year) => {
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
    return parseFloat(this._data[year]["cena_akcji"] / (kurs*this._data[year]["kapital_wlasny"]*1000 /  this._data[year]["akcje"])).toFixed(2);
  }
  #price_revenue = (year) => {
		let sum = this.#sum_data(year, "przychody");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
    return parseFloat(this._data[year]["cena_akcji"] / (kurs*sum*1000 /  this._data[year]["akcje"])).toFixed(2);
  }
  #dividend_yield = (year) => {
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
    return parseFloat((kurs*this._data[year]["dywidenda"]) / (this._data[year]["cena_akcji"]) * 100).toFixed(2);
  }
	#roa = (year) => {
		let sum = this.#sum_data(year, "zysk_netto");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];

		return parseFloat((kurs*sum*1000) / (kurs*this._data[year]["aktywa"]*1000) * 100).toFixed(2);
	}
	#roe = (year) => {
		let sum = this.#sum_data(year, "zysk_netto");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
		return parseFloat((kurs*sum*1000) / (kurs*this._data[year]["kapital_wlasny"]*1000) * 100).toFixed(2);
	}
	#longtermdebt_ratio = (year) => {
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
		return parseFloat((kurs*this._data[year]["zobowiazania_dlugoterminowe"]*1000) / (kurs*this._data[year]["kapital_wlasny"]*1000)).toFixed(2);
	}
	#current_ratio = (year) => {
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
		return parseFloat((kurs*this._data[year]["aktywa_obrotowe"]*1000) / (kurs*this._data[year]["zobowiazania_krotkoterminowe"]*1000)).toFixed(2);
	}
	#asset_turnover_ratio = (year) => {
		let sum = this.#sum_data(year, "przychody");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
		return parseFloat((kurs*sum*1000) / (kurs*this._data[year]["aktywa"]*1000) * 100).toFixed(2);
	}
	#gross_margin_ratio = (year) => {
		let sum_earnings = this.#sum_data(year, "przychody");
		let sum_profits = this.#sum_data(year, "zysk_ze_sprzedazy");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
		return parseFloat((kurs*sum_profits*1000) / (kurs*sum_earnings*1000) * 100).toFixed(2);
	}
	#earnings_quality = (year) => {
		let sum_flow = this.#sum_data(year, "przeplyw_pieniezny_z_dzialalnosci_operacyjnej");
		let sum_profits = this.#sum_data(year, "zysk_netto");
		return parseFloat((sum_flow*1000) / (sum_profits*1000)).toFixed(2);
	}
	#operating_margin = (year) => {
		let sum_operating = this.#sum_data(year, "zysk_operacyjny");
		let sum_earnings = this.#sum_data(year, "przychody");
		let kurs = 1;
		if(this._data[year]["kurs_waluty"] != undefined)
			kurs = this._data[year]["kurs_waluty"];
		return parseFloat((kurs*sum_operating*1000)/(kurs*sum_earnings*1000) * 100).toFixed(2);
	}
	#piotrkowski_fscore = (year) => {
		if(year <= this.start_year)
			return "";
		let points = 0;
		// spółka wypracowała zysk w ostatnim roku
		points += (this.#sum_data(year, "zysk_netto") > 0 ? 1 : 0);
		// spółka zanotowała dodatnie przepływy pieniężne
		points += (this.#sum_data(year, "przeplyw_pieniezny_z_dzialalnosci_operacyjnej") > 0 ? 1 : 0);
		// spółka zwiększyła roa r/r
		points += (this.#roa(year) > this.#roa(year*1-1) ? 1 : 0);
		// wartość przepływów pieniężnych większa niż zysk
		points += (this.#earnings_quality(year) >= 1 ? 1 : 0);
		// zmniejszył się stosunek zadłużenia do aktywów
		points += (this.#longtermdebt_ratio(year) < this.#longtermdebt_ratio(year*1-1) ? 1 : 0);
		// zmniejszyło się zadłużenie krótkoterminowe
		points += (this.#current_ratio(year) > this.#current_ratio(year*1-1) ? 1 : 0);
		// nie zwiększa się liczba akcji w obiegu
		points += (this._data[year]["akcje"] <= this._data[year*1-1]["akcje"] ? 1 : 0);
		// wzrost produktywności aktywów
		points += (this.#asset_turnover_ratio(year) > this.#asset_turnover_ratio(year*1-1) ? 1 : 0);
		// wzrost marży sprzedaży
		points += (this.#gross_margin_ratio(year) > this.#gross_margin_ratio(year*1-1) ? 1 : 0);
		return points;
	}
	#historical_min = (func) => {
		let min = func(this.start_year*1 +1);
		for(let i = this.start_year; i <= this.year; i++) {
			if(func(i) < min && func(i) != "")
				min = func(i);
		}
		return parseFloat(min).toFixed(2);
	}
	#historical_average = (func) => {
		let years = this.year - this.start_year + 1;
		let avg = 0;
		for(let i = this.start_year; i <= this.year; i++) {
			avg += func(i)*1;
		}
		avg /= years;
		return parseFloat(avg).toFixed(2);
	}
	#historical_max = (func) => {
		let max = func(this.start_year);
		for(let i = this.start_year; i <= this.year; i++) {
			if(func(i) >= Number(max))
				max = func(i);
		}
		return parseFloat(max).toFixed(2);
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
			.append("span")
			.style("padding", "0 10px")
			.text(this.year)
			.classed("indicator-button", true);
  }
  draw_table = () => {
    const rows = d3.select(this.container)
			.select(".svg-div")
			.classed("indicator-table", true)
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

		const sliders = d3.select(this.container)
											.selectAll(".table-row")
											.append("td")
												.classed("row-slider", true)
												.attr("width", "100%")
												.append("div")
													.classed("row-slider-div", true);
		const sliders_el = sliders.nodes();

		for(let i = 0; i < this._table.length; i++) {
			d3.select(labels_el[i])
				.text(this._table[i]["name"]);
			let max = parseFloat(this.#historical_max(this._table[i]["function"]));
			let min = parseFloat(this.#historical_min(this._table[i]["function"]));
			noUiSlider.create(sliders_el[i], {
	      start: [parseFloat(this.#historical_average(this._table[i]["function"])), parseFloat(this._table[i]["function"](this.year))],
	      behaviour: 'none',
				tooltips: [false, true],
				connect: [false, true, false],
				pips: {
	          mode: 'values',
	          values: [parseFloat(this.#historical_min(this._table[i]["function"])), parseFloat(this.#historical_max(this._table[i]["function"]))],
	          density: 10,
						format: wNumb({
	            decimals: 2,
							suffix: this._table[i]["suffix"]
        		}),
						stepped: true
	      },
	      range: {
	          'min': parseFloat(this.#historical_min(this._table[i]["function"])),
	          'max': parseFloat(this.#historical_max(this._table[i]["function"]))
	      }
			});
			let handles = d3.select(sliders_el[i])
											.selectAll(".noUi-handle").nodes();
			d3.select(handles[0])
				.classed("handle-invisible", true);
			sliders_el[i].noUiSlider.on("change", () => {
				sliders_el[i].noUiSlider.set([(this.#historical_average(this._table[i]["function"])), parseFloat(this._table[i]["function"](this.year))]);
			});
		}
  }
	refresh = () => {
		this.reset();
    this.#draw_inputs();
    this.draw_table();
  }
}
