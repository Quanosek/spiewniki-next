import Image from "next/image";
import router from "next/router";

import styles from "@/styles/components/navbar.module.scss";

import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

export default function bottomNavbar(param: { setup: string }) {
  return (
    <div className={styles.navbar}>
      {param.setup === "home" && (
        <>
          <button onClick={() => replaceLink("info")}>
            <Image
              className="icon"
              alt="info"
              src="/icons/info.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Informacje</p>
          </button>

          <button onClick={() => replaceLink("settings")}>
            <Image
              className="icon"
              alt="settings"
              src="/icons/settings.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Ustawienia</p>
          </button>

          <button onClick={() => randomHymn(undefined)}>
            <Image
              className="icon"
              alt="random"
              src="/icons/dice.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Wylosuj</p>
          </button>

          <button onClick={() => replaceLink("favorite")}>
            <Image
              className="icon"
              alt="list"
              src="/icons/list.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Ulubione</p>
          </button>

          <button onClick={shareButton}>
            <Image
              className="icon"
              alt="share"
              src="/icons/link.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Udostępnij</p>
          </button>
        </>
      )}

      {param.setup === "hymn" && (
        <>
          <button onClick={() => replaceLink("settings")}>
            <Image
              className="icon"
              alt="settings"
              src="/icons/settings.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Ustawienia</p>
          </button>

          <button onClick={() => replaceLink("favorite")}>
            <Image
              className="icon"
              alt="list"
              src="/icons/list.svg"
              width={16}
              height={16}
              draggable={false}
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
              alt="random"
              src="/icons/dice.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Wylosuj</p>
          </button>

          <button onClick={() => router.push("/books")}>
            <Image
              className="icon"
              alt="books"
              src="/icons/book.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Śpiewniki</p>
          </button>

          <button
            className="disabledTemporary"
            onClick={() => replaceLink("favorite")}
          >
            <Image
              className="icon"
              alt="document"
              src="/icons/document.svg"
              width={16}
              height={16}
              draggable={false}
            />
            <p>Pokaż nuty</p>
          </button>
        </>
      )}
    </div>
  );
}
