class DataTable{
  pixels_per_column = 300;
  constructor(container, stock_name, start_year, end_year, currency, language){
    this.container = container;
    this.stock_name = stock_name;
    this.start_year = start_year;
    this.end_year = end_year.split("_")[0];
    this.end_quarter = end_year.split("_")[1];

    this.table_end = this.end_quarter == 4 ? this.end_year : this.end_year-1;
    this.table_start = (this.end_year - this.start_year > 4 ? this.end_year-4 : this.start_year);
    this.currency = currency;
    this.language = language;
    this.column_limit = -1;

    this.data_year = true;
    this.data_type = "rachunek";
  }
  load_data = () => {
  	d3.json("php/getdatatable.php?stock_name=" + this.stock_name + "&start_year=" + String(this.start_year) + "&end_year=" + String(this.end_year) + "&lang=" + this.language + "&type=" + this.data_type).then( (d) => {
      // Wyciąga z bazy kolumny z danymi
  		this._data = d;
      this.init();
  	});
  }
  init = () => {
    // Usunięcie starego wykresu
  	d3.select(this.container)
      .html("");
    d3.select(this.container)
      .append("div")
        .style("overflow-y", "auto")
        .classed("data-div", true);
    d3.select(this.container)
      .append("div")
        .classed("input-div", true);
    this.update();
    this.initInputs();
    this.initTable();
    this.refresh();
  }
  changeYear = (amount) => {
    const slider = this.container.getElementsByClassName("slider-div")[0];
    if(slider == undefined)
      return;
    this.table_start = parseInt(slider.noUiSlider.get()[0]);
    this.table_end = parseInt(slider.noUiSlider.get()[1]);
    this.init();
  }
  initInputs = () => {
    d3.select(this.container)
      .select(".input-div")
      .append("div")
        .classed("slider-div", true);
    const drag_slider = this.container.getElementsByClassName("slider-div")[0];
    if(this.data_year) {
      noUiSlider.create(drag_slider, {
        start: [this.table_start, this.table_end],
        step: 1,
        limit: 1,
        behaviour: 'drag-fixed',
        pips: {
            mode: 'values',
            values: [this.start_year, this.end_year],
            density: 100/(this.end_year-this.start_year-1),
            stepped: true
        },
        connect: true,
        range: {
            'min': parseInt(this.start_year),
            'max': (this.end_quarter == 4) ? this.end_year : this.end_year-1
        }
      });
    } else {
      noUiSlider.create(drag_slider, {
        start: [this.table_end-1, this.table_end],
        step: 1,
        limit: 2,
        behaviour: 'drag-fixed',
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
    drag_slider.noUiSlider.on("change", this.changeYear);
    d3.select(this.container)
      .select(".input-div")
      .append("button")
        .classed("chart-button", true)
        .attr("type", "button")
        .on("click", () => {this.data_year = !this.data_year; this.init();})
        .html( this.data_year == 1 ? "<b>Rok</b>/Kwartał" : "Rok/<b>Kwartał</b>");
    d3.select(this.container)
      .select(".input-div")
      .append("button")
        .classed("chart-button", true)
        .attr("type", "button")
        .on("click", () => {this.data_type = (this.data_type == "rachunek" ? "bilans" : "rachunek"); this.load_data();})
        .html(this.data_type == "rachunek" ? "<b>Rachunek</b>/Bilans" : "Rachunek/<b>Bilans</b>");
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.table_height = parseInt(this.container.clientHeight)*0.8;
    this.input_height = parseInt(this.container.clientHeight)*0.2
    d3.select(this.container)
      .select(".data-div")
      .attr("width", this.width)
      .attr("height", this.table_height);
    d3.select(this.container)
      .select(".input-div")
      .attr("width", this.width)
      .attr("height", this.input_height);
  }
  updateInputs = () => {
    let slider = this.container.getElementsByClassName("slider-div")[0];
    let column_limit = parseInt(this.width / this.pixels_per_column);
    slider.noUiSlider.updateOptions({
        limit: column_limit
    });
    console.log(this.column_limit + " " + column_limit);
    if(this.column_limit != column_limit) {
      if(column_limit > this.column_limit) {
        let start = this.table_start;
        let end = this.table_end;
        if(start-1 >= this.start_year)
          start -= 1;
        else if(end+1 <= this.end_year)
          end += 1;
        slider.noUiSlider.updateOptions({
            start: [start, end]
        });
      }
      this.column_limit = column_limit;
      this.changeYear();
    }
  }
  initTable = () => {
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
      for(let i = this.table_start; i <= this.table_end; i++) {
        rows.filter(d => d[i] == i && !isNaN(d[i]))
          .append("td")
            .style("text-align", "center")
            .style("font-weight", "bold")
            .html(d => parseInt(d[i]));
        rows.filter(d => d[i] != i && !isNaN(d[i]))
          .append("td")
          .style("text-align", "right")
          .html(d => splitValue(String(parseInt(d[i]))));
        rows.filter(d => isNaN(d[i]))
          .append("td")
          .style("text-align", "right")
          .html("Brak danych");
      }
      let percent = rows.append("td")
            .style("text-align", "right");
      percent.filter(d => d[this.table_end] != this.table_end)
            .html(d => parseFloat(d[this.table_end] / d[this.table_end-1]*100 - 100).toFixed(2) + " %");
      percent.filter(d => d[this.table_end] == this.table_end)
            .style("font-weight", "bold")
            .html(String(this.table_end) + "/" + (String(this.table_end-1)));

      percent.filter(d => parseFloat(d[this.table_end] / d[this.table_end-1]*100 - 100).toFixed(2) > 0 && d[this.table_end] != this.table_end)
            .style("color", "green");
      percent.filter(d => parseFloat(d[this.table_end] / d[this.table_end-1]*100 - 100).toFixed(2) < 0 && d[this.table_end] != this.table_end)
            .style("color", "red");
    } else {
      for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 4; j++) {
          let quarter = this.table_end-1+i + "_" + (j+1);
          if(this.table_end-1+i > this.end_year || (this.table_end-1+i == this.end_year && j+1 > this.end_quarter))
            continue;
          rows.filter(d => d[quarter] == quarter && d[quarter] != undefined)
            .append("td")
              .style("text-align", "center")
              .style("font-weight", "bold")
              .html(d => d[quarter]);
          rows.filter(d => d[quarter] != quarter && !isNaN(d[quarter]))
            .append("td")
            .style("text-align", "right")
            .html(d => splitValue(String(parseInt(d[quarter]))));
          rows.filter(d => d[quarter] != quarter && isNaN(d[quarter]))
            .append("td")
            .style("text-align", "right")
            .html("Brak danych");
        }
      }
    }
  }
  updateTable = () => {
    d3.select(".data-div")
      .attr("width", this.width)
      .attr("height", this.height);
  }
  refresh = () => {
    this.update();
    this.updateInputs();
  	this.updateTable();
  }
}
