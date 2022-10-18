import { percentages, checkIfImageExists } from "./helpers.js";

class SearchResult {
  constructor(element) {
    this.results = element;
    this.callback;
    this.compare;
  }

  // create results list item
  parseResults(item) {
    const listItem = document.createElement("div");
    listItem.classList.add(
      "list-group-item",
      "list-group-item-action",
      "d-flex",
      "justify-content-between"
    );
    const result = document.createElement("a");
    result.classList.add(
      "d-inline-flex",
      "gap-3",
      "align-items-center",
      "nav-link"
    );
    result.href = `/company.html?symbol=${item.symbol}`;
    const logo = document.createElement("img");
    if (item.profile?.image) {
      checkIfImageExists(item.profile.image, (exists) => {
        if (exists) {
          logo.src = item.profile.image;
        } else {
          logo.src = "./img/no-logo.svg";
        }
      });
    } else {
      logo.src = "./img/no-logo.svg";
    }
    const company = document.createElement("span");
    company.innerHTML = ` <span class="result-text">${item.profile.companyName}</span> <span class="text-info result-text">(${item.symbol})</span>`;
    const percentage = document.createElement("span");
    percentage.innerHTML = percentages(item.profile.changesPercentage);
    result.appendChild(logo);
    result.appendChild(company);
    result.appendChild(percentage);
    this.compare = document.createElement("button");
    this.compare.classList.add("btn", "btn-info", "text-white");
    this.compare.innerText = "Compare";
    listItem.appendChild(result);
    listItem.appendChild(this.compare);
    return listItem;
  }

  // append search results to the list
  async renderResults(data, query) {
    this.results.classList.add(
      "d-flex",
      "flex-column",
      "align-items-center",
      "p-5",
      "w-100"
    );
    const list = document.createElement("div");
    list.classList.add("list-group", "list-group-flush", "w-100");
    list.id = "results-list";
    results.innerHTML = "";
    this.results.appendChild(list);
    if (!data) {
      list.classList.add("text-center");
      list.innerText = "No results to display. Run another search!";
      return;
    }
    for (const item of data) {
      if (Object.keys(item).length !== 0) {
        list.appendChild(this.parseResults(item));
        this.compare.addEventListener("click", () => {
          this.callback(item);
        });
      }
    }
    this.highlight(query);
  }

  highlight(query) {
    const items = document.querySelectorAll(".result-text");
    for (const item of items) {
      item.innerHTML = item.innerHTML.replace(
        new RegExp(query, "gi"),
        (str) => `<span class="bg-warning text-black">${str}</span>`
      );
    }
  }

  onLoad(callback) {
    this.callback = callback;
  }
}

export default SearchResult;
