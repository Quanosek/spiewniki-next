import router from "next/router";
import axios from "axios";

export function buttonLink(name: string) {
  router.push(
    {
      query: { ...router.query, menu: name },
    },
    undefined,
    { shallow: true, scroll: false }
  );
}

export function randomButton() {
  (async () => {
    const data = await axios.get(`/api/xml`).then(({ data }) => data);
    const random = Math.floor(Math.random() * (Math.floor(data.length) + 1));

    router.push({
      pathname: "/hymn",
      query: {
        book: data[random].book,
        title: data[random].title,
      },
    });
  })();
}
