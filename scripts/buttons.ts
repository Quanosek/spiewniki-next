import router from "next/router";
import axios from "axios";

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

export function favoriteButon(params: {
  title: string;
  book: string;
  id: number;
}) {
  let boolean = false;
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (
    favorites.some(
      (element: { title: string; book: string; id: number }) =>
        element.title === params.title &&
        element.book === params.book &&
        element.id === params.id
    )
  ) {
    favorites = favorites.filter(
      (element: { title: string; book: string; id: number }) =>
        element.title !== params.title ||
        element.book !== params.book ||
        element.id !== params.id
    );
  } else {
    boolean = true;
    favorites.push(params);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  return boolean;
}
