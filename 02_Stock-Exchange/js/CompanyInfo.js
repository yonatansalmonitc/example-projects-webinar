import {
  checkIfImageExists,
  percentages,
  createSpinner,
  removeSpinner,
} from "./helpers.js";

class CompanyInfo {
  constructor(element, symbol) {
    this.section = element;
    this.symbol = symbol;
    this.companyUrl = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/${this.symbol}`;
    this.companyStockHist = `https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/historical-price-full/${this.symbol}?serietype=line`;
    this.spinner;
  }

  async load() {
    this.spinner = createSpinner(this.section);
    const details = await this.fetchDetails();
    this.displayDetails(details);
  }

  async fetchDetails() {
    try {
      const res = await fetch(this.companyUrl);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  async fetchHistory() {
    try {
      const res = await fetch(this.companyStockHist);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  displayDetails(details) {
    if (Object.keys(details).length === 0) return;
    this.section.classList.add(
      "d-flex",
      "flex-column",
      "bg-white",
      "shadow-sm",
      "container",
      "p-5",
      "w-75",
      "gap-3"
    );

    const companyLink = document.createElement("a");
    companyLink.href = details.profile.website;
    companyLink.classList.add(
      "d-flex",
      "align-items-end",
      "gap-3",
      "mb-3",
      "nav-link"
    );
    const logo = document.createElement("img");
    logo.classList.add("company-symbol");
    if (details.profile?.image) {
      checkIfImageExists(details.profile.image, (exists) => {
        if (exists) {
          logo.src = details.profile.image;
        } else {
          logo.src = "./img/no-logo.svg";
        }
      });
    } else {
      logo.src = "./img/no-logo.svg";
    }
    logo.alt = details.profile.companyName;
    const title = document.createElement("h1");
    title.innerText = details.profile.companyName;
    companyLink.appendChild(logo);
    companyLink.appendChild(title);

    const stockData = document.createElement("div");
    stockData.classList.add("d-flex", "flex-column", "align-items-end");
    const stockPrice = document.createElement("div");
    stockPrice.classList.add("text-end");
    stockPrice.innerHTML = `Stock price: $${details.profile.price}`;
    const stockChange = document.createElement("div");
    stockChange.innerHTML = percentages(details.profile.changesPercentage);
    stockData.appendChild(stockPrice);
    stockData.appendChild(stockChange);

    const top = document.createElement("div");
    top.classList.add(
      "d-flex",
      "justify-content-between",
      "w-100",
      "align-items-end"
    );
    top.appendChild(companyLink);
    top.appendChild(stockData);

    const description = document.createElement("div");
    description.classList.add("mt-3");
    description.innerText = details.profile.description;

    this.section.appendChild(top);
    this.section.appendChild(description);
  }

  async addChart() {
    const data = await this.fetchHistory();
    const historical = data.historical;
    // some companies have no stock history data (ex: ALOHA)
    if (!historical) {
      const stockHist = document.createElement("div");
      stockHist.classList.add("mt-4");
      stockHist.innerText = "No stock data found.";
      this.section.appendChild(stockHist);
      removeSpinner(this.spinner);
      return;
    }
    let labels = [];
    let prices = [];
    if (historical.length >= 3000) {
      // skip a bit for large datasets (like Apple stock)
      for (let i = 0; i < historical.length; i += 30) {
        labels.push(historical[i].date);
        prices.push(historical[i].close);
      }
    } else {
      historical.forEach((dp) => {
        labels.push(dp.date);
        prices.push(dp.close);
      });
    }
    const chartData = {
      labels: labels.reverse(),
      datasets: [
        {
          label: "Stock Price History",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: prices.reverse(),
        },
      ],
    };
    const config = {
      type: "line",
      data: chartData,
      options: { fill: true, pointRadius: 0 },
    };
    const stockHist = document.createElement("canvas");
    this.section.appendChild(stockHist);
    const stockHistoryChart = new Chart(stockHist, config);
    removeSpinner(this.spinner);
  }
}

export default CompanyInfo;
