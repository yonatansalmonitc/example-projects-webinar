class CompSpace {
  constructor(element) {
    this.element = element;
    this.symbol;
    this.symbolsArr = [];
    this.compare;
    this.compButtons;
  }

  getSymbol(company) {
    this.symbol = company.symbol;
    if (this.symbolsArr.length === 0) this.showUp();
    this.addItem(this.symbol);
  }

  makeButton(symbol) {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-info", "text-white");
    button.ariaLabel = "Remove company";
    button.innerText = `${symbol} X`;
    button.addEventListener("click", (e) => {
      this.removeItem(e, symbol);
    });
    return button;
  }

  showUp() {
    // show compspace div
    this.element.classList.remove("d-none");
    // make div for buttons
    this.compButtons = document.createElement("div");
    this.compButtons.classList.add("d-flex", "gap-3");
    this.element.appendChild(this.compButtons);
    // make comparison button
    this.compare = document.createElement("a");
    this.compare.classList.add("btn", "btn-warning");
    this.refresh();
    this.element.appendChild(this.compare);
  }

  addItem(symbol) {
    if (this.symbolsArr.includes(symbol)) {
      return;
    }
    this.symbolsArr.push(symbol);
    const button = this.makeButton(symbol);
    // append the button to the compspace div
    this.compButtons.appendChild(button);
    // increase X in "Compare X items" in compare button
    this.refresh();
  }

  removeItem(e, symbol) {
    // remove the symbol from the list
    this.symbolsArr = this.symbolsArr.filter((elem) => elem !== symbol);
    // delete the button
    e.target.parentNode.removeChild(e.target);
    // decrease X in "Compare X items" in compare button
    this.refresh();
    // if no more symbols, remove div
    if (this.symbolsArr.length === 0) {
      this.element.classList.add("d-none");
      this.element.innerHTML = "";
    }
  }

  refresh() {
    this.compare.innerText = `Compare ${this.symbolsArr.length} companies`;
    this.compare.href = `./compare.html?symbols=${this.symbolsArr.join(",")}`;
  }
}
