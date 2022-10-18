import { backLink, createSpinner, removeSpinner } from "./helpers.js";
import CompanyInfo from "./CompanyInfo.js";

class CompareStocks {
  constructor(element, symbols) {
    this.element = element;
    this.symbols = symbols;
    this.spinner;
  }

  load() {
    this.element.classList.add("d-grid", "gap-3");
    const symbolsArr = this.symbols.split(",");
    const title = document.createElement("h1");
    title.innerText = `Comparing ${symbolsArr.length} companies:`;
    backLink(this.element);
    this.element.appendChild(title);
    this.spinner = createSpinner(this.element);
    this.callCompanyCards(symbolsArr);
  }

  async callCompanyCards(symbols) {
    let columns;
    if (symbols.length <= 3) {
      columns = symbols.length;
    } else if (symbols.length === 4) {
      columns = 2;
    } else {
      columns = 3;
    }
    // trying to organise into a nice grid
    for (let i = 0; i < symbols.length; i += columns) {
      const row = document.createElement("div");
      row.classList.add("row", "d-flex", "gap-3");
      let lastInRow =
        i + columns < symbols.length ? i + columns : symbols.length;
      for (let j = i; j < lastInRow; j++) {
        const card = document.createElement("div");
        card.classList.add("col");
        const info = new CompanyInfo(card, symbols[j]);
        await info.load();
        await info.addChart();
        row.appendChild(card);
      }
      this.element.appendChild(row);
    }
    removeSpinner(this.spinner);
  }
}

export default CompareStocks;
