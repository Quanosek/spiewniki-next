import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, ReactElement } from "react";

import styles from "@/styles/pages/index.module.scss";

import bookNames from "@/scripts/bookNames";
import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

import Menu from "@/components/menu";
import MobileHeader from "@/components/mobileHeader";
import Navbar from "@/components/navbar";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    // handle keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case "/":
          router.push("/search");
          localStorage.setItem("focusSearchBox", "true");
          break;
        case "R":
          if (!router.query.menu) randomHymn(undefined);
          break;
        case "I":
          if (!router.query.menu) replaceLink("info");
          break;
      }
    };

    // keyboard events
    document.addEventListener("keyup", handleKeyPress);
    return () => document.removeEventListener("keyup", handleKeyPress);
  }, [router]);

  return (
    <>
      <Head>
        <title>Śpiewniki</title>
      </Head>

      <Menu />

      <main>
        <MobileHeader />

        <Link
          href={"/search"}
          title="Możesz również użyć [/] na klawiaturze, aby rozpocząć wyszukiwanie"
          className={styles.searchBox}
          onClick={() => localStorage.setItem("focusSearchBox", "true")}
        >
          <Image
            className="icon"
            alt="search icon"
            src="/icons/search.svg"
            width={25}
            height={25}
            draggable={false}
          />
          <p>Rozpocznij wyszukiwanie</p>
        </Link>

        <div className={styles.container}>
          <div className={styles.hymnBooks}>
            {Books(["PBT", "UP", "N"])}

            <Link href={"/books"} className={styles.all}>
              <p>Lista wszystkich śpiewników</p>
            </Link>
          </div>

          <div className={styles.options}>
            <button
              title="Otwórz losową pieśń [R]"
              onClick={() => randomHymn(undefined)}
            >
              <Image
                className="icon"
                alt="random"
                src="/icons/dice.svg"
                width={20}
                height={20}
              />
              <p>Wylosuj pieśń</p>
            </button>

            <button
              title="Pokaż listę ulubionych pieśni [F]"
              onClick={() => replaceLink("favorite")}
            >
              <Image
                className="icon"
                alt="list"
                src="/icons/list.svg"
                width={20}
                height={20}
              />
              <p>Lista ulubionych</p>
            </button>

            <button
              title="Pokaż ustawienia aplikacji [S]"
              onClick={() => replaceLink("settings")}
            >
              <Image
                className="icon"
                alt="settings"
                src="/icons/settings.svg"
                width={20}
                height={20}
              />
              <p>Ustawienia</p>
            </button>

            <button title="Skopiuj link do aplikacji" onClick={shareButton}>
              <Image
                className="icon"
                alt="share"
                src="/icons/link.svg"
                width={20}
                height={20}
              />
              <p>Udostępnij</p>
            </button>

            <button
              title="Informacje od twórców strony [I]"
              onClick={() => replaceLink("info")}
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
      </main>

      <Navbar setup={"home"} />
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
          pathname: "/search",
          query: { book: name },
        }}
        key={name}
      >
        <Image
          alt="cover"
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
