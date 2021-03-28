class Chart{
  _width = 0;
  _height = 0;
  _current_data_index = null;
  _current_stock_index = null;
  _data = [];
  stock_name = "";
  data_name = "";
  padding_vertical = 20;
  padding_horizontal = 100;
  chart_title = "";
  suffix = "";
  constructor(container, stock_name, data_name, suffix){
    this.container = container;
    this.stock_name = stock_name;
    this.chart_title = data_name;
    this.suffix = suffix;
    this.reset();
    this.#draw_inputs();
    this.#load_data();
  }
  #load_data = () => {
    this._current_stock_index = 1;
    this._current_data_index = d3.select(this.container)
                                .select(".chart-input")
                                .property("value");
    let stock = this.stock_name.toLowerCase();
    console.log(this._current_data_index);
    //wyszukiwanie indeksu spółki z bazy danych... do zrobienia
  	this._data = [{ id: 'd1', value: 0.03, date: '2016'},
                  { id: 'd2', value: 0.06, date: '2017'},
                  { id: 'd3', value: 0.10, date: '2018'},
                  { id: 'd4', value: 0.135, date: '2019'},
                  { id: 'd5', value: 0.1, date: '2020'}
    ];
    d3.json("getdata.php?data_index=" + String(this._current_data_index) + "&stock_index=" + String(this._current_stock_index)).then(function(d){
        let array = d;
        for(let i = 0; i < array.length; i++) {
    			let date = "20" + (10+i);
    			let push_object_data = {id: "d"+(i+1), date: date, value: array[i]};
    			this._data.push(push_object_data);
    	  }
    });
  }
  reset = () => {
    this.width = parseInt(this.container.clientWidth);
    this.height = parseInt(this.container.clientHeight)-50;
    this.heightpadding = this.height - this.padding_vertical;
    this.widthpadding = this.width - this.padding_horizontal;
    // Usunięcie starego wykresu
    const old_svg = d3.select(this.container)
                  .selectAll(".chart")
                  .remove();
    d3.select(this.container)
      .selectAll(".chart-input-field")
      .remove();
    // Dodanie nowego kontenera na wykres
    this.svg = d3.select(this.container)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .classed("chart",true);
  }
  #draw_inputs = () => {
    let html_code = `<option value="dywidenda">Dywidenda</option><option value="koszt_sprzedazy">Koszt sprzedaży</option>`;
    const fieldset = d3.select(this.container)
                      .append("fieldset")
                      .classed("chart-input-field", true);
    fieldset.append("select")
            .html(html_code)
            .on("blur", this.#load_data)
            .classed("chart-input", true);
  }
  #draw_title = () => {
    // Dodanie tytułu wykresu
    this.svg.append("text")
         .attr("x", (this.width / 2))
         .attr("y", this.padding_vertical/2 + this.padding_vertical)
         .attr("text-anchor", "middle")
         .attr("font-size", "20px")
         .text(this.chart_title);
  }
  #draw_chart = () => {
    // Ustawienie skali i domeny osi x
    const xScale = d3.scaleBand()
                    .range([0, this.width-this.padding_horizontal])
                    .padding(0.4)
                    .domain(this._data.map((dataPoint) => dataPoint.date));
    // Ustawienie skali i domeny osi y
    const yScale = d3.scaleLinear()
                    .domain([0,d3.max(this._data, d => d.value)*1.1]).nice()
                    .range([this.heightpadding,this.padding_vertical]);
    const g = this.svg.append("g")
                .attr("transform", "translate(" + this.padding_horizontal*(2/3) + ",0)");
    // Dodanie dolnej osi wykresu
    g.append("g")
      .classed("axis_bottom",true)
      .call(d3.axisBottom(xScale))
      .attr("transform","translate(0," + this.heightpadding + ")");
    // Dodanie lewej osi wykresu
    let suf = this.suffix;
    let min = d3.min(this._data, d => d.value);
    let max = d3.max(this._data, d => d.value);
    let domain = (max + min)/(min);
    g.append("g")
       .classed("axis_left",true)
       .call(d3.axisLeft(yScale).tickFormat(function(d){
           return d.toString() + suf;
       }).ticks(domain))
       .append("text")
       .attr("text-anchor", "end")
       .text("value");
    // Dodanie słupków wartości
    const bars = this.svg
        .selectAll('.bar')
        .data(this._data)
        .enter()
        .append('rect')
        .classed('bar',true)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('x', data => xScale(data.date)+this.padding_horizontal-this.padding_horizontal/3)
        .attr('y', data => yScale(0));
    // Animacja pojawiania się słupków z opóźnieniem
    this.svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", data => yScale(data.value) )
        .attr("height", data => this.height - yScale(data.value) - this.padding_vertical)
        .delay(function(d,i){return(i*200)});
  }
  refresh = () => {
    this.reset();
    this.#draw_inputs();
    this.#draw_chart();
    this.#draw_title();
  }
}
