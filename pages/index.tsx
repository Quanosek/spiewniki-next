import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import styles from "@/styles/pages/index.module.scss";

import MobileNavbar from "@/components/mobileNavbar";
import { bookShortcut } from "@/scripts/availableBooks";
import { randomHymn, shareButton } from "@/scripts/buttons";

export default function HomePage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    localStorage.removeItem("prevSearch");

    // keyboard shortcuts
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

      const key = event.key.toUpperCase();

      if (key === "/") {
        localStorage.setItem("focusSearchBox", "true");
        router.push("/search");
      }
      if (key === "B") unlocked && router.push("/books");
      if (key === "R") randomHymn(undefined);
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [router, unlocked]);

  // prevent scrolling on active hamburger menu
  const [hamburgerMenu, showHamburgerMenu] = useState(false);

  useEffect(() => {
    const TopScroll = document.documentElement.scrollTop;
    const LeftScroll = document.documentElement.scrollLeft;

    const ScrollEvent = () => {
      if (!hamburgerMenu) return;
      window.scrollTo(LeftScroll, TopScroll);
    };

    document.addEventListener("scroll", ScrollEvent);
    return () => document.removeEventListener("scroll", ScrollEvent);
  }, [hamburgerMenu]);

  return (
    <>
      <Head>
        <title>Śpiewniki</title>
      </Head>

      <div className="container">
        <div
          className={`
          ${unlocked ? styles.title : "mobileHeader"}
          ${styles.mobileHeader}
          ${hamburgerMenu && styles.active}
          `}
        >
          <Link className={styles.logotype} href="/">
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
            <button onClick={shareButton}>Udostępnij</button>
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
              title="Otwórz losową pieśń [R]"
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
              {["B", "C", "N"].map((book, i) => (
                <div key={i}>
                  <Link
                    className={styles.book}
                    href={{ pathname: "/search", query: { book } }}
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
              ))}
            </div>

            {unlocked && (
              <Link href="/books" className={styles.more}>
                <p>Pokaż wszystkie śpiewniki</p>
              </Link>
            )}
          </div>
        </main>

        <div className={styles.footer}>
          <p>
            Wszelkie prawa zastrzeżone &#169; 2022-{new Date().getFullYear()}
            {unlocked ? (
              <>
                {" │ "} domena&nbsp;
                <Link href="https://www.klalo.pl/">klalo.pl</Link>
              </>
            ) : (
              ""
            )}
          </p>
        </div>
      </div>

      <MobileNavbar />
    </>
  );
}
