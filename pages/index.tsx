import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ReactElement } from "react";

import styles from "@/styles/pages/index.module.scss";

import bookNames from "@/scripts/bookNames";
import { menuLink, shareButton, randomButton } from "@/scripts/buttons";

import Menu from "@/components/menu";
import Navbar from "@/components/navbar";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Śpiewniki</title>
        <meta
          name="description"
          content="Oficjalna strona z zebranymi w jednym miejscu wszystkimi pieśniami. | Wszelkie prawa zastrzeżone &#169; 2023"
        />
      </Head>

      <Menu />

      <main>
        <div className={styles.mobileTitle}>
          <h1>Śpiewniki</h1>
        </div>

        <Link
          href={"/search"}
          className={styles.searchBox}
          onClick={() => localStorage.setItem("focusSearchBox", "true")}
        >
          <Image
            className="icon"
            alt="search"
            src="/icons/search.svg"
            width={25}
            height={25}
            draggable="false"
          />
          <p>Rozpocznij wyszukiwanie...</p>
        </Link>

        <div className={styles.container}>
          <div className={styles.hymnBooks}>
            {Books(["PBT", "UP", "N"])}

            <Link href={"/books"} className={styles.all}>
              <p>Lista wszystkich śpiewników</p>
            </Link>
          </div>

          <hr />

          <div className={styles.options}>
            <h2>Dostępne opcje:</h2>

            <button title="Otwórz losową pieśń [R]" onClick={randomButton}>
              <Image
                className="icon"
                alt="kostka"
                src="/icons/dice.svg"
                width={20}
                height={20}
              />
              <p>Wylosuj pieśń</p>
            </button>

            <button
              title="Przejdź do listy ulubionych pieśni [F]"
              onClick={() => menuLink("favorite")}
            >
              <Image
                className="icon"
                alt="gwiazdka"
                src="/icons/bookmark.svg"
                width={20}
                height={20}
              />
              <p>Zakładki</p>
            </button>

            <button
              title="Przejdź do ustawień aplikacji [S]"
              onClick={() => menuLink("settings")}
            >
              <Image
                className="icon"
                alt="trybik"
                src="/icons/settings.svg"
                width={20}
                height={20}
              />
              <p>Ustawienia</p>
            </button>

            <button title="Skopiuj link do aplikacji" onClick={shareButton}>
              <Image
                className="icon"
                alt="link"
                src="/icons/link.svg"
                width={20}
                height={20}
              />
              <p>Udostępnij</p>
            </button>

            <button
              title="Informacje od twórców strony [I]"
              onClick={() => menuLink("info")}
            >
              <Image
                className="icon"
                alt="info"
                src="/icons/info.svg"
                width={20}
                height={20}
              />
              <p>Informacje</p>
            </button>
          </div>
        </div>

        <div className={styles.tagsMenu}>
          <h2>Przeglądaj pieśni według słów kluczowych:</h2>

          {Tags([
            "Wieczerza Pańska",
            "Chrzest",
            "Pogrzeb",
            "Nabożeństwo świadectw i modlitw",
            "Nabożeństwo noworoczne",
          ])}

          {Tags([
            "Dla najmłodszych",
            "Radosne",
            "Szybkie",
            "Krótkie",
            "O poranku",
            "Na wieczór",
            "Spokojne",
            "Długie",
            "Smutne",
            "Z pokazywaniem",
            "Po hebrajsku",
            "Dla chóru",
            "Śpiewane na głosy",
          ])}
        </div>
      </main>

      <Navbar more={false} />
    </>
  );
}

// quick books selection
function Books(names: string[]) {
  const books: ReactElement[] = [];

  names.forEach((name) => {
    books.push(
      <Link
        href={{
          pathname: `/search`,
          query: { book: name },
        }}
        key={name}
      >
        <Image
          alt="okładka"
          src={`/covers/${name}.webp`}
          width={850}
          height={1200}
          priority={true}
        />
        <p>{bookNames(name)}</p>
      </Link>
    );
  });

  return <div className={styles.books}>{books}</div>;
}

// tag selection
function Tags(buttons: string[]) {
  const tags: ReactElement[] = [];

  buttons.forEach((name) => {
    tags.push(
      <Link
        href={{
          pathname: "/search",
          query: { tags: name },
        }}
        key={name}
      >
        <p>{name}</p>
      </Link>
    );
  });

  return <div className={styles.tagsCategory}>{tags}</div>;
}
