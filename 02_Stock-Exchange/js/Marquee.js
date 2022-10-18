class Marquee {
  constructor(marquee) {
    this.marquee = marquee;
    this.url =
      "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/quotes/nasdaq";
  }

  async getData() {
    try {
      const response = await fetch(this.url);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  buildTicker(data) {
    this.marquee.classList.add(
      "d-flex",
      "flex-nowrap",
      "bg-white",
      "w-100",
      "p-2",
      "overflow-hidden",
      "shadow-sm",
      "gap-3"
    );
    const ticker = document.createElement("div");
    ticker.classList.add("d-flex", "flex-nowrap", "gap-3");

    for (let i = 0; i < 300; i++) {
      // no need to get more items than this, really

      const unit = document.createElement("span");
      unit.classList.add("d-flex", "gap-2", "flex-nowrap");
      const symbol = document.createElement("span");
      symbol.classList.add("symbol", "text-nowrap");
      symbol.innerText = `${data[i].symbol}:`;
      const price = document.createElement("span");
      price.classList.add("price", "text-info");
      price.innerText = `$${data[i].price}`;
      unit.appendChild(symbol);
      unit.appendChild(price);
      ticker.appendChild(unit);
    }
    this.marquee.appendChild(ticker);
  }

  async load() {
    const data = await this.getData();
    this.buildTicker(data);
  }
}
