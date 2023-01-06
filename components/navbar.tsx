import Image from "next/image";
import router from "next/router";

import styles from "@styles/components/navbar.module.scss";

export default function Navbar() {
  return (
    <div className={styles.navigation}>
      {NavButton(
        "printButton",
        { link: false, param: "onlyOnHymn" },
        "drukarka",
        "/icons/printer.svg",
        "Wydrukuj"
      )}

      {NavButton(
        "settingsButton",
        { link: true, param: "settings" },
        "trybik",
        "/icons/settings.svg",
        "Ustawienia"
      )}

      <button id="randomButton">
        <Image
          className="icon"
          alt="kostka"
          src="/icons/dice.svg"
          width={30}
          height={30}
        />
        <p>Wylosuj</p>
      </button>

      {NavButton(
        "favoriteButton",
        { link: true, param: "favorite" },
        "gwiazdka",
        "/icons/star_empty.svg",
        "Ulubione"
      )}

      {NavButton(
        "shareButton",
        { link: false, param: "onlyOnHymn" },
        "link",
        "/icons/link.svg",
        "Udostępnij"
      )}
    </div>
  );
}

function NavButton(
  id: string,
  condition: { link: boolean; param: string },
  alt: string,
  src: string,
  name: string
) {
  const { link, param } = condition;

  return (
    <button
      id={id}
      className={link ? "" : param}
      onClick={() => {
        if (link) {
          router.push(
            {
              pathname: router.asPath,
              query: { menu: `${param}` },
            },
            undefined,
            {
              scroll: false,
            }
          );
        }
      }}
    >
      <Image className="icon" alt={alt} src={src} width={30} height={30} />
      <p>{name}</p>
    </button>
  );
}
