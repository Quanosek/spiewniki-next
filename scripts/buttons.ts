import router from "next/router";
import axios from "axios";

export function menuLink(name: string) {
  router.push(
    {
      query: { ...router.query, menu: name },
    },
    undefined,
    { shallow: true, scroll: false }
  );
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

export function randomHymn(book: string | string[] | undefined) {
  (async () => {
    axios
      .get(book ? `/api/xml?book=${book}` : "/api/xml")
      .then(({ data }) => {
        const random = Math.floor(
          Math.random() * (Math.floor(data.length) + 1)
        );

        router.push({
          pathname: "/hymn",
          query: {
            book: data[random].book,
            title: data[random].title,
          },
        });
      })
      .catch((err) => {
        console.error(err);
        router.push("/");
      });
  })();
}
