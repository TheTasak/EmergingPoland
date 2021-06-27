class Index{
  _containers = [];
  _modules = [];
  constructor(index_name, containers, language){
    this.index_name = index_name.trim();
    this._containers = containers;
    this.language = language;
    this.#load_data();
  }
  #load_data = () => {
     this._modules.push(new CapTreeChart(this._containers[0], this.index_name, this.language, "getstockscap.php", "Podział indeksu ze względu na kapitalizację spółek"));
     this._modules.push(new CapTreeChart(this._containers[1], this.index_name, this.language, "getindustrycap.php", "Podział indeksu ze względu na kapitalizację branż"));
     this._modules.push(new CapTreeChart(this._containers[2], this.index_name, this.language, "getstocksearn.php", "Podział indeksu ze względu na zyski spółek"));
     this._modules.push(new CapTreeChart(this._containers[3], this.index_name, this.language, "getindustryearn.php", "Podział indeksu ze względu na zyski branż"));
     let array_begin = this._modules.length;
     for(let i = array_begin; i < this._containers.length; i++) {
       this._containers[i].classList.add("hidden-div");
     }
  }
  refresh = () => {
    for(let i = 0; i < this._modules.length; i++){
      this._modules[i].refresh();
    }
  }
}
