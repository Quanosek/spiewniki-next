import styles from "@styles/pages/search.module.scss";

export default async function Searching(
  book: string,
  input: string,
  results: HTMLElement
) {
  const map = await getJSON();
  const list = map.get(book);

  results.innerHTML = "";
  results.style.display = "flex";

  if (!input) {
    // show all hymns
    await list.forEach((hymn: { title: string }, index: string) =>
      listElements(results, hymn, index)
    );
  } else {
    // show filtered
    await list.forEach((hymn: { title: string }, index: string) => {
      if (textFormat(hymn.title).search(textFormat(input)) != -1)
        listElements(results, hymn, index);
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

  // delete last <hr />
  if (results.lastChild) results.lastChild.remove();
}

// generate maps of hymnbooks
async function getJSON() {
  const brzask = await fetch(`/json/brzask.json`).then((response) => {
    return response.json();
  });
  const cegielki = await fetch(`/json/cegielki.json`).then((response) => {
    return response.json();
  });
  const nowe = await fetch(`/json/nowe.json`).then((response) => {
    return response.json();
  });
  const epifania = await fetch(`/json/epifania.json`).then((response) => {
    return response.json();
  });
  const inne = await fetch(`/json/inne.json`).then((response) => {
    return response.json();
  });

  let map = new Map();
  map.set("all", brzask.concat(cegielki, nowe, epifania, inne));
  map.set("brzask", brzask);
  map.set("cegielki", cegielki);
  map.set("nowe", nowe);
  map.set("epifania", epifania);
  map.set("inne", inne);
  return map;
}

// create HTML elements
function listElements(
  results: HTMLElement,
  hymn: { title: string },
  index: string
) {
  const param = document.createElement("p");
  param.setAttribute("id", index);
  param.innerHTML = `${hymn.title}`;
  results.appendChild(param);
  results.appendChild(document.createElement("hr"));
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
