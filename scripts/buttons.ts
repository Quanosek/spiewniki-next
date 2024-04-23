import router from "next/router";

import axios from "axios";

import { bookShortcut, booksList } from "@/scripts/availableBooks";

export function openMenu(name: string | undefined) {
  const { menu, ...params } = router.query;

  if (name) {
    router.push({ query: { ...params, menu: name } }, undefined, {
      scroll: false,
      shallow: true,
    });
  } else {
    router.replace({ query: { ...params } }, undefined, {
      scroll: false,
      shallow: true,
    });
  }
}

export function randomHymn(book: string | undefined) {
  // get all hymns from all books
  if (!book) {
    // remove previous search
    localStorage.removeItem("prevSearch");

    const all = booksList();
    const Collector = new Array();

    all.forEach(async (book) => {
      Collector.push(
        await axios
          .get(`database/${bookShortcut(book)}.json`)
          .catch((err) => console.error(err))
      );

      if (Collector.length === all.length) {
        let hymns = new Array();

        Collector.map(({ data }) => hymns.push(...data));
        const random = Math.floor(Math.random() * (hymns.length + 1));

        router.push({
          pathname: "/hymn",
          query: {
            book: bookShortcut(hymns[random].book),
            title: hymns[random].name,
          },
        });
      }
    });

    // get all hymns from selected book
  } else {
    // restore book from searching
    const fromStorage = localStorage.getItem("prevSearch");
    if (fromStorage) {
      const json = JSON.parse(fromStorage);
      json.search = "";
      localStorage.setItem("prevSearch", JSON.stringify(json));
    }

    axios
      .get(`/database/${book}.json`)
      .then(({ data }) => {
        const random = Math.floor(Math.random() * (data.length + 1));

        router.push({
          pathname: "/hymn",
          query: {
            book: bookShortcut(data[random].book),
            title: data[random].name,
          },
        });
      })
      .catch((err) => console.error(err));
  }
}

export function shareButton() {
  if (navigator.share) {
    // share content
    navigator.share({
      text: `${router.query.title || "Śpiewniki"} `,
      url: router.asPath,
    });
  } else if (navigator.clipboard) {
    // copy to clipboard
    navigator.clipboard.writeText(location.href);
    alert("Skopiowano link do schowka!");
  } else {
    // error alert
    alert("Twoja przeglądarka nie obsługuje tej funkcji!");
  }
}
