import { useRouter } from "next/router";

import styles from "@styles/components/navbar.module.scss";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className={styles.navigation}>
      <button id="printButton" className="onlyOnHymn">
        <img className="icon" alt="drukarka" src="/icons/printer.svg" />
        <p>Wydrukuj</p>
      </button>

      <button
        id="settingsButton"
        onClick={() => {
          router.push(
            {
              pathname: router.asPath,
              query: { menu: "settings" },
            },
            undefined,
            {
              scroll: false,
            }
          );
        }}
      >
        <img className="icon" alt="trybik" src="/icons/settings.svg" />
        <p>Ustawienia</p>
      </button>

      <button id="randomButton">
        <img className="icon" alt="kostka" src="/icons/dice.svg" />
        <p>Wylosuj</p>
      </button>

      <button
        id="favoriteButton"
        onClick={() => {
          router.push(
            {
              pathname: router.asPath,
              query: { menu: "favorite" },
            },
            undefined,
            {
              scroll: false,
            }
          );
        }}
      >
        <img className="icon" alt="gwiazdka" src="/icons/star_empty.svg" />
        <p>Ulubione</p>
      </button>

      <button id="shareButton" className="onlyOnHymn">
        <img className="icon" alt="link" src="/icons/link.svg" />
        <p>Udostępnij</p>
      </button>
    </div>
  );
}
