import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useCallback, useEffect } from "react";

import axios from "axios";

import styles from "@/styles/pages/search.module.scss";

import BookNames from "@/scripts/bookNames";

export default function SearchPage() {
  const router = useRouter();
  let { book, tags } = router.query as { book: string; tags: any };

  if (!book) book = "all";
  if (tags) tags = tags.split("-");

  const [data, setData] = useState<any>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const handleKeyPress = useCallback((e: { key: string }) => {
    const key = e.key.toUpperCase();

    // shortcuts
    switch (key) {
      case "/":
        const input = document.getElementById("input") as HTMLInputElement;
        input.focus();
        break;
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    // special focus
    const input = document.getElementById("input") as HTMLInputElement;
    localStorage.getItem("focusSearchBox") === "true" && input.focus();

    // searching script
    (async () => {
      setData(await search(book, input.value));
    })();

    // filter buttons
    const filters = document.getElementById("filters") as HTMLElement;
    filters.onclick = (e) => {
      if ((e.target as HTMLElement).tagName === "BUTTON") router.push("/books");
    };

    // show/hide scroll-to-top button
    window.onscroll = () => {
      if (window.scrollY > 300) setShowTopBtn(true);
      else setShowTopBtn(false);
    };

    // remove localStorage temporary tags
    ["searchPage", "focusSearchBox"].forEach((item) => {
      localStorage.removeItem(item);
    });

    // keyboard shortcuts handler
    document.addEventListener("keyup", handleKeyPress);
    return () => document.removeEventListener("keyup", handleKeyPress);
  }, [router, book, tags, handleKeyPress]);

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
          <p>Powrót na stronę główną</p>
        </button>
      </div>

      <main>
        <div className={styles.mobileTitle}>
          <button
            title="Powrót do strony głównej"
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
            placeholder="Rozpocznij wyszukiwanie..."
            title="Możesz również użyć [/] na klawiaturze, aby rozpocząć wyszukiwanie"
            onFocus={(e) => e.target.select()}
            onInput={async (e) => {
              const input = e.target as HTMLInputElement;
              showClear(input.value);
              setData(await search(book, input.value));
            }}
            onKeyUp={async (e) => {
              if (e.key === "Enter") {
                const firstResults = document.getElementById("results")
                  ?.firstChild?.firstChild as HTMLLinkElement;

                if (firstResults.href) router.push(firstResults.href);
                else setData(await clearSearch(book));
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
            id="clearIcon"
            className={styles.clearIcon}
            onClick={async () => setData(await clearSearch(book))}
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

          {book && (
            <button title="Kliknij, aby przejść to listy wszystkich śpiewników">
              {BookNames(book)}
            </button>
          )}
          {/* {tags &&
            tags.map((name: string) => {
              return (
                <button className={styles.tagsButtons} key={name}>
                  {name}
                </button>
              );
            })}
          <button className={styles.addMore}>+</button> */}
        </div>

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
                      onClick={() => localStorage.setItem("searchPage", book)}
                      href={{
                        pathname: `/hymn`,
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
          <Image
            className="icon"
            alt="up"
            src="/icons/arrow.svg"
            width={25}
            height={25}
          />
        </button>
      </main>
    </>
  );
}

// searching main script
async function search(book: string, input: string) {
  // read books
  let path;
  if (book === "all") path = `/api/xml`;
  else path = `/api/xml?book=${book}`;

  const list = await axios.get(path).then(({ data }) => data);

  // create results
  let titlesCollector = new Array();
  let lyricsCollector = new Array();

  list.map((hymn: { book: string; title: string; lyrics: string[] }) => {
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
              lyrics: [
                verses[index - 2] ? "... " : undefined,
                verses[index - 1],
                verses[index],
                verses[index + 1],
                verses[index + 2] ? "..." : undefined,
              ],
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
}

// clear search input button
async function clearSearch(book: string) {
  const input = document.getElementById("input") as HTMLInputElement;
  input.value = "";

  showClear(input.value);
  input.focus();

  return await search(book, input.value);
}

function showClear(input: string) {
  const clearIcon = document.getElementById("clearIcon") as HTMLElement;

  if (!input) clearIcon.style.display = "";
  else clearIcon.style.display = "flex";
}
