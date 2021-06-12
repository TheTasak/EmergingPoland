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
      document.getElementById("description").innerHTML = stock.description;
      this.currency = d.waluta;
      let container_counter = 0;
      //stworzenie tablicy potrzebnych modułów spółki
      this._tables = [];
      if(d.kraje != null || d.regiony != null) {
        this._tables.push("mapa");
        if(d.kraje != null)
          this.map_types.push("getcountries");
        if(d.regiony != null)
          this.map_types.push("getregions");
      } else {
        container_counter++;
      }
      if(d.dane != null)
        this._tables.push("dane");
      if(d.akcje != null)
        this._tables.push("akcje");
      if(d.podzial_przychodow != null)
        this._tables.push("podzial_przychodow");
      if(d.podzial_sektorow != null)
        this._tables.push("podzial_sektorow");
      if(d.inne != null)
        this._tables.push("inne");
      if(d.miasta != null)
        this._tables.push("miasta");
      if(d.udzial != null)
        this._tables.push("udzial");
      if(d.inne_dane != null)
        this._tables.push("inne_dane");

      //tworzenie modułów na podstawie tablicy
      for(let i = 0; i < this._tables.length; i++){
        if(this._tables[i] == "dane") {
         this._modules.push(new BasicInfo(this._containers[container_counter], this.stock_name, this.end_report, this.language));
         this._modules.push(new Indicators(this._containers[container_counter+1], this.stock_name, this.start_year, this.end_report, this.language));
         this._modules.push(new Chart(this._containers[container_counter+2], this.stock_name, "dywidenda", "year", this.start_year, this.end_report, this.currency, this.language));
         this._modules.push(new Chart(this._containers[container_counter+3], this.stock_name, "koszt_sprzedazy", "quarter", this.start_year, this.end_report, this.currency, this.language));
         container_counter = container_counter + 4;
       } else if(this._tables[i] == "mapa") {
         this._modules.push(new WorldMap(this._containers[container_counter], this.stock_name, this.start_year, this.currency, this.language, this.map_types));
         container_counter++;
       } else if(this._tables[i] == "inne_dane") {
         this._modules.push(new CircleChart(this._containers[container_counter], this.stock_name, this.start_year, this.end_report, this.currency, this.language));
         container_counter++;
       } else if(this._tables[i] == "akcje") {
         this._modules.push(new PieChart(this._containers[container_counter], this.stock_name, this.start_year));
         container_counter++;
       } else if(this._tables[i] == "podzial_przychodow") {
         this._modules.push(new TreeChart(this._containers[container_counter], this.stock_name, this.start_year, this.currency, this.language));
         container_counter++;
       } else if(this._tables[i] == "udzial") {
         this._modules.push(new TreeChartUdzial(this._containers[container_counter], this.stock_name, this.start_year, this.end_report, this.currency, this.language));
         container_counter++;
       }
      }
      let array_begin = this._modules.length;
      if(d.kraje == null && d.regiony == null) {
        this._containers[0].classList.add("hidden-div");
        array_begin++;
      }
      for(let i = array_begin; i < this._containers.length; i++) {
        this._containers[i].classList.add("hidden-div");
      }
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
