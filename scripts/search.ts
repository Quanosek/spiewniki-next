import router from "next/router";

import styles from "@styles/pages/search.module.scss";

export async function Search(
  book: string,
  input: string,
  results: HTMLElement
) {
  const map = await getJSON();
  const list = map.get(book);

  results.innerHTML = ""; // reset HTML

  const searchIcon = document.getElementById("searchIcon") as HTMLElement;
  const clearIcon = document.getElementById("clearIcon") as HTMLElement;

  if (!input) {
    // replace icons
    searchIcon.style.display = "";
    clearIcon.style.display = "";

    // show all hymns
    list.forEach((hymn: { title: string }, index: number) =>
      listElements(book, results, hymn, index)
    );
  } else {
    // replace icons
    searchIcon.style.display = "none";
    clearIcon.style.display = "flex";

    // show filtered
    list.forEach((hymn: { title: string }, index: number) => {
      if (textFormat(hymn.title).search(textFormat(input)) != -1)
        listElements(book, results, hymn, index);
    });

    // no results
    if (!results.innerHTML) {
      const param = document.createElement("p");
      param.setAttribute("class", `${styles.noResults}`);
      param.innerHTML = `Brak wyników wyszukiwania.`;
      results.appendChild(param);
      results.appendChild(document.createElement("hr"));
    }
  }

  if (results.lastChild) results.lastChild.remove(); // delete last <hr />
  results.style.display = "flex"; // show search results
}

// generate maps of hymnbooks
async function getJSON() {
  const PBT = await fetch(`/json/PBT.json`).then((response) => response.json());
  const UP = await fetch(`/json/UP.json`).then((response) => response.json());
  const N = await fetch(`/json/N.json`).then((response) => response.json());
  const E = await fetch(`/json/E.json`).then((response) => response.json());
  const I = await fetch(`/json/I.json`).then((response) => response.json());

  let allHymns = new Map();
  allHymns.set("W", PBT.concat(UP, N, E, I));
  allHymns.set("PBT", PBT);
  allHymns.set("UP", UP);
  allHymns.set("N", N);
  allHymns.set("E", E);
  allHymns.set("I", I);

  return allHymns;
}

// create HTML elements
function listElements(
  book: string,
  results: HTMLElement,
  hymn: { title: string },
  index: number
) {
  const param = document.createElement("p");
  param.setAttribute("id", index.toString());
  param.innerHTML = `${hymn.title}`;
  results.appendChild(param);
  results.appendChild(document.createElement("hr"));

  param.addEventListener("click", async () => {
    router.push(`/${book}/${hymn.title}`);
  });
}

// formatting text
function textFormat(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ą", "a")
    .replaceAll("ć", "c")
    .replaceAll("ę", "e")
    .replaceAll("ł", "l")
    .replaceAll("ń", "n")
    .replaceAll("ó", "o")
    .replaceAll("ś", "s")
    .replaceAll("ż", "z")
    .replaceAll("ź", "z")
    .replace(/[^\w\s]/gi, "");
}

// friendly names
export function hymnBookNames(short: string) {
  switch (short) {
    case "W":
      short = "Wszystkie śpiewniki";
      break;
    case "PBT":
      short = "Pieśni Brzasku Tysiąclecia";
      break;
    case "UP":
      short = "Uwielbiajmy Pana (Cegiełki)";
      break;
    case "N":
      short = "Śpiewajcie Panu Pieśń Nową";
      break;
    case "E":
      short = "Śpiewniczek Młodzieżowy Epifanii";
      break;
    case "I":
      short = "Inne pieśni";
      break;
  }

  return short;
}

export default null;
