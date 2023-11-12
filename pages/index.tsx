import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/index.module.scss";

import { Navbar, Footer } from "@/components/assets";

import { bookShortcut } from "@/scripts/bookShortcut";
import { randomHymn } from "@/scripts/buttons";

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

  // hamburger menu background scrolling
  const [hamburgerMenu, showHamburgerMenu] = useState(false);

  useEffect(() => {
    if (hamburgerMenu) {
      const TopScroll = document.documentElement.scrollTop;
      const LeftScroll = document.documentElement.scrollLeft;

      window.onscroll = () => window.scrollTo(LeftScroll, TopScroll);
    } else window.onscroll = () => {};
  }, [hamburgerMenu]);

  return (
    <>
      <Head>
        <title>Śpiewniki</title>
      </Head>

      <div className="container">
        <div
          className={`${unlocked ? styles.title : "mobileHeader"} ${
            styles.mobileHeader
          }`}
          style={{ boxShadow: hamburgerMenu ? "unset" : "" }}
        >
          <Link
            className={styles.logotype}
            style={{ opacity: hamburgerMenu ? "0" : "" }}
            href="/"
          >
            <Image
              className="icon"
              alt="bpsw"
              src="/logo/bpsw.svg"
              width={45}
              height={45}
              priority={true}
              draggable={false}
            />
            <p>Śpiewniki</p>
          </Link>

          {!unlocked && (
            // Hamburger Menu
            // https://wykladybiblijne.org/

            <button
              className="icon"
              onClick={() => showHamburgerMenu(!hamburgerMenu)}
            >
              <svg
                className={`${hamburgerMenu && styles.active}`}
                viewBox="0 0 64 48"
              >
                <path d="M19,15 L45,15 C70,15 58,-2 49.0177126,7 L19,37"></path>
                <path d="M19,24 L45,24 C61.2371586,24 57,49 41,33 L32,24"></path>
                <path d="M45,33 L19,33 C-8,33 6,-2 22,14 L45,37"></path>
              </svg>
            </button>
          )}
        </div>

        {hamburgerMenu && (
          <div className={styles.hamburgerMenu}>
            <Link href="https://nastrazy.org/">Nastrazy.org</Link>
          </div>
        )}

        <main>
          <div className={styles.searchBox}>
            <Link
              href="/search"
              title="Wyszukaj we wszystkich śpiewnikach [/]"
              className={styles.search}
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

            <button
              className={styles.randomButton}
              title="Wylosuj pieśń ze śpiewnika [R]"
              onClick={() => randomHymn(undefined)}
            >
              <p>Wylosuj pieśń</p>
              <Image
                className="icon"
                alt="random"
                src="/icons/dice.svg"
                width={25}
                height={25}
                draggable={false}
              />
            </button>
          </div>

          <div className={styles.container}>
            <div className={styles.books}>
              {["B", "C", "N"].map((book: any, index: number) => {
                return (
                  <div key={index}>
                    <Link
                      className={styles.book}
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
                      className={styles.pdfIcon}
                      href={{
                        pathname: "/document",
                        query: { d: bookShortcut(book) },
                      }}
                    >
                      <Image
                        className="icon"
                        alt="pdf_file"
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
              <Link href="/books" className={styles.more}>
                <p>Lista wszystkich śpiewników</p>
              </Link>
            )}
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
