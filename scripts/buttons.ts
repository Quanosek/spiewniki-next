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
    navigator.share({
      title: "Śpiewniki",
      text: "Udostępnij śpiewniki!",
      url: router.asPath,
    });
  }
}

export function randomButton() {
  localStorage.removeItem("searchPage");

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

export function presentationButton() {
  // enable fullscreen
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen();

  const presentation = document.getElementById("presentation") as HTMLElement;

  if (presentation) {
    // show presentation
    presentation.style.display = "flex";
    document.documentElement.style.overflow = "hidden";

    // exit fullscreen
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        presentation.style.display = "";
        document.documentElement.style.overflowY = "";
      }
    });
  }
}
