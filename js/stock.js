class Stock{
  _tables = [];
  _containers = [];
  _modules = [];
  map_types = [];
  constructor(stock_name, container_tab, language){
    this.stock_name = stock_name.trim();
    this._containers = container_tab;
    this.language = language;
    this.#load_data();
  }
  #load_data = () => {
    d3.json("php/getstockdetails.php?stock_name=" + this.stock_name).then(d => {
      if(d == null)
        throw "undefined data";
      //zapisanie wczytanych danych do zmiennych
      this.start_year = d.rok;
      this.end_report = d.ostatnie_sprawozdanie;
      this.description = d.opis;
      document.getElementById("description").innerHTML = this.description;
      this.currency = d.waluta;

      if(d.dane != null) {
        let container1 = d3.select(this._containers[0])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new BasicInfo(con1_node, this.stock_name, this.end_report, this.language));
        let container2 = d3.select(this._containers[1])
                          .append("div")
                          .classed("tabledata-div", true);
        let con2_node = d3.select(container2.nodes()[0]).nodes()[0];
        this._modules.push(new DataTable(con2_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
        let container3 = d3.select(this._containers[1])
                          .append("div")
                          .classed("chart-div", true);
        let con3_node = d3.select(container3.nodes()[0]).nodes()[0];
        this._modules.push(new Chart(con3_node, this.stock_name, "zysk_netto", "year", this.start_year, this.end_report, this.currency, this.language));
        let container4 = d3.select(this._containers[1])
                          .append("div")
                          .classed("chart-div", true);
        let con4_node = d3.select(container4.nodes()[0]).nodes()[0];
        this._modules.push(new Chart(con4_node, this.stock_name, "koszt_sprzedazy", "quarter", this.start_year, this.end_report, this.currency, this.language));
        let container5 = d3.select(this._containers[2])
                          .append("div")
                          .classed("nolimit-div", true);
        let con5_node = d3.select(container5.nodes()[0]).nodes()[0];
        this._modules.push(new Indicators(con5_node, this.stock_name, this.start_year, this.end_report, this.language));
        let container6 = d3.select(this._containers[3])
                          .append("div")
                          .classed("chart-div", true);
        let con6_node = d3.select(container6.nodes()[0]).nodes()[0];
        this._modules.push(new DividendChart(con6_node, this.stock_name, this.currency, this.language));
        let container7 = d3.select(this._containers[3])
                          .append("div")
                          .classed("chart-div", true);
        let con7_node = d3.select(container7.nodes()[0]).nodes()[0];
        this._modules.push(new DividendTable(con7_node, this.stock_name, this.currency, this.language));
      }
      if(d.podzial_przychodow != null) {
        let container1 = d3.select(this._containers[5])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new TreeChart(con1_node, this.stock_name, this.start_year, this.currency, this.language));
      }
      if(d.podzial_sektorow != null) {
        let container1 = d3.select(this._containers[5])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new SectorChart(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.akcje != null) {
        let container1 = d3.select(this._containers[6])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new AkcjeChart(con1_node, this.stock_name, this.start_year));
      }
      if(d.udzial != null) {
        let container1 = d3.select(this._containers[7])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new TreeChartUdzial(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.inne_dane != null) {
        let container1 = d3.select(this._containers[7])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new CircleChart(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.kraje != null || d.regiony != null) {
        if(d.kraje != null)
          this.map_types.push("getcountries");
        if(d.regiony != null)
          this.map_types.push("getregions");
        let container1 = d3.select(this._containers[4])
                          .append("div")
                          .classed("map-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this._modules.push(new WorldMap(con1_node, this.stock_name, this.start_year, this.currency, this.language, this.map_types));
      }

      let buttons = document.getElementsByClassName("stockbtn");
      setTimeout(() => {
        for(let i = 1; i < buttons.length; i++) {
          let temp = document.getElementById(buttons[i].value);
          temp.classList.add("hidden-div");
        }
      }, 600);

    }).catch(error => {
      console.error(error);
    });
  }
  refresh = () => {
    for(let i = 0; i < this._modules.length; i++){
      this._modules[i].refresh();
    }
  }
}
