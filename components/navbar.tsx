import Image from "next/image";
import { useRouter } from "next/router";

import styles from "@styles/components/navbar.module.scss";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className={styles.navigation}>
      <button id="printButton" className="onlyOnHymn">
        <Image
          className="icon"
          alt="drukarka"
          src="/icons/printer.svg"
          width={30}
          height={30}
        />
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
        <Image
          className="icon"
          alt="trybik"
          src="/icons/settings.svg"
          width={30}
          height={30}
        />
        <p>Ustawienia</p>
      </button>

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
        <Image
          className="icon"
          alt="gwiazdka"
          src="/icons/star_empty.svg"
          width={30}
          height={30}
        />
        <p>Ulubione</p>
      </button>

      <button id="shareButton" className="onlyOnHymn">
        <Image
          className="icon"
          alt="link"
          src="/icons/link.svg"
          width={30}
          height={30}
        />
        <p>Udostępnij</p>
      </button>
    </div>
  );
}
