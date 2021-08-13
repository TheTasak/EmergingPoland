class Stock{
  containers = [];
  modules = [];
  map_types = [];
  constructor(stock_name, container_tab, language){
    this.stock_name = stock_name.trim();
    this.containers = container_tab;
    this.language = language;
    this.load_data();
  }
  load_data = () => {
    d3.json("php/getstockdetails.php?stock_name=" + this.stock_name).then(d => {
      if(d == null)
        throw "undefined data";
      //zapisanie wczytanych danych do zmiennych
      this.start_year = d.rok;
      this.end_report = d.ostatnie_sprawozdanie;
      this.description = d.opis;
      this.ticket = d.ticket;
      document.getElementById("description").innerHTML = this.description;
      this.currency = d.waluta;

      if(d.dane != null) {
        let container1 = d3.select(this.containers[0])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new BasicInfo(con1_node, this.stock_name, this.end_report, this.language));
        let container2 = d3.select(this.containers[1])
                          .append("div")
                          .classed("tabledata-div", true);
        let con2_node = d3.select(container2.nodes()[0]).nodes()[0];
        this.modules.push(new DataTable(con2_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
        let container3 = d3.select(this.containers[1])
                          .append("div")
                          .classed("chart-div", true);
        let con3_node = d3.select(container3.nodes()[0]).nodes()[0];
        this.modules.push(new Chart(con3_node, this.stock_name, "zysk_netto", "year", this.start_year, this.end_report, this.currency, this.language));
        let container4 = d3.select(this.containers[1])
                          .append("div")
                          .classed("chart-div", true);
        let con4_node = d3.select(container4.nodes()[0]).nodes()[0];
        this.modules.push(new Chart(con4_node, this.stock_name, "koszt_sprzedazy", "quarter", this.start_year, this.end_report, this.currency, this.language));
        let container5 = d3.select(this.containers[2])
                          .append("div")
                          .classed("nolimit-div", true);
        let con5_node = d3.select(container5.nodes()[0]).nodes()[0];
        this.modules.push(new Indicators(con5_node, this.stock_name, this.start_year, this.end_report, this.language));
        let container6 = d3.select(this.containers[3])
                          .append("div")
                          .classed("chart-div", true);
        let con6_node = d3.select(container6.nodes()[0]).nodes()[0];
        this.modules.push(new DividendChart(con6_node, this.stock_name, this.currency, this.language));
        let container7 = d3.select(this.containers[3])
                          .append("div")
                          .classed("chart-div", true);
        let con7_node = d3.select(container7.nodes()[0]).nodes()[0];
        this.modules.push(new DividendTable(con7_node, this.stock_name, this.currency, this.language));
        let container8 = d3.select(this.containers[0])
                          .append("div")
                          .classed("chart-div", true)
                          .attr("id", "tradingview_5a404");
        let widget = new TradingView.widget(
        {
          "autosize": true,
          "symbol": "GPW:" + this.ticket,
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "pl",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "withdateranges": true,
          "range": "12M",
          "save_image": false,
          "container_id": "tradingview_5a404"
        });
      }
      if(d.podzial_przychodow != null) {
        let container1 = d3.select(this.containers[5])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new TreeChart(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
        let container2 = d3.select(this.containers[5])
                          .append("div")
                          .classed("chart-div", true);
        let con2_node = d3.select(container2.nodes()[0]).nodes()[0];
        this.modules.push(new EarningsChart(con2_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.podzial_sektorow != null) {
        let container1 = d3.select(this.containers[5])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new SectorChart(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.akcje != null) {
        let container1 = d3.select(this.containers[6])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new AkcjeChart(con1_node, this.stock_name, this.start_year, this.end_report));
      }
      if(d.udzial != null) {
        let container1 = d3.select(this.containers[7])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new TreeChartUdzial(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.inne != null) {
        let container1 = d3.select(this.containers[7])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new InneChart(con1_node, this.stock_name, this.start_year, this.end_report, this.language));
      }
      if(d.inne_dane != null) {
        let container1 = d3.select(this.containers[7])
                          .append("div")
                          .classed("chart-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new CircleChart(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language));
      }
      if(d.kraje != null) {
        let container1 = d3.select(this.containers[4])
                          .append("div")
                          .classed("map-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new WorldMap(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language, "getcountries"));
      }
      if(d.regiony != null) {
        let container1 = d3.select(this.containers[4])
                          .append("div")
                          .classed("map-div", true);
        let con1_node = d3.select(container1.nodes()[0]).nodes()[0];
        this.modules.push(new WorldMap(con1_node, this.stock_name, this.start_year, this.end_report, this.currency, this.language, "getregions"));
      }
      let buttons = document.getElementsByClassName("stockbtn");
      for(let i = 1; i < buttons.length; i++) {
        let temp = document.getElementById(buttons[i].value);
        temp.classList.add("hidden-div");
      }
      this.load_layout();
    }).catch(error => {
      console.error(error);
    });
  }
  load_layout = () => {
    for(let i = 0; i < this.modules.length; i++){
      if(!this.modules[i].container.parentElement.classList.contains("hidden-div")) {
        this.modules[i].load_data();
      }
    }
  }
  refresh = () => {
    for(let i = 0; i < this.modules.length; i++){
      if(!this.modules[i].container.parentElement.classList.contains("hidden-div")) {
        this.modules[i].refresh();
      }
    }
  }
}
