import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, ReactElement } from "react";

import styles from "@/styles/pages/index.module.scss";

import bookShortcut, { pdfBooks } from "@/scripts/bookShortcut";
import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

import { Navbar, Footer, MobileHeader } from "@/components/elements";
import Menu from "@/components/menu";

export default function IndexPage() {
  const router = useRouter();

  // keyboard shortcuts
  useEffect(() => {
    if (!router.isReady) return;

    const KeyupEvent = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        router.query.menu
      ) {
        return;
      }

      switch (event.key.toUpperCase()) {
        case "/":
          localStorage.setItem("focusSearchBox", "true");
          router.push("/search");
          break;
        case "R":
          if (!router.query.menu) randomHymn(undefined);
          break;
      }
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
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
          title="Możesz również użyć [/] na klawiaturze, aby rozpocząć wyszukiwanie."
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
            {Books(["B", "C", "N"])}

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
              onClick={() => replaceLink("favorites")}
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
          </div>
        </div>
      </main>

      <div className={styles.footer}>
        <Footer />
      </div>

      <Navbar />
    </>
  );
}

// quick books selection
const Books = (names: string[]) => {
  const books: ReactElement[] = [];

  names.forEach((name, index) => {
    books.push(
      <div key={index}>
        <Link
          className={styles.toSearch}
          href={{
            pathname: "/search",
            query: { book: name },
          }}
        >
          <Image
            alt="cover"
            src={`/covers/${name}.webp`}
            width={340}
            height={480}
            priority={true}
            draggable={false}
          />
          <p>{bookShortcut(name)}</p>
        </Link>

        {pdfBooks().includes(name) && (
          <Link
            title="Otwórz plik PDF śpiewnika"
            className={styles.toFile}
            href={`/pdf/${bookShortcut(name)}.pdf`}
            target="_blank"
          >
            <Image
              className="icon"
              alt="pdf file"
              src="/icons/document.svg"
              width={30}
              height={30}
              draggable={false}
            />
          </Link>
        )}
      </div>
    );
  });

  return <div className={styles.books}>{books}</div>;
};
