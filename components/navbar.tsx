import Image from "next/image";
import router from "next/router";

import styles from "@/styles/components/navbar.module.scss";

import { shareButton, menuLink, randomHymn } from "@/scripts/buttons";

export default function bottomNavbar(param: { setup: string }) {
  switch (param.setup) {
    case "home":
      return (
        <div className={styles.bottom}>
          <button onClick={() => menuLink("info")}>
            <Image
              className="icon"
              alt="info"
              src="/icons/info.svg"
              width={16}
              height={16}
            />
            <p>Informacje</p>
          </button>

          <button onClick={() => menuLink("settings")}>
            <Image
              className="icon"
              alt="trybik"
              src="/icons/settings.svg"
              width={16}
              height={16}
            />
            <p>Ustawienia</p>
          </button>

          <button onClick={() => randomHymn(undefined)}>
            <Image
              className="icon"
              alt="kostka"
              src="/icons/dice.svg"
              width={16}
              height={16}
            />
            <p>Wylosuj</p>
          </button>

          <button
            className="disabledTemporary"
            onClick={() => menuLink("favorite")}
          >
            <Image
              className="icon"
              alt="gwiazdka"
              src="/icons/bookmark.svg"
              width={16}
              height={16}
            />
            <p>Ulubione</p>
          </button>

          <button onClick={shareButton}>
            <Image
              className="icon"
              alt="link"
              src="/icons/link.svg"
              width={16}
              height={16}
            />
            <p>Udostępnij</p>
          </button>
        </div>
      );

    case "hymn":
      return (
        <div className={styles.bottom}>
          <button onClick={() => menuLink("settings")}>
            <Image
              className="icon"
              alt="trybik"
              src="/icons/settings.svg"
              width={16}
              height={16}
            />
            <p>Ustawienia</p>
          </button>

          <button
            className="disabledTemporary"
            onClick={() => menuLink("favorite")}
          >
            <Image
              className="icon"
              alt="gwiazdka"
              src="/icons/bookmark.svg"
              width={16}
              height={16}
            />
            <p>Ulubione</p>
          </button>

          <button
            id="randomButton"
            onClick={() => {
              randomHymn(router.query.book);
              localStorage.setItem("searchPage", router.query.book as string);
            }}
          >
            <Image
              className="icon"
              alt="kostka"
              src="/icons/dice.svg"
              width={16}
              height={16}
            />
            <p>Wylosuj</p>
          </button>

          <button onClick={() => router.push("/books")}>
            <Image
              className="icon"
              alt="drukarka"
              src="/icons/book.svg"
              width={16}
              height={16}
            />
            <p>Śpiewniki</p>
          </button>

          <button
            className="disabledTemporary"
            onClick={() => menuLink("favorite")}
          >
            <Image
              className="icon"
              alt="gwiazdka"
              src="/icons/document.svg"
              width={16}
              height={16}
            />
            <p>Pokaż PDF</p>
          </button>
        </div>
      );
  }
}
