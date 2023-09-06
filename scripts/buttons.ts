import router from "next/router";

import axios from "axios";

import bookShortcut, { bookList } from "@/scripts/bookShortcut";

export function replaceLink(name: string | undefined) {
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
    const all = bookList();
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
        hymns = hymns.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        );

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
    // default share screen
    navigator.share({
      title: "Śpiewniki",
      text: "Udostępnij śpiewniki!",
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
