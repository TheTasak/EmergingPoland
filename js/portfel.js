var reader = new FileReader();

function readFile() {
  const file = document.getElementById('filecontent').files[0];
  reader.addEventListener("load", parseFile, false);
  if(file) {
    reader.readAsText(file, 'ISO-8859-2');
  }
}
function parseFile() {
  const psv = d3.dsvFormat(";");
  const data = psv.parse(reader.result);
  let transactions = data.filter(d => d["tytuł operacji"] == "Rozliczenie transakcji kupna:");
  showTable(data);
  transactions.forEach((item, i) => {
    let splitStr = item["szczegóły"].split(" ");
    item.akcje = splitStr[0];
    item.ilosc = parseInt(splitStr[1]);
    item.cena = parseFloat(splitStr[3]);
    delete item["szczegóły"];
  });
  showTransactionTable(transactions);
  iterateTransactions(transactions);
}
function iterateTransactions(data) {
  let transakcje = document.getElementById("transakcje");
  let stocks = d3.map(data, d => d.akcje);
  stocks = stocks.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  let stocksCountArray = [];
  for(let i = 0; i < stocks.length; i++) {
    stocksCountArray.push({cena: 0, akcje: 0});
  }
  data.forEach((item, i) => {
    let pos = stocks.indexOf(item.akcje);
    stocksCountArray[pos].akcje += parseInt(item.ilosc);
    stocksCountArray[pos].cena += parseInt(item.ilosc)*parseFloat(item.cena);
  });
  stocksCountArray.forEach((item, i) => {
    item.cena = parseFloat(item.cena / item.akcje).toFixed(2);
  });
  let string = '<table class="table table-light table-striped"><tr><th scope="col">#</th><th scope="col">Spółka</th><th scope="col">Ilość</th><th scope="col">Średnia cena</th></tr>';
  for(let i = stocksCountArray.length-1; i >= 0; i--) {
    string += '<tr><td scope="row">' + (stocksCountArray.length-i) + '</td><td>' + stocks[i] + '</td><td>' + stocksCountArray[i].akcje + '</td><td>' + stocksCountArray[i].cena + '</td></tr>';
  }
  string += "</table>";
  transakcje.innerHTML += string;
}
function showTable(data) {
  let transakcje = document.getElementById("transakcje");
  let string = '<table class="table table-light table-striped"><tr><th scope="col">#</th><th scope="col">Data</th><th scope="col">Tytuł</th><th scope="col">Szczegóły</th><th scope="col">Kwota</th></tr>';
  for(let i = data.length-1; i >= 0; i--) {
    string += '<tr><td scope="row">' + (data.length-i) + '</td><td>' + data[i].data + '</td><td>' + data[i]["tytuł operacji"] + '</td><td>' + data[i]["szczegóły"] + '</td><td>' + data[i].kwota + '</td></tr>';
  }
  string += "</table>";
  transakcje.innerHTML += string;
}
function showTransactionTable(data) {
  let transakcje = document.getElementById("transakcje");
  let string = '<table class="table table-light table-striped"><tr><th scope="col">#</th><th scope="col">Data</th><th scope="col">Aktywo</th><th scope="col">Ilość</th><th scope="col">Cena</th><th scope="col">Kwota</th></tr>';
  for(let i = data.length-1; i >= 0; i--) {
    string += '<tr><td scope="row">' + (data.length-i) + '</td><td>' + data[i].data + '</td><td>' + data[i].akcje + '</td><td>' + data[i].ilosc + '</td><td>' + data[i].cena + '</td><td>' + data[i].kwota + '</td></tr>';
  }
  string += "</table>";
  transakcje.innerHTML += string;
}
