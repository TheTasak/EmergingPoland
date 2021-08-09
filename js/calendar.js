class Calendar{
  constructor(container){
    this.container = container;
    this.loadData();
  }
  loadData = () => {
    d3.json("php/getcalendardates.php").then(d => {
      this.data = d;
      this.init();
    });
  }
  init = () => {
    this.height = parseInt(this.container.clientHeight);
    this.calendar = new FullCalendar.Calendar(this.container, {
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
      this.addDate(item.name, item.date);
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
      arr.push({name: item.title, date: item.startStr});
    });
    console.log(JSON.stringify(arr));
    d3.json("php/updatecalendardates.php?data=" + JSON.stringify(arr));
  }
  addDate = (title, date) => {
    if(title != undefined && date != undefined) {
      this.calendar.addEvent({
        title: title,
        start: date
      });
    }
  }
}
