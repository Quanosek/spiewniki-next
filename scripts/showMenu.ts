import { ParsedUrlQuery } from "querystring";

export default function showMenu(query: ParsedUrlQuery) {
  const menuDiv = document.getElementById("menu") as HTMLElement;

  if (query.menu) {
    const TopScroll = window.pageYOffset || document.documentElement.scrollTop;
    const LeftScroll =
      window.pageXOffset || document.documentElement.scrollLeft;

    window.onscroll = () => window.scrollTo(LeftScroll, TopScroll);
    menuDiv.style.visibility = "visible";
    menuDiv.style.opacity = "1";
  } else {
    window.onscroll = () => {};
    menuDiv.style.visibility = "";
    menuDiv.style.opacity = "";
  }
}
