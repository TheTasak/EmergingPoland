class Stock{
  _tables = [];
  _containers = [];
  _modules = [];
  constructor(stock_name, container_tab){
    this.stock_name = stock_name;
    this._containers = container_tab;
    this.#load_data();
  }
  #load_data = () => {
    d3.json("php/getstockdetails.php?stock_name=" + this.stock_name).then(d => {
      if(d == null)
        throw "undefined data";
      this.start_year = d.rok;
      this.suffix = d.waluta;
      this._tables = [];
      for(let i = 0; i < 5; i++){
        let table = d["tabela" + (i+1)];
        if(table == undefined)
          break;
        this._tables.push(table);
      }
      this._tables.push("akcje"); // tylko tymczasowe !!!!!
      let container_counter = 0;
      for(let i = 0; i < this._tables.length; i++){
        if(this._tables[i] == "dane"){
         this._modules.push(new Chart(this._containers[container_counter], this.stock_name, "przychody", this.start_year));
         this._modules.push(new Chart(this._containers[container_counter+1], this.stock_name, "koszt_sprzedazy", this.start_year));
         this._modules.push(new Chart(this._containers[container_counter+2], this.stock_name, "dywidenda", this.start_year));
         container_counter = container_counter + 3;
       } else if(this._tables[i] == "kraje"){
         this._modules.push(new WorldMap(this._containers[container_counter], this.stock_name, this.start_year));
         container_counter++;
       } else if(this._tables[i] == "podzial_przychodow"){
         this._modules.push(new TreeChart(this._containers[container_counter], this.stock_name, this.start_year));
         container_counter++;
       } else if(this._tables[i] == "akcje"){
         let piechart = new PieChart(this._containers[container_counter], this.stock_name, this.start_year);
         if(piechart.defined){
           this._modules.push(piechart);
           container_counter++;
         }
       }
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
