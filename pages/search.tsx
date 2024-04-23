import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";

import axios from "axios";

import styles from "@/styles/pages/search.module.scss";

import { bookShortcut, booksList } from "@/scripts/availableBooks";
import SimpleText from "@/scripts/simpleText";

interface Hymn {
  book: string;
  name: string;
  lyrics: string[];
  song: {
    lyrics: string[];
  };
}

export default function SearchPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  // router queries
  const router = useRouter();
  const book = router.query.book as string;

  // data fetching
  const [rawData, setRawData] = useState<any>();
  const [data, setData] = useState<any>();
  const [isLoading, setLoading] = useState(true);

  // dynamic search-box input
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");

  // searching algorithm
  const Search = (data: any, input: string) => {
    const NamesCollector = new Array();
    const LyricsCollector = new Array();

    const { contextSearch } = JSON.parse(
      localStorage.getItem("settings") as string
    );

    data.map((hymn: Hymn) => {
      const { book, name, song } = hymn;

      const formattedName = new SimpleText(name).format();
      const formattedInput = new SimpleText(input).format();

      if (formattedName.includes(formattedInput)) {
        // title found
        NamesCollector.push({ book, name });
      } else if (contextSearch) {
        // lyrics found
        const lyrics = Object.values(song.lyrics)
          .flat()
          .filter((verse) => verse.startsWith(" "))
          .map((verse) => verse.slice(1));

        lyrics.map((verse, index) => {
          const formattedVerse = new SimpleText(verse).format();

          if (formattedVerse.includes(formattedInput)) {
            LyricsCollector.push({
              book,
              name,
              lyrics: [
                lyrics[index - 1]
                  ? `${lyrics[index - 2] ? "..." : ""} ${lyrics[index - 1]}`
                  : "",
                verse,
                lyrics[index + 1] ? lyrics[index + 1] : "",
                lyrics[index + 2]
                  ? `${lyrics[index + 2]} ${lyrics[index + 3] ? "..." : ""}`
                  : "",
              ],
            });
          }
        });
      }
    });

    // merge Collectors
    const Collector = [...NamesCollector, ...LyricsCollector].filter(
      (value, index, self) => {
        return index === self.findIndex((x) => x.name === value.name);
      }
    );

    setData(Collector);
    setLoading(false);
  };

  useEffect(() => {
    if (!router.isReady) return;

    // wrong book name error
    if (book && !bookShortcut(book)) router.push("/404");

    // focus search-box on load
    if (localStorage.getItem("focusSearchBox")) inputRef.current?.focus();
    localStorage.removeItem("focusSearchBox");

    // fast search input value
    const { quickSearch } = JSON.parse(
      localStorage.getItem("settings") as string
    );
    const prevSearch = JSON.parse(localStorage.getItem("prevSearch") as string);
    if (quickSearch) setInputValue(prevSearch?.search);

    // searching on load
    const loadData = (fetchData: any) => {
      setRawData(fetchData);

      if (prevSearch?.search) {
        Search(fetchData, prevSearch.search || "");
      } else {
        setData(fetchData);
        setLoading(false);
      }
    };

    // get all hymns from all books
    if (!book) {
      const Collector = new Array();

      booksList().map(async (book) => {
        Collector.push(
          await axios
            .get(`database/${bookShortcut(book)}.json`)
            .catch((err) => {
              console.error(err);
              router.push("/404");
            })
        );

        if (Collector.length === booksList().length) {
          let hymns = new Array();

          Collector.map(({ data }) => hymns.push(...data));
          hymns = hymns.sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, { numeric: true });
          });

          loadData(hymns);
        }
      });

      // get all hymns from selected book
    } else {
      axios
        .get(`database/${bookShortcut(book)}.json`)
        .then(({ data }) => loadData(data))
        .catch((err) => {
          console.error(err);
          router.push("/404");
        });
    }
  }, [router, book]);

  // clear button
  const [showClearBtn, setShowClearBtn] = useState(false);

  // searching on input change
  useEffect(() => {
    // select search input on load
    if (inputValue && !rawData) inputRef.current?.select();

    // show clear button when input value
    if (inputValue) setShowClearBtn(true);
    else setShowClearBtn(false);

    // data update on input change
    if (rawData) {
      if (inputValue) {
        const timeout = setTimeout(() => {
          return Search(rawData, inputValue || "");
        }, 100);
        return () => clearTimeout(timeout);
      } else setData(rawData);
    }
  }, [inputValue, rawData]);

  // clear search input and results
  const cleanUp = useCallback(() => {
    setInputValue("");
    inputRef.current?.focus();

    setData(rawData);
    localStorage.removeItem("prevSearch");
  }, [rawData]);

  // scroll-to-top button
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const scrollEvent = () => {
      if (window.scrollY > 350) setShowTopBtn(true);
      else setShowTopBtn(false);
    };

    window.addEventListener("scroll", scrollEvent);
    return () => window.removeEventListener("scroll", scrollEvent);
  }, []);

  // href link to hymn page
  const hymnLink = (hymn: Hymn) => {
    return {
      pathname: "/hymn",
      query: {
        book: bookShortcut(hymn.book),
        title: hymn.name,
      },
    };
  };

  // keyboard shortcuts
  useEffect(() => {
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

      if (document.activeElement === inputRef.current) {
        // search-box shortcuts
        if (event.key === "Escape") inputRef.current?.blur();
        if (event.key === "Enter") {
          const hymn = data[0];

          if (hymn) router.push(hymnLink(hymn));
          else cleanUp();
        }
      } else {
        const key = event.key.toUpperCase();

        // global shortcuts
        if (key === "/") inputRef.current?.focus();
        if (key === "B") router.push(unlocked ? "/books" : "/");
      }
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [data, router, cleanUp, unlocked]);

  return (
    <>
      <Head>
        <title>Wyszukiwanie / Śpiewniki</title>
      </Head>

      <div className="container">
        <div className="mobileHeader">
          <button style={{ rotate: "90deg" }} onClick={() => router.push("/")}>
            <Image
              className="icon"
              alt="back"
              src="/icons/arrow.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>

          <p className="center">Wyszukiwanie</p>
        </div>

        <main>
          <div className={styles.searchBox}>
            <input
              ref={inputRef}
              name="search-box"
              title="Kliknij, lub użyj [/] na klawiaturze, aby powrócić do wyszukiwania."
              placeholder="Rozpocznij wyszukiwanie"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value;
                setInputValue(value);

                // saving search values
                const { quickSearch } = JSON.parse(
                  localStorage.getItem("settings") as string
                );

                localStorage.setItem(
                  "prevSearch",
                  JSON.stringify({ book, search: quickSearch ? value : "" })
                );

                // easter-egg
                if (unlocked && value === "2137") {
                  localStorage.removeItem("prevSearch");

                  router.push({
                    pathname: "/hymn",
                    query: {
                      book: "C",
                      title: "7C. Pan kiedyś stanął nad brzegiem",
                    },
                  });
                }
              }}
              onFocus={(e) => e.target.select()}
            />

            <div className={styles.searchIcon}>
              <Image
                className="icon"
                alt="search icon"
                src="/icons/search.svg"
                width={25}
                height={25}
                draggable={false}
              />
            </div>

            <div
              title="Wyczyść wyszukiwanie"
              className={styles.clearButton}
              style={{ display: showClearBtn ? "flex" : "none" }}
              onClick={cleanUp}
            >
              <Image
                className="icon"
                alt="clear"
                src="/icons/close.svg"
                width={25}
                height={25}
                draggable={false}
              />
            </div>
          </div>

          {unlocked ? (
            <div className={styles.filters}>
              <h3>Szukaj&nbsp;w:</h3>

              <button
                title="Otwórz listę wszystkich śpiewników [B]"
                onClick={() => router.push("/books")}
              >
                <p>{bookShortcut(book || "all")}</p>
              </button>
            </div>
          ) : (
            <div className={styles.filters}>
              <h3>Wybrano:</h3>

              <button className={styles.disabled} tabIndex={-1}>
                <p>{bookShortcut(book || "all")}</p>
              </button>
            </div>
          )}

          <div className={styles.results}>
            {(isLoading && <div className="loader" />) ||
              (!data.length && (
                <p className={styles.noResults}>Brak wyników wyszukiwania</p>
              )) ||
              data.map((hymn: Hymn, index: number, row: string) => (
                <div key={index}>
                  <Link
                    href={hymnLink(hymn)}
                    onClick={() => {
                      const { quickSearch } = JSON.parse(
                        localStorage.getItem("settings") as string
                      );

                      localStorage.setItem(
                        "prevSearch",
                        JSON.stringify({
                          book,
                          search: quickSearch ? inputValue : "",
                        })
                      );
                    }}
                  >
                    <h2>{hymn.name}</h2>

                    {hymn.lyrics && (
                      <div className={styles.lyrics}>
                        {hymn.lyrics.map((verse: string, i: number) => (
                          <p key={i}>{verse}</p>
                        ))}
                      </div>
                    )}
                  </Link>

                  {index + 1 !== row.length && <hr />}
                </div>
              ))}
          </div>

          <button
            title="Powróć na górę strony"
            className={styles.scrollButton}
            style={{
              visibility: showTopBtn ? "visible" : "hidden",
              opacity: showTopBtn ? 0.8 : 0,
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Image
              alt="arrow up"
              src="/icons/arrow.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>
        </main>
      </div>
    </>
  );
}
