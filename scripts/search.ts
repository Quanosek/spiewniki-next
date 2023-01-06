import router from "next/router";

import styles from "@styles/pages/search.module.scss";

export default async function Search(
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
  const PBT = await fetch(`/json/brzask.json`).then((response) => {
    return response.json();
  });
  const C = await fetch(`/json/cegielki.json`).then((response) => {
    return response.json();
  });
  const N = await fetch(`/json/nowe.json`).then((response) => {
    return response.json();
  });
  const E = await fetch(`/json/epifania.json`).then((response) => {
    return response.json();
  });
  const I = await fetch(`/json/inne.json`).then((response) => {
    return response.json();
  });

  let map = new Map();
  map.set("W", PBT.concat(C, N, E, I));
  map.set("PBT", PBT);
  map.set("C", C);
  map.set("N", N);
  map.set("E", E);
  map.set("I", I);
  return map;
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
