import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";

import axios from "axios";

import styles from "@/styles/pages/search.module.scss";

import BookNames from "@/scripts/bookNames";

export default function SearchPage() {
  const router = useRouter();
  const book = router.query.book as string;

  const [hymns, setHymns] = useState<any>(); // all hymns in book
  const [data, setData] = useState<any>(); // filtered hymns

  const [showTopBtn, setShowTopBtn] = useState(false); // show/hide scroll-to-top button
  const [showClear, setShowClear] = useState(false); // show/hide clear button

  // searching main script
  const search = useCallback((hymns: [], input: string) => {
    if (!hymns) return;

    // create results
    let titlesCollector = new Array();
    let lyricsCollector = new Array();

    hymns.map((hymn: { book: string; title: string; lyrics: string[] }) => {
      if (textFormat(hymn.title).includes(textFormat(input))) {
        // title found
        titlesCollector.push({
          book: hymn.book,
          title: hymn.title,
        });
      } else {
        // lyrics found
        hymn.lyrics.map((verses: any) => {
          verses.map((lines: string, index: number) => {
            if (textFormat(lines).includes(textFormat(input))) {
              lyricsCollector.push({
                book: hymn.book,
                title: hymn.title,
                lyrics: `
                ${verses[index - 2] ? "..." : ""}
                ${verses[index - 1] ? `${verses[index - 1]}` : ""}
                ${verses[index]}
                ${verses[index + 1] ? `${verses[index + 1]}` : ""}
                ${verses[index + 2] ? "..." : ""}
                `,
              });
            }
          });
        });
      }
    });

    // change text to searching-friendly format
    function textFormat(text: string) {
      return text
        .toLowerCase()
        .replaceAll("ą", "a")
        .replaceAll("ć", "c")
        .replaceAll("ę", "e")
        .replaceAll("ł", "l")
        .replaceAll("ń", "n")
        .replaceAll("ó", "o")
        .replaceAll("ś", "s")
        .replaceAll("ż", "z")
        .replaceAll("ź", "z")
        .replace(/[^\w\s]/gi, "");
    }

    // merge Collectors
    let Collector = [...titlesCollector, ...lyricsCollector];
    Collector = Collector.filter((value, index, self) => {
      return index === self.findIndex((x) => x.title === value.title);
    });

    const titles = Collector.map((i) => i.title);
    Collector = Collector.filter(
      ({ id }, index) => !titles.includes(id, index + 1)
    );

    // return all results
    return Collector;
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    // special focus
    const input = document.getElementById("input") as HTMLInputElement;
    localStorage.getItem("focusSearchBox") === "true" && input.focus();

    // remove temporary localStorage files
    ["searchPage", "focusSearchBox"].forEach((item) => {
      localStorage.removeItem(item);
    });

    // show all hymns in book on load
    (() => {
      axios
        .get("/api/xml", {
          params: { book: router.query.book },
        })
        .then(({ data }) => {
          setHymns(data);
          setData(search(data, ""));
        })
        .catch((err) => {
          console.error(err);
          router.push("/search");
        });
    })();

    // show/hide scroll-to-top button
    window.onscroll = () => {
      window.scrollY > 300 ? setShowTopBtn(true) : setShowTopBtn(false);
    };

    // handle keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case "/":
          const input = document.getElementById("input") as HTMLInputElement;
          input.focus();
          break;
      }
    };

    // keyboard events
    document.addEventListener("keyup", handleKeyPress);
    return () => document.removeEventListener("keyup", handleKeyPress);
  }, [router, search]);

  return (
    <>
      <Head>
        <title>Wyszukiwanie / Śpiewniki</title>
      </Head>

      <div className="backArrow">
        <button onClick={() => router.push("/")}>
          <Image
            className="icon"
            alt="strzałka"
            src="/icons/arrow.svg"
            width={20}
            height={20}
          />
          <p>Powrót</p>
        </button>
      </div>

      <main>
        <div className={styles.mobileTitle}>
          <button
            title="Powrót"
            className={styles.backArrow}
            onClick={() => router.push("/")}
          >
            <Image
              className="icon"
              alt="info"
              src="/icons/arrow.svg"
              width={25}
              height={25}
              draggable="false"
            />
          </button>

          <h2>Wyszukiwanie</h2>
        </div>

        <div className={styles.searchBox}>
          <input
            autoComplete="off"
            type="text"
            id="input"
            placeholder="Rozpocznij wyszukiwanie"
            title="Możesz również użyć [/] na klawiaturze, aby rozpocząć wyszukiwanie"
            onFocus={(e) => e.target.select()}
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value ? setShowClear(true) : setShowClear(false);
              setData(search(hymns, input.value));
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                const firstResults = document.getElementById("results")
                  ?.firstChild?.firstChild as HTMLLinkElement;

                if (firstResults.href) {
                  router.push(firstResults.href);
                } else {
                  const input = e.target as HTMLInputElement;

                  input.value = "";
                  setData(search(hymns, input.value));
                }
              }
            }}
          />

          <div id="searchIcon" className={styles.searchIcon}>
            <Image
              className="icon"
              alt="Ikonka wyszukiwania"
              src="/icons/search.svg"
              width={25}
              height={25}
              draggable="false"
            />
          </div>

          <div
            id="clearButton"
            className={styles.clearButton}
            style={{ display: showClear ? "flex" : "none" }}
            onClick={() => {
              const input = document.getElementById(
                "input"
              ) as HTMLInputElement;

              input.value = "";
              input.focus();

              setData(search(hymns, input.value));
              return setShowClear(false);
            }}
          >
            <Image
              className="icon"
              alt="Wyczyść wyszukiwanie"
              src="/icons/close.svg"
              width={25}
              height={25}
              draggable="false"
            />
          </div>
        </div>

        <div id="filters" className={styles.filters}>
          <p className={styles.filtersTitle}>Szukaj&nbsp;w:</p>

          <button
            onClick={() => router.push("/books")}
            title="Kliknij, aby przejść to listy wszystkich śpiewników"
          >
            <p>{BookNames(book ? book : "all")}</p>
          </button>
        </div>

        {/* dynamically show results */}
        <div id="results" className={styles.results}>
          {(!data && <div className="loader" />) ||
            (!data[0] && (
              <p className={styles.noResults}>Brak wyników wyszukiwania</p>
            )) ||
            data.map(
              (
                hymn: { book: string; title: string; lyrics: string[] },
                index: number,
                row: { length: number }
              ) => {
                return (
                  <div key={index}>
                    <Link
                      onClick={() => {
                        return localStorage.setItem(
                          "searchPage",
                          book ? book : "all"
                        );
                      }}
                      href={{
                        pathname: "/hymn",
                        query: { book: hymn.book, title: hymn.title },
                      }}
                    >
                      <h2>{hymn.title}</h2>
                      {hymn.lyrics && <p>{hymn.lyrics}</p>}
                    </Link>

                    {
                      index + 1 !== row.length && <hr /> // separate results
                    }
                  </div>
                );
              }
            )}
        </div>

        <button
          title="Wróć na samą górę."
          className={styles.scrollButton}
          style={{
            // show/hide button
            visibility: showTopBtn ? "visible" : "hidden",
            opacity: showTopBtn ? 0.8 : 0,
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Image alt="up" src="/icons/arrow.svg" width={25} height={25} />
        </button>
      </main>
    </>
  );
}
