import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import styles from "@/styles/pages/index.module.scss";

import { Header, Navbar, Footer } from "@/components/elements";
import Menu from "@/components/menu";

import bookShortcut from "@/scripts/bookShortcut";
import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

export default function IndexPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
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
        case "B":
          unlocked && router.push("/books");
          break;
      }
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [router, unlocked]);

  return (
    <>
      <Head>
        <title>Śpiewniki</title>
      </Head>

      <Menu />

      <Header
        buttons={
          unlocked
            ? undefined
            : {
                leftSide: {
                  title: "Na Straży.org",
                  icon: "home",
                  onclick: () => router.push("https://nastrazy.org/"),
                },
              }
        }
      />

      <div className="container">
        <main>
          <div className="mobileHeader">
            {!unlocked && (
              <Link href="https://nastrazy.org/">
                <Image
                  className="icon"
                  alt="home"
                  src="/icons/home.svg"
                  width={25}
                  height={25}
                />
              </Link>
            )}

            <div className="logo">
              <Image
                className="icon"
                alt="bpsw"
                src="/logo/bpsw.svg"
                width={50}
                height={50}
                priority={true}
                draggable={false}
              />

              <h1>Śpiewniki</h1>
            </div>
          </div>

          <Link
            href="/search"
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
              <div className={styles.books}>
                {["B", "C", "N"].map((book: any, index: number) => {
                  return (
                    <div key={index}>
                      <Link
                        className={styles.toSearch}
                        href={{
                          pathname: "/search",
                          query: { book: book },
                        }}
                      >
                        <Image
                          alt="cover"
                          src={`/covers/${book}.webp`}
                          width={340}
                          height={480}
                          priority={true}
                          draggable={false}
                        />
                        <p>{bookShortcut(book)}</p>
                      </Link>

                      <Link
                        title="Otwórz plik PDF śpiewnika"
                        className={styles.toFile}
                        href={{
                          pathname: "/document",
                          query: { d: bookShortcut(book) },
                        }}
                      >
                        <Image
                          className="icon"
                          alt="pdf file"
                          src="/icons/document.svg"
                          width={30}
                          height={30}
                          priority={true}
                          draggable={false}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {unlocked && (
                <Link href="/books" className={styles.all}>
                  <p>Lista wszystkich śpiewników</p>
                </Link>
              )}
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
      </div>

      <Navbar />
    </>
  );
}
