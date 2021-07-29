var panel;
var language;
window.onload = load_page;
window.onresize = refresh;
function load_page() {
  let container = document.getElementById("panel");
  language = document.getElementById("language").value;
  if(language == undefined || language == "")
    language = "pl";
  panel = new AdminPanel(container, language);
}
function refresh() {
  panel.refresh();
}

class AdminPanel{
  constructor(container, language){
		this.container = container;
		this.language = language;
    this._table_start = 2015;
    this._table_end = 2020;
    d3.json("php/getallstocks.php").then( (d) => {
      this._data = d;
      this.load_data();
  	});
	}
  update_select = () => {
    const select_list_index = this.container.getElementsByClassName("chart-input")[0];
    if(select_list_index != undefined)
      this.current_index = select_list_index.value;
    else
      this.current_index = 0;
    const select_list_stock = this.container.getElementsByClassName("chart-input")[1];
    if(select_list_stock != undefined)
      this.current_stock = select_list_stock.value;
    else
      this.current_stock = 0;
  }
  load_data = () => {
    this.update_select();
    d3.json("php/getdatatable.php?stock_name=" + this._data[this.current_index].stocks[this.current_stock].spolki + "&start_year=" + this._table_start + "&end_year=" + this._table_end + "&type=rachunek&lang=pl").then(d => {
      this._stock_data = d;
      this.init();
    });
  }
  init = () => {
    this.update_select();
    d3.select(this.container)
      .html("");
    d3.select(this.container)
      .append("div")
        .classed("panel-div", true);

    this.update();
    this.init_inputs();
    this.draw();
  }
  update = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight);
    d3.select(this.container)
      .select(".panel-div")
      .attr("width", this.width)
      .attr("height", this.height);
  }
  init_inputs = () => {
    const field_index = d3.select(this.container)
                             .select(".panel-div")
				                        .append("select")
          				                .on("change", this.load_data)
          				                .classed("chart-input", true);
    for(let i = 0; i < this._data.length; i++){
  		field_index.append("option")
  			         .attr("value", i)
  			         .text(this._data[i].index);
  	}
    const select_list_index = this.container.getElementsByClassName("chart-input")[0];
  	if(select_list_index != undefined){
  		select_list_index.value = this.current_index;
  	}
    const field_stock = d3.select(this.container)
                             .select(".panel-div")
				                        .append("select")
          				                .on("change", this.load_data)
          				                .classed("chart-input", true);
    for(let i = 0; i < this._data[this.current_index].stocks.length; i++){
  		field_stock.append("option")
  			         .attr("value", i)
  			         .text(this._data[this.current_index].stocks[i].spolki);
  	}
    const select_list_stock = this.container.getElementsByClassName("chart-input")[1];
  	if(select_list_stock != undefined && this.current_stock < select_list_stock.length){
  		select_list_stock.value = this.current_stock;
  	} else {
      this.current_stock = 0;
      select_list_stock.value = 0;
    }
    d3.select(this.container)
      .select(".panel-div")
      .append("button")
      .html("Wyślij")
      .on("click", this.send_to_database);
  }
  send_to_database = () => {
    let string = [];
    console.log(this._stock_data);
    for(let i = this._table_start; i <= this._table_end; i++) {
      string.push({
        "year": parseInt(i),
        "values": []
      });
    }
    for(let i = 1; i < this._stock_data.length; i++) {
      for(let j = this._table_start; j <= this._table_end; j++) {
        let input_value = document.getElementsByName(this._stock_data[i].name + j)[0].value;
        input_value = input_value.replace(/\s/g, '');
        console.log(input_value);
        string[j-this._table_start].values.push({
          "name": this._stock_data[i].name,
          "value": parseInt(input_value)
        });
      }
    }
    console.log("php/updatestockdata.php?stock_name=" + this._data[this.current_index].stocks[this.current_stock].spolki + "&data=" + JSON.stringify(string) + "&lang=" + this.language);
    d3.json("php/updatestockdata.php?stock_name=" + this._data[this.current_index].stocks[this.current_stock].spolki + "&data=" + JSON.stringify(string) + "&lang=" + this.language).then( d => {
      console.log(d);
    });
  }
  draw = () => {
    const rows = d3.select(this.container)
                    .select(".panel-div")
                    .append("table")
                      .classed("data-table", true)
                      .attr("width", "100%")
                      .selectAll(".row")
                      .data(this._stock_data)
                      .enter()
                      .append("tr");
    rows.append("td")
        .style("font-weight", "bold")
        .html(d => d.translate);
    for(let i = this._table_start; i <= this._table_end; i++) {
      rows.filter(d => d[i] == i && !isNaN(d[i]))
        .append("td")
          .style("text-align", "center")
          .style("font-weight", "bold")
          .html(d => parseInt(d[i]));
      const inputs = rows.filter(d => d[i] != i)
                          .append("td")
                          .append("input")
                          .attr("type", "text")
                          .attr("name", d => d.name + i)
                          .style("text-align", "right")
                          .attr("value", d => parseInt(d[i]).toLocaleString())
                          .on("blur", (ev) => {
                            let num = String(ev.target.value).replace(/\s/g, '');
                            ev.target.value = parseInt(num).toLocaleString();
                          });
    }
  }
  refresh = () => {

  }
}
