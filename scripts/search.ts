import axios from "axios";
import router from "next/router";

import styles from "@styles/pages/search.module.scss";

export default async function Search(book: string, input: string) {
  // change icons
  const searchIcon = document.getElementById("searchIcon") as HTMLElement;
  const clearIcon = document.getElementById("clearIcon") as HTMLElement;

  if (!input) {
    searchIcon.style.display = "";
    clearIcon.style.display = "";
  } else {
    searchIcon.style.display = "none";
    clearIcon.style.display = "flex";
  }

  // read books
  let path;
  if (book === "all") path = `/api/xml`;
  else path = `/api/xml?book=${book}`;

  const list = await axios.get(path).then(({ data }) => data.results);

  // create results
  let titlesCollector = new Array();
  let lyricsCollector = new Array();

  list.map((hymn: { book: string; title: string; lyrics: string[] }) => {
    if (textFormat(hymn.title).includes(textFormat(input))) {
      // title found
      titlesCollector.push({
        book: hymn.book,
        title: hymn.title,
      });
    } else {
      // lyrics found
      hymn.lyrics.map((verses: any) => {
        verses.map((lines: string, index: number) => {
          if (textFormat(lines).includes(textFormat(input))) {
            lyricsCollector.push({
              book: hymn.book,
              title: hymn.title,
              lyrics: [
                verses[index - 2] ? "..." : "",
                verses[index - 1],
                verses[index],
                verses[index + 1],
                verses[index + 2] ? "..." : "",
              ],
            });
          }
        });
      });
    }
  });

  // merge Collectors
  let Collector = [...titlesCollector, ...lyricsCollector];
  Collector = Collector.filter((value, index, self) => {
    return index === self.findIndex((x) => x.title === value.title);
  });

  const titles = Collector.map((i) => i.title);
  Collector = Collector.filter(
    ({ id }, index) => !titles.includes(id, index + 1)
  );

  // reset results div
  const results = document.getElementById("results") as HTMLElement;
  results.innerHTML = "";

  // no results
  if (!Collector[0]) {
    const paragraph = document.createElement("p");
    paragraph.setAttribute("class", `${styles.noResults}`);
    paragraph.innerHTML = `Brak wyników wyszukiwania`;
    results.appendChild(paragraph);
    results.appendChild(document.createElement("hr"));
  }

  // display results
  Collector.forEach(
    (hymn: { book: string; title: string; lyrics: string[] }) => {
      const link = document.createElement("a");
      link.setAttribute("href", `/hymn?book=${hymn.book}&title=${hymn.title}`);

      const title = document.createElement("h2");
      title.innerHTML = `${hymn.title}`;
      link.appendChild(title);

      if (hymn.lyrics && input) {
        const lyrics = document.createElement("p");
        hymn.lyrics.forEach((line: string) => {
          if (line) lyrics.innerHTML += line;
        });
        link.appendChild(lyrics);
      }

      results.appendChild(link);
      results.appendChild(document.createElement("hr"));
    }
  );

  results.lastChild?.remove(); // always remove last <hr/>

  // easter-egg
  if (input === "2137") {
    router.push(
      `/hymn?book=UP&title=7C. Pan kiedyś stanął nad brzegiem (Barka)`
    );
  }
}

// change text to searching-friendly format
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
