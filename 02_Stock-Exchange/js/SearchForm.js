import { createSpinner, getAllSymbols, removeSpinner } from "./helpers.js";

class SearchForm {
  constructor(element) {
    this.form = element;
    this.searchUrl =
      "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/search?query=";
    this.extraParams = "&limit=10&exchange=NASDAQ";
    this.companyUrl =
      "https://stock-exchange-dot-full-stack-course-services.ew.r.appspot.com/api/v3/company/profile/";
    this.input = document.createElement("input");
    this.button = document.createElement("button");
    this.inputGroup = document.createElement("div");
    this.callback;
    this.makeForm();
  }

  makeForm() {
    // style form div
    this.form.classList.add(
      "d-flex",
      "flex-column",
      "w-100",
      "align-items-center"
    );
    this.inputGroup.classList.add(
      "input-group",
      "mb-3",
      "w-75",
      "input-group-lg",
      "mb-4"
    );
    this.form.appendChild(this.inputGroup);
    // create input
    this.input.type = "text";
    this.input.id = "search-input";
    this.input.classList.add("form-control");
    this.input.placeholder = "Search for a company";
    this.input.ariaLabel = "Search for a company";
    // create button
    this.button.type = "button";
    this.button.id = "search-button";
    this.button.classList.add("btn", "btn-info", "text-white");
    this.button.innerText = "Search";
    // add them
    this.inputGroup.appendChild(this.input);
    this.inputGroup.appendChild(this.button);
  }

  onSearch(callback) {
    this.callback = callback;
    // check if query already exists
    this.checkParams();
    // add event listeners
    this.button.addEventListener("click", this.launchSearch(this.callback));
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.button.click();
      }
    });
    this.input.addEventListener("keyup", this.processChange);
  }

  processChange = this.debounce(() => this.launchSearch(this.callback));

  async search(query) {
    try {
      const response = await fetch(
        `${this.searchUrl}${query}${this.extraParams}`
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  async launchSearch(callback) {
    const spinner = createSpinner(this.form);
    const query = this.input.value;
    this.addParams(query);
    const data = await this.runSearch(query);
    if (data.length !== 0) callback(data, query);
    removeSpinner(spinner);
  }

  async fetchAllDetails(symbols) {
    let promises = [];
    for (const string of symbols) {
      promises.push(fetch(`${this.companyUrl}${string}`));
    }
    const responses = await Promise.all(promises);
    const allProfiles = await Promise.all(responses.map((res) => res.json()));
    let details = [];
    allProfiles.forEach((e) => {
      if (e.companyProfiles) {
        for (const item of e.companyProfiles) {
          details.push(item);
        }
      } else {
        details.push(e);
      }
    });
    return details;
  }

  checkQuery(query) {
    if (query === null || query.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  async runSearch(query) {
    if (!this.checkQuery(query)) return [];
    const list = await this.search(query);
    if (list.length === 0) return 0; // if no results from query, don't do the second fetch, return falsy value
    const data = await this.fetchAllDetails(getAllSymbols(list));
    return data;
  }

  addParams(query) {
    if (!this.checkQuery(query)) return [];
    // searchParams repeated here and in checkParams() TODO: Fix
    if ("URLSearchParams" in window) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("query", query);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.pushState(null, "", newRelativePathQuery);
    }
  }

  debounce(func, timeout = 500) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  async checkParams() {
    if ("URLSearchParams" in window) {
      const searchParams = new URLSearchParams(window.location.search);
      const query = searchParams.get("query");
      const data = await this.runSearch(query);
      this.callback(data, query);
    }
  }
}

export default SearchForm;
