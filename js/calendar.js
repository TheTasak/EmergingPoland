class Calendar{
  constructor(container){
    this.container = container;
    this.loadData();
  }
  loadData = () => {
    d3.json("php/getcalendardates.php").then(d => {
      this.data = d;
      console.log(this.data);
      this.init();
    });
  }
  init = () => {
    this.height = parseInt(this.container.clientHeight);
    const calendar_container = d3.select(this.container)
                                  .append("div")
                                  .attr("height", "600px")
                                  .classed("calendar", true);
    d3.select(this.container)
      .append("div")
      .classed("input-div", true)
      .append("input")
      .attr("type", "color")
      .attr("value", "#aaaaaa")
      .on("blur", (ev) => {
        this.color = ev.target.value;
      });
    d3.select(this.container)
      .select(".input-div")
      .append("input")
      .attr("type", "date")
      .attr("value", new Date().toLocaleDateString())
      .on("blur", (ev) => {
        this.new_date = ev.target.value;
      });
    d3.select(this.container)
      .select(".input-div")
      .append("input")
      .attr("type", "text")
      .on("blur", (ev) => {
        this.title = ev.target.value;
      });
    d3.select(this.container)
      .select(".input-div")
      .append("button")
      .html("Dodaj wydarzenie")
      .classed("stockbtn", true)
      .on("click", (ev) => {
        this.addDateByButton(this.title);
      });
    this.calendar = new FullCalendar.Calendar(calendar_container.nodes()[0], {
        initialView: 'dayGridMonth',
        contentHeight: this.height,
        weekNumberCalculation: "ISO",
        locale: "pl",
        dayMaxEvents: true,
        dateClick: (info) => {
          var title = prompt('Nazwa wydarzenia:');
          this.addDate(title, info.dateStr);
        },
        customButtons: {
          myCustomButton: {
            text: 'Wyślij do bazy',
            click: () => {
              this.saveData();
            }
          }
        },
        headerToolbar: {
          left: 'myCustomButton',
          center: 'title'
        }
    });
    this.data.forEach((item, i) => {
      this.addDate(item.name, item.date, item.color);
    });
    this.calendar.render();
  }
  saveData = () => {
    let obj = this.calendar.getEvents();
    let arr = [];
    if(obj.length <= 0) {
      return;
    }
    obj.forEach((item, i) => {
      arr.push({name: item.title, date: item.startStr, color: (item.backgroundColor != undefined ? this.color : "")});
    });
    d3.json("php/updatecalendardates.php?data=" + JSON.stringify(arr));
  }
  addDate = (title, date, color) => {
    if(title != undefined && date != undefined) {
      console.log(color != "");
      this.calendar.addEvent({
        title: title,
        start: date,
        color: (color != "" ? color : this.color),
        textColor: 'white'
      });
    }
  }
  addDateByButton = (title) => {
    if(this.new_date != undefined) {
      this.calendar.addEvent({
        title: title,
        start: this.new_date,
        color: this.color,
        textColor: 'white'
      });
    }
  }
}
