export function checkIfImageExists(url, callback) {
  const img = new Image();
  img.src = url;
  if (img.complete) {
    callback(true);
  } else {
    img.onload = () => {
      callback(true);
    };

    img.onerror = () => {
      callback(false);
    };
  }
}

export function percentages(per) {
  let change = +per;
  // some companies (symbol: ALOHA, for example) have no stock changes
  if (isNaN(change)) {
    change = 0;
  }
  change = Math.round((change + Number.EPSILON) * 100) / 100;
  if (change > 0) {
    return `<span class="green">(+${change}%)</span>`;
  } else {
    return `<span class="red">(${change}%)</span>`;
  }
}

function chunkSymbols(symbols) {
  let chunks = [];
  let arr = symbols;
  while (arr.length > 0) {
    const chunk = arr.splice(0, 3); // set to chunks of 3 due to API limit
    chunks.push(chunk);
  }
  for (const piece of chunks) {
    piece.join(",");
  }
  return chunks;
}

export function getAllSymbols(data) {
  let symbols = [];
  data.forEach((e) => symbols.push(e.symbol));
  const chunks = chunkSymbols(symbols);
  return chunks;
}

export function backLink(element) {
  const linkBack = document.createElement("div");
  linkBack.classList.add("align-self-start", "display-6", "nav-link");
  linkBack.innerText = "⟵";
  linkBack.role = "button";
  linkBack.addEventListener("click", () => {
    history.back();
  });
  element.appendChild(linkBack);
}

export function createSpinner(element) {
  const spinner = document.createElement("div");
  spinner.classList.add("spinner-grow", "text-info", "spinner");
  spinner.role = "status";
  spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
  element.appendChild(spinner);
  return spinner;
}

export function removeSpinner(spinner) {
  if (spinner) spinner.remove();
}
