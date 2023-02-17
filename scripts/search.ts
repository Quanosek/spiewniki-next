import axios from "axios";

import router from "next/router";

import styles from "@styles/pages/search.module.scss";

export default async function Search(
  book: string,
  input: string,
  results: HTMLElement
) {
  let path, list;
  if (book === "all") path = `/api/xml/`;
  else path = `/api/xml?book=${book}/`;

  list = await axios.get(path).then(async ({ data }) => {
    return data.results;
  });

  results.innerHTML = "";

  const searchIcon = document.getElementById("searchIcon") as HTMLElement;
  const clearIcon = document.getElementById("clearIcon") as HTMLElement;

  if (!input) {
    searchIcon.style.display = "";
    clearIcon.style.display = "";

    list.forEach((hymn: any) => listElements(results, hymn));
  } else {
    searchIcon.style.display = "none";
    clearIcon.style.display = "flex";

    list.forEach((hymn: any) => {
      if (
        textFormat(hymn.title).search(textFormat(input)) >= 0
        // textFormat(hymn.lyrics).search(textFormat(input)) > 0
      )
        listElements(results, hymn);
    });

    if (!results.innerHTML) {
      const param = document.createElement("p");
      param.setAttribute("class", `${styles.noResults}`);
      param.innerHTML = `Brak wyników wyszukiwania.`;
      results.appendChild(param);
      results.appendChild(document.createElement("hr"));
    }
  }

  if (results.lastChild) results.lastChild.remove();
  results.style.display = "flex";
}

function listElements(
  results: HTMLElement,
  hymn: { book: string; title: string }
) {
  const param = document.createElement("p");
  param.innerHTML = `${hymn.title}`;
  results.appendChild(param);
  results.appendChild(document.createElement("hr"));

  param.addEventListener("click", async () => {
    router.push(`/hymn?book=${hymn.book}&title=${hymn.title}/`);
  });
}

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
