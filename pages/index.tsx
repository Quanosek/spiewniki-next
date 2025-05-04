import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MobileNavbar from "@/components/mobileNavbar";
import { bookShortcut } from "@/lib/availableBooks";
import { randomHymn, shareButton } from "@/lib/buttons";

import styles from "@/styles/pages/index.module.scss";

export default function HomePage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("prevSearch");
  }, []);

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

  useEffect(() => {
    // keyboard shortcuts
    const KeyupEvent = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.metaKey ||
        router.query.menu
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === "/") {
        localStorage.setItem("focusSearchBox", "true");
        router.push("/search");
      }
      if (unlocked && key === "B") router.push("/books");
      if (key === "R") randomHymn(undefined);
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [router, unlocked]);

  return (
    <>
      <Head>
        <title>Śpiewniki</title>
      </Head>

      <main className={styles.main}>
        <div className={`${styles.title} ${unlocked && styles.center}`}>
          <Link href="/" className={styles.logotype}>
            <Image
              className="icon"
              alt="bpsw"
              src="/logo/bpsw.svg"
              width={40}
              height={40}
              draggable={false}
              priority
            />
            <h1>Śpiewniki</h1>
          </Link>

          {!unlocked && (
            <button
              className={styles.hamburgerIcon}
              onClick={() => showHamburgerMenu(!hamburgerMenu)}
            >
              <svg
                className={`${hamburgerMenu && styles.active} icon`}
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
          // mobile fullscreen menu
          <div className={styles.hamburgerMenu}>
            <button onClick={shareButton}>
              <p>Udostępnij</p>
            </button>

            <Link href="https://nastrazy.org/">
              <p>Nastrazy.org</p>
            </Link>
          </div>
        )}

        <div className={styles.searchBox}>
          <div className={styles.searchIcon}>
            <Image
              className="icon"
              alt="search"
              src="/icons/search.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </div>

          <Link
            href="/search"
            title="Kliknij, lub użyj [/] na klawiaturze, aby wyszukać we wszystkich śpiewnikach"
            className={styles.search}
            onClick={() => localStorage.setItem("focusSearchBox", "true")}
          >
            <p>Rozpocznij wyszukiwanie</p>
          </Link>

          <button
            title="Otwórz losową pieśń [R]"
            onClick={() => randomHymn(undefined)}
          >
            <Image
              className="icon"
              alt="dice"
              src="/icons/dice.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>
        </div>

        <div className={styles.container}>
          <div className={styles.grid}>
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
                    draggable={false}
                    priority
                  />
                  <p>{bookShortcut(book)}</p>
                </Link>

                <Link
                  href={{
                    pathname: "/document",
                    query: { d: bookShortcut(book) },
                  }}
                  title="Otwórz plik PDF śpiewnika"
                  className={styles.pdfIcon}
                >
                  <Image
                    className="icon"
                    alt="pdf"
                    src="/icons/document.svg"
                    width={30}
                    height={30}
                    draggable={false}
                  />
                </Link>
              </div>
            ))}
          </div>

          {unlocked && (
            <Link href="/books" className={styles.moreButton}>
              <p>Pokaż wszystkie śpiewniki</p>
            </Link>
          )}
        </div>

        <div className={styles.mobileFooter}>
          <p>
            Wszelkie prawa zastrzeżone &#169; 2022-{new Date().getFullYear()}
            {" │ "}
            {unlocked ? (
              <>
                domena&nbsp;
                <Link href="https://www.klalo.pl/">klalo.pl</Link>
              </>
            ) : (
              <Link href="https://www.nastrazy.org/">
                Wydawnictwo Na Straży
              </Link>
            )}
          </p>
        </div>
      </main>

      <MobileNavbar />
    </>
  );
}
