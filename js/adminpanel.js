var panel;
var language;
window.onload = load_page;
function load_page() {
  let container = document.getElementById("panel");
  language = document.getElementById("language").value;
  if(language == undefined || language == "")
    language = "pl";
  panel = new AdminPanel(container, language);
}

class AdminPanel{
  constructor(container, language){
		this.container = container;
		this.language = language;
		this.load_data();
	}
  load_data = () => {
    d3.json("php/getallstocks.php").then( (d) => {
      this._data = d;
      this.init();
  	});
  }
  init = () => {
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
          				                .on("change", this.init)
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
          				                .on("change", this.init)
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
  }
  draw = () => {
    console.log("php/getdatatable.php?stock_name=" + this._data[this.current_index].stocks[this.current_stock].spolki + "&start_year=2020&end_year=2020&type=rachunek");
    d3.json("php/getdatatable.php?stock_name=" + this._data[this.current_index].stocks[this.current_stock].spolki + "&start_year=2020&end_year=2020&type=rachunek&lang=pl").then(d => {
      d3.select(this.container)
        .select(".panel-div")
        .append("p")
          .html(JSON.stringify(d))
          .style("word-wrap", "break-word");
    });
  }
}
