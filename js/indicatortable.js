class Indicators{
	stock_name = "";
	_table = "";
	constructor(container, stock_name, start_year, end_report, language){
		this.container = container;
		this.stock_name = stock_name;
		this.start_year = start_year;
		this.end_year = end_report.split("_")[0];
		this.end_quarter = end_report.split("_")[1];
		this.language = language;
		this.table = [
			{"name": "Wartość rynkowa", "table": [
				{"name":"Zysk na akcję", "function": this.earnings_per_share, "suffix": "PLN"},
				{"name":"Cena/Zysk", "function": this.price_earnings, "suffix": ""},
				{"name":"Cena/Wartość księgowa", "function": this.price_book_value, "suffix": ""},
				{"name":"Cena/Wartość księgowa Grahama", "function": this.price_graham_book_value, "suffix": ""},
				{"name":"Cena/Przychody", "function": this.price_revenue, "suffix": ""},
				{"name":"Cena/Zysk operacyjny", "function": this.price_operating_profit, "suffix": ""},
				{"name":"EV", "function": this.enterprise_value, "suffix": ""},
				{"name":"EV/EBITDA", "function": this.enterprise_value_ebitda, "suffix": ""}
			]},
			{"name": "Rentowność", "table": [
				{"name":"ROE", "function": this.roe, "suffix": "%"},
				{"name":"ROA", "function": this.roa, "suffix": "%"},
				{"name":"Marża operacyjna", "function": this.operating_margin, "suffix": "%"},
				{"name":"Marża zysku brutto ze sprzedaży", "function": this.gross_margin_ratio, "suffix": "%"},
				{"name":"Produktywność aktywów", "function": this.asset_turnover_ratio, "suffix": "%"}
			]},
			{"name": "Zadłużenie", "table": [
				{"name":"Zadłużenie ogólne", "function": this.debt_ratio, "suffix": ""},
				{"name":"Zadłużenie długoterminowe", "function": this.longtermdebt_ratio, "suffix": ""},
				{"name":"Jakość zysku", "function": this.earnings_quality, "suffix": ""}
			]},
			{"name": "Płynność", "table": [
				{"name":"I stopień pokrycia", "function": this.first_coverage_ratio, "suffix": ""},
				{"name":"Płynność bieżąca", "function": this.current_ratio, "suffix": ""}
			]},
			{"name": "Rating", "table": [
				{"name":"Piotrkowski F-Score", "function": this.piotrkowski_fscore, "suffix": ""},
				{"name":"Altman EM-Score", "function": this.altman_score, "suffix": ""}
			]}
		];
	}
	sum_data = (year, data) => {
		let string = String(year);
		let array = string.split("_");
		let sum = 0;
		if(array[1] != undefined) {
			let ar_year = parseInt(array[0]);
			let ar_quarter = parseInt(array[1]);
			for(let i = 0; i < 4; i++) {
				if(ar_quarter < 1) {
					ar_year--;
					ar_quarter = 4;
				}
				let temp = parseFloat(this.data[ar_year + "_" + ar_quarter][data]);
				if(isNaN(temp))
					break;
				sum += temp;
				ar_quarter--;
			}
		} else {
			sum = parseFloat(this.data[year][data]).toFixed(2);
		}
		return sum;
	}
  earnings_per_share = (year) => {
		let sum = this.sum_data(year, "zysk_netto");
    return parseFloat((this.data[year]["kurs_waluty"]*sum*1000) / this.data[year]["akcje"]).toFixed(2);
  }
  price_earnings = (year) => {
    return parseFloat(this.data[year]["cena_akcji"] / this.earnings_per_share(year)).toFixed(2);
  }
	book_value_per_share = (year) => {
		return parseFloat((this.data[year]["kurs_waluty"]*this.data[year]["kapital_wlasny"]*1000) / this.data[year]["akcje"]).toFixed(2);
	}
	price_book_value = (year) => {
		return parseFloat(this.data[year]["cena_akcji"] / this.book_value_per_share(year)).toFixed(2);
	}
	graham_book_value_per_share = (year) => {
		let temp = parseFloat((this.data[year]["kurs_waluty"]*this.data[year]["aktywa_obrotowe"]*1000) - ((this.data[year]["kurs_waluty"]*this.data[year]["zobowiazania_krotkoterminowe"]*1000) + (this.data[year]["kurs_waluty"]*this.data[year]["zobowiazania_dlugoterminowe"]*1000))).toFixed(2);
		return parseFloat(temp/this.data[year]["akcje"]).toFixed(2);
	}
	price_graham_book_value = (year) => {
		return parseFloat(this.data[year]["cena_akcji"]/ this.graham_book_value_per_share(year)).toFixed(2);
	}
  price_revenue = (year) => {
		let sum = this.sum_data(year, "przychody");
    return parseFloat(this.data[year]["cena_akcji"] / (this.data[year]["kurs_waluty"]*sum*1000 / this.data[year]["akcje"])).toFixed(2);
  }
	price_operating_profit = (year) => {
		let sum = this.sum_data(year, "zysk_operacyjny");
		return parseFloat(this.data[year]["cena_akcji"] / (this.data[year]["kurs_waluty"]*sum*1000 / this.data[year]["akcje"])).toFixed(2);
	}
  dividend_yield = (year) => {
		if(isNaN(this.data[year]["dywidenda"]))
			return 0;
    return parseFloat((this.data[year]["kurs_waluty"]*this.data[year]["dywidenda"]) / (this.data[year]["cena_akcji"]) * 100).toFixed(2);
  }
	roa = (year) => {
		let sum = this.sum_data(year, "zysk_netto");
		return parseFloat((this.data[year]["kurs_waluty"]*sum*1000) / (this.data[year]["kurs_waluty"]*this.data[year]["aktywa"]*1000) * 100).toFixed(2);
	}
	roe = (year) => {
		let sum = this.sum_data(year, "zysk_netto");
		return parseFloat((this.data[year]["kurs_waluty"]*sum*1000) / (this.data[year]["kurs_waluty"]*this.data[year]["kapital_wlasny"]*1000) * 100).toFixed(2);
	}
	debt_ratio = (year) => {
		return parseFloat((this.data[year]["kurs_waluty"]*this.data[year]["zobowiazania_krotkoterminowe"]*1000 + this.data[year]["kurs_waluty"]*this.data[year]["zobowiazania_dlugoterminowe"]*1000) / (this.data[year]["kurs_waluty"]*this.data[year]["aktywa"]*1000)).toFixed(2);
	}
	longtermdebt_ratio = (year) => {
		return parseFloat((this.data[year]["kurs_waluty"]*this.data[year]["zobowiazania_dlugoterminowe"]*1000) / (this.data[year]["kurs_waluty"]*this.data[year]["kapital_wlasny"]*1000)).toFixed(2);
	}
	current_ratio = (year) => {
		return parseFloat((this.data[year]["kurs_waluty"]*this.data[year]["aktywa_obrotowe"]*1000) / (this.data[year]["kurs_waluty"]*this.data[year]["zobowiazania_krotkoterminowe"]*1000)).toFixed(2);
	}
	asset_turnover_ratio = (year) => {
		let sum = this.sum_data(year, "przychody");
		return parseFloat((this.data[year]["kurs_waluty"]*sum*1000) / (this.data[year]["kurs_waluty"]*this.data[year]["aktywa"]*1000) * 100).toFixed(2);
	}
	gross_margin_ratio = (year) => {
		let sum_earnings = this.sum_data(year, "przychody");
		let sum_profits = this.sum_data(year, "zysk_ze_sprzedazy");
		if(isNaN(sum_profits) || sum_profits == 0)
			return NaN;
		return parseFloat((this.data[year]["kurs_waluty"]*sum_profits*1000) / (this.data[year]["kurs_waluty"]*sum_earnings*1000) * 100).toFixed(2);
	}
	earnings_quality = (year) => {
		let sum_flow = this.sum_data(year, "przeplyw_pieniezny_z_dzialalnosci_operacyjnej");
		let sum_profits = this.sum_data(year, "zysk_netto");
		return parseFloat((sum_flow*1000) / (sum_profits*1000)).toFixed(2);
	}
	operating_margin = (year) => {
		let sum_operating = this.sum_data(year, "zysk_operacyjny");
		let sum_earnings = this.sum_data(year, "przychody");
		return parseFloat((this.data[year]["kurs_waluty"]*sum_operating*1000)/(this.data[year]["kurs_waluty"]*sum_earnings*1000) * 100).toFixed(2);
	}
	enterprise_value = (year) => {
		let capitalization = this.data[year]["cena_akcji"] * this.data[year]["akcje"];
		return parseFloat(capitalization + this.data[year]["zobowiazania_dlugoterminowe"]*1000*this.data[year]["kurs_waluty"] + this.data[year]["zobowiazania_krotkoterminowe"]*1000*this.data[year]["kurs_waluty"] - this.data[year]["gotowka"]*1000*this.data[year]["kurs_waluty"]).toFixed(2);
	}
	enterprise_value_ebitda = (year) => {
		let sum_ebitda = this.data[year]["ebitda"]*1000*this.data[year]["kurs_waluty"];
		return parseFloat(this.enterprise_value(year) / sum_ebitda).toFixed(2);
	}
	first_coverage_ratio = (year) => {
		return parseFloat((this.data[year]["kapital_wlasny"]*1000*this.data[year]["kurs_waluty"]) / (this.data[year]["aktywa_trwale"]*1000*this.data[year]["kurs_waluty"])).toFixed(2);
	}
	piotrkowski_fscore = (year) => {
		if(year <= this.start_year)
			return "";
		let array = String(year).split("_");
		let year_before = parseInt(array[0]) - 1;
		if(array[1] != undefined)
			year_before += "_" + array[1];
		let points = 0;
		// spółka wypracowała zysk w ostatnim roku
		points += (this.sum_data(year, "zysk_netto") > 0 ? 1 : 0);
		// spółka zanotowała dodatnie przepływy pieniężne
		points += (this.sum_data(year, "przeplyw_pieniezny_z_dzialalnosci_operacyjnej") > 0 ? 1 : 0);
		// spółka zwiększyła roa r/r
		points += (parseFloat(this.roa(year)) > parseFloat(this.roa(year_before)) ? 1 : 0);
		// wartość przepływów pieniężnych większa niż zysk
		points += (parseFloat(this.earnings_quality(year)) >= 1 ? 1 : 0);
		// zmniejszył się stosunek zadłużenia do aktywów
		points += (parseFloat(this.longtermdebt_ratio(year)) < parseFloat(this.longtermdebt_ratio(year_before)) ? 1 : 0);
		// zmniejszyło się zadłużenie krótkoterminowe
		points += (parseFloat(this.current_ratio(year)) > parseFloat(this.current_ratio(year_before)) ? 1 : 0);
		// nie zwiększa się liczba akcji w obiegu
		points += (parseInt(this.data[year]["akcje"]) <= parseInt(this.data[year_before]["akcje"]) ? 1 : 0);
		// wzrost produktywności aktywów
		points += (parseFloat(this.asset_turnover_ratio(year)) > parseFloat(this.asset_turnover_ratio(year_before)) ? 1 : 0);
		// wzrost marży sprzedaży
		points += (parseFloat(this.gross_margin_ratio(year)) > parseFloat(this.gross_margin_ratio(year_before)) ? 1 : 0);
		return points;
	}
	altman_score = (year) => {
		let x1 = (this.data[year]["aktywa"]*1000*this.data[year]["kurs_waluty"] - this.data[year]["zobowiazania_krotkoterminowe"]*1000*this.data[year]["kurs_waluty"]) / (this.data[year]["aktywa"]*1000*this.data[year]["kurs_waluty"]) * 6.56;
		let x2 = (this.sum_data(year, "zysk_netto")*1000*this.data[year]["kurs_waluty"]) / (this.data[year]["aktywa"]*1000*this.data[year]["kurs_waluty"]) * 3.26; // trzeba od zysku netto odjąć wypłacone dywidendy
		let x3 = (this.sum_data(year, "zysk_operacyjny")*1000*this.data[year]["kurs_waluty"]) / (this.data[year]["aktywa"]*1000*this.data[year]["kurs_waluty"]) * 6.72;
		let x4 = (this.data[year]["kapital_wlasny"]*1000*this.data[year]["kurs_waluty"]) / (this.data[year]["zobowiazania_krotkoterminowe"]*1000*this.data[year]["kurs_waluty"] + this.data[year]["zobowiazania_dlugoterminowe"]*1000*this.data[year]["kurs_waluty"]) * 1.05;
		let score = x1 + x2 + x3 + x4 + 3.25;
		return parseFloat(score).toFixed(2);
	}
	historical_min = (func) => {
		let min = Number.MAX_SAFE_INTEGER;
		let num = 0;
		for(let i = this.start_year; i <= this.end_year; i++) {
			if(i == this.end_year)
				num = parseFloat(func(i + "_" + this.end_quarter));
			else
			 	num = parseFloat(func(i));
			if(num < min && !isNaN(num) && isFinite(num))
				min = num;
		}
		if(min == Number.MAX_SAFE_INTEGER) {
			return 0;
		}
		return parseFloat(min).toFixed(2);
	}
	historical_median = (func) => {
		let array = [];
		let num = 0;
		for(let i = this.start_year; i <= this.end_year; i++) {
			if(i == this.end_year) {
				num = parseFloat(func(i + "_" + this.end_quarter));
			} else {
				num = parseFloat(func(i));
			}
			if(!isNaN(num) && isFinite(num)) {
				array.push(num);
			}
		}
		array.sort();
		let index = array.length / 2;
		if(index % 1 == 1)
			return (array[parseInt(index)] + array[parseInt(index)+1]) / 2;
		else
			return array[parseInt(index)];
	}
	historical_max = (func) => {
		let max = Number.MIN_SAFE_INTEGER;
		let num = 0;
		for(let i = this.start_year; i <= this.end_year; i++) {
			if(i == this.end_year) {
				num = parseFloat(func(i + "_" + this.end_quarter));
			} else {
				num = parseFloat(func(i));
			}
			if(num > max && !isNaN(num) && isFinite(num))
				max = num;
		}
		if(max == Number.MIN_SAFE_INTEGER) {
			return 0;
		}
		return parseFloat(max).toFixed(2);
	}
	load_data = () => {
		d3.json("php/getalldata.php?" + "stock_name=" + this.stock_name + "&start_year=" + this.start_year + "&end_year=" + this.end_year).then( d => {
			this.data = d;
			this.init();
		});
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
			.style("line-height", "1")
			.classed("button-div", true);
		d3.select(this.container)
			.append("div")
			.classed("svg-div", true);

		this.update();
		this.init_inputs();
		this.init_table();
	}
	update = () => {
		this.width = parseInt(this.container.clientWidth);
		this.height = parseInt(this.container.clientHeight);

		this.svg_height = this.height*0.9;
		this.button_height = this.height*0.1;
		d3.select(this.container)
			.select(".button-div")
			.attr("width", this.width)
			.attr("height", this.svg_height);
		d3.select(this.container)
			.select(".svg-div")
			.attr("width", this.width)
			.attr("height", this.button_height);
	}
  init_inputs = () => {
		for(let i = 0; i < this.table.length; i++) {
			d3.select(this.container)
				.select(".button-div")
				.append("button")
					.classed("indicatorbtn", true)
					.html(this.table[i].name)
					.on("click", (ev) => {
						this.activebtn = ev.target.innerHTML;
						this.init();
					});
		}
  }
	init_table = () => {
		const table = d3.select(this.container)
			.select(".svg-div")
			.append("table")
				.classed("table table-hover", true)
				.append("tbody");

		const first_row = table.append("tr");
		first_row.append("th")
						 .style("text-align", "center")
						 .attr("width", "25%")
						 .html("Nazwa wskaźnika");
		first_row.append("th")
						 .style("text-align", "center")
						 .attr("width", "40%")
						 .html("Aktualna wartość");
		first_row.append("th")
							.style("text-align", "center")
							.attr("width", "100%")
							.html("Slider");
		let data_index = 0;
		if(this.activebtn != undefined) {
			for(let i = 0; i < this.table.length; i++) {
				if(this.table[i].name == this.activebtn) {
					data_index = i;
					break;
				}
			}
		}
		const data_table = this.table[data_index].table;
		const rows = table.selectAll(".table-row")
										 .data(data_table)
										 .enter()
										 .filter(d => !isNaN(d.function(this.end_year + "_" + this.end_quarter)))
										 .append("tr")
										 	.classed("table-row", true);
		rows.append("td")
				.style("padding", "40px 10px 40px 10px")
				.style("text-align", "left")
				.html(d => d.name);
		rows.append("td")
				.style("padding", "40px 10px 40px 10px")
				.style("text-align", "center")
				.html(d => splitValue(parseFloat(d.function(this.end_year + "_" + this.end_quarter))) + d.suffix);
		const slider_divs = rows.append("td")
														.style("padding", "40px 10px 40px 10px")
														.append("div")
															.classed("row-slider-div", true);
		let slider_el = slider_divs.nodes();
		rows.each( (d,i) => {
			let max = parseFloat(this.historical_max(d["function"]));
			let min = parseFloat(this.historical_min(d["function"]));
			let median = parseFloat(this.historical_median(d["function"]));
			if(min != max && !isNaN(max) && !isNaN(min) && !isNaN(median)) {
				noUiSlider.create(slider_el[i], {
		      start: [median, parseFloat(d["function"](this.end_year + "_" + this.end_quarter))],
		      behaviour: 'unconstrained-tap',
					tooltips: [false, true],
					connect: [false, true, false],
					pips: {
		          mode: 'values',
		          values: [min, max],
		          density: 10,
							format: wNumb({
		            decimals: 2,
								suffix: d["suffix"]
	        		}),
							stepped: true
		      },
		      range: {
		          'min': min,
		          'max': max
		      }
				});
				let handles = d3.select(slider_el[i])
												.selectAll(".noUi-handle").nodes();
				d3.select(handles[0])
					.classed("handle-invisible", true);
				slider_el[i].noUiSlider.on("change", () => {
					slider_el[i].noUiSlider.set([median, parseFloat(d["function"](this.end_year + "_" + this.end_quarter))]);
				});
			}
		});
	}
	refresh = () => {
		this.update();
  }
}
