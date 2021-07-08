class DataTable{
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];

    this._table_end = parseInt(this.end_year);
    this._table_start = (this.start_year > this.end_year - 4 ? this.start_year : this.end_year - 4);
    this.currency = currency;
    this.language = language;

    this.data_year = true;
    this.#load_data();
  }
  #split_value = (value) => {
    let new_value = [];
    let rev_value = value.length % 3;
    let string = "";
    if(rev_value != 0) {
      new_value.push(value.substr(0, rev_value));
    }
    for(let i = 0 + rev_value; i < value.length; i += 3) {
      new_value.push(value.substr(i, 3));
    }
    for(let i = 0; i < new_value.length; i++) {
      string += new_value[i] + " ";
    }
    return string;
  }
  #get_suffix = () => {
    //Zwraca końcówkę danych na podstawie ilości zer na końcu
	  let max = d3.max(this._data, d => d.value);
	  if(max >= 1000000){
		  this._data.forEach((item) => item.value /= 1000000.0);
		  this.suffix = "mld";
	  } else if(max >= 1000){
		  this._data.forEach((item) => item.value /= 1000.0);
		  this.suffix = "mln";
	  } else if(this._current_data_index == "dywidenda") {
		  this.suffix = "";
	  } else {
		  this.suffix = "tys";
	  }
  }
  #load_data = () => {
  console.log("php/getdatatable.php?stock_name=" + this.stock_name + "&start_year=" + String(this.start_year) + "&end_year=" + String(this.end_year) + "&lang=" + this.language);
	let json_data = d3.json("php/getdatatable.php?stock_name=" + this.stock_name + "&start_year=" + String(this.start_year) + "&end_year=" + String(this.end_year) + "&lang=" + this.language).then( (d) => {
    // Wyciąga z bazy kolumny z danymi
		this._data = d;
		this.init();
	});

  }
  init = () => {
    // Usunięcie starego wykresu
  	d3.select(this.container)
  	  .selectAll(".data-div")
  	  .remove();
    d3.select(this.container)
  	  .selectAll(".input-div")
  	  .remove();
    d3.select(this.container)
      .append("div")
        .style("overflow-y", "auto")
        .classed("data-div", "true");
    d3.select(this.container)
      .append("div")
        .classed("input-div", "true");
    this.#update();
    this.#init_inputs();
    this.#init_table();
    this.refresh();
  }
  #change_year = (amount) => {
    const slider = d3.select(this.container).select(".slider-div").nodes()[0];
    if(slider == undefined)
      return;
    this._table_start = parseInt(slider.noUiSlider.get()[0]);
    this._table_end = parseInt(slider.noUiSlider.get()[1]);
    console.log(this.data_year);
    this.init();
  }
  #init_inputs = () => {
    d3.select(this.container)
      .select(".input-div")
      .append("div")
        .classed("slider-div", true);
    const drag_slider = this.container.getElementsByClassName("slider-div")[0];
    if(this.data_year) {
      noUiSlider.create(drag_slider, {
        start: [this._table_start, this._table_end],
        step: 1,
        limit: 4,
        behaviour: 'drag',
        pips: {
            mode: 'values',
            values: [this.start_year, this.end_year],
            density: 100/(this.end_year-this.start_year),
            stepped: true
        },
        connect: true,
        range: {
            'min': parseInt(this.start_year),
            'max': parseInt(this.end_year)
        }
      });
    } else {
      noUiSlider.create(drag_slider, {
        start: [this._table_end-1, this._table_end],
        step: 1,
        limit: 2,
        behaviour: 'drag',
        pips: {
            mode: 'values',
            values: [this.start_year, this.end_year],
            density: 100/(this.end_year-this.start_year),
            stepped: true
        },
        connect: true,
        range: {
            'min': parseInt(this.start_year),
            'max': parseInt(this.end_year)
        }
      });
    }
    drag_slider.noUiSlider.on("change", this.#change_year);
    d3.select(this.container)
      .select(".input-div")
      .append("button")
        .classed("chart-input", true)
        .attr("type", "button")
        .on("click", () => {this.data_year = !this.data_year; this.init();})
        .append("img")
          .attr("src", "table_icon.png");;
  }
  #update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.table_height = parseInt(this.container.clientHeight)*0.75;
    this.input_height = parseInt(this.container.clientHeight)*0.25
    d3.select(this.container)
      .select(".data-div")
      .attr("width", this.width)
      .attr("height", this.table_height);
    d3.select(this.container)
      .select(".input-div")
      .attr("width", this.width)
      .attr("height", this.input_height);
  }
  #init_table = () => {
    let rows = d3.select(this.container)
                  .select(".data-div")
                  .append("table")
                    .classed("data-table", true)
                    .attr("width", "100%")
                    .selectAll(".row")
                    .data(this._data)
                    .enter()
                    .append("tr");
	  rows.append("td")
      .style("font-weight", "bold")
      .html(d => d.translate);
    if(this.data_year) {
      for(let i = this._table_start; i < this._table_end; i++) {
        rows.filter(d => d[i] == i && !isNaN(d[i]))
          .append("td")
            .style("text-align", "center")
            .style("font-weight", "bold")
            .html(d => parseInt(d[i]));
        rows.filter(d => d[i] != i && !isNaN(d[i]))
          .append("td")
          .style("text-align", "right")
          .html(d => this.#split_value(String(parseInt(d[i]))));
        rows.filter(d => isNaN(d[i]))
          .append("td")
          .style("text-align", "right")
          .html("Brak danych");
      }
      let percent = rows.append("td")
            .style("text-align", "right")
            .filter(d => d[this._table_end-1] != this._table_end-1)
            .html(d => parseFloat(d[this._table_end-1] / d[this._table_end-2]*100 - 100).toFixed(2) + " %");
      percent.filter(d => parseFloat(d[this._table_end-1] / d[this._table_end-2]*100 - 100).toFixed(2) > 0)
            .style("color", "green");
      percent.filter(d => parseFloat(d[this._table_end-1] / d[this._table_end-2]*100 - 100).toFixed(2) < 0)
            .style("color", "red");
    } else {
      for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 4; j++) {
          let quarter = this._table_end-1+i + "_" + (j+1);
          rows.filter(d => d[quarter] == quarter && d[quarter] != undefined)
            .append("td")
              .style("text-align", "center")
              .style("font-weight", "bold")
              .html(d => d[quarter]);
          rows.filter(d => d[quarter] != quarter && !isNaN(d[quarter]))
            .append("td")
            .style("text-align", "right")
            .html(d => this.#split_value(String(parseInt(d[quarter]))));
        }
      }
    }
  }
  #update_table = () => {
    d3.select(".data-div")
      .attr("width", this.width)
      .attr("height", this.height);
  }
  refresh = () => {
    this.#update();
  	this.#update_table();
  }
}
