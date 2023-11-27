import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import axios from "axios";

import styles from "@/styles/pages/search.module.scss";

import { bookShortcut, booksList } from "@/scripts/bookShortcut";
import textFormat from "@/scripts/textFormat";

export default function SearchPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  const router = useRouter();
  const book = router.query.book as string;

  const [isLoading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>();
  const [data, setData] = useState<any>();

  // clear search bar button
  const [showClearBtn, setShowClearBtn] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const { contextSearch } = JSON.parse(
      localStorage.getItem("settings") as string
    );
    const { search } = JSON.parse(localStorage.getItem("prevSearch") as string);
    if (contextSearch && search) setShowClearBtn(true);

    // url errors handling
    if (book && !bookShortcut(book)) router.push("/404");

    // intelligent focus on search box
    const input = document.getElementById("input") as HTMLInputElement;
    localStorage.getItem("focusSearchBox") === "true" && input.focus();
    localStorage.removeItem("focusSearchBox");

    const dataInterpretation = (data: any) => {
      setRawData(data);
      setData(data);

      if (localStorage.getItem("prevSearch")) {
        const { search } = JSON.parse(
          localStorage.getItem("prevSearch") as string
        );

        input.value = search;
        input.select();
        Search(data, search);
      }
      setLoading(false);
    };

    // get all hymns from all books
    if (!book) {
      const Collector = new Array();

      booksList().map(async (book) => {
        Collector.push(
          await axios
            .get(`database/${bookShortcut(book)}.json`)
            .catch((err) => console.error(err))
        );

        if (Collector.length === booksList().length) {
          let hymns = new Array();

          Collector.map(({ data }) => hymns.push(...data));
          hymns = hymns.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          );

          dataInterpretation(hymns);
        }
      });

      // get all hymns from selected book
    } else {
      axios
        .get(`database/${bookShortcut(book)}.json`)
        .then(({ data }) => dataInterpretation(data))
        .catch((err) => console.error(err));
    }
  }, [router, book]);

  // previous search restoration
  useEffect(() => {
    const input = document.getElementById("input") as HTMLInputElement;
    if (input.value) Search(rawData, input.value);
  }, [rawData]);

  // searching algorithm
  const Search = (data: [], input: string) => {
    if (!data) return;
    setLoading(true);

    let NamesCollector = new Array();
    let LyricsCollector = new Array();

    const { contextSearch } = JSON.parse(
      localStorage.getItem("settings") as string
    );

    data.map((hymn: { book: string; name: string; song: any }) => {
      const { book, name, song } = hymn;

      if (textFormat(hymn.name).includes(textFormat(input))) {
        // title found
        NamesCollector.push({ book, name });
      } else if (contextSearch) {
        // lyrics found
        const lyrics: string[] = (Object.values(song.lyrics).flat() as string[])
          .filter((verse: string) => verse.startsWith(" "))
          .map((verse) => verse.slice(1));

        lyrics.map((verse: string, index: number) => {
          if (textFormat(verse).includes(textFormat(input))) {
            LyricsCollector.push({
              book: hymn.book,
              name: hymn.name,
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
    return;
  };

  useEffect(() => {
    const scrollEvent = () => {
      if (window.scrollY > 400) setShowTopBtn(true);
      else setShowTopBtn(false);
    };

    // keyboard shortcuts
    const KeyupEvent = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
        return;
      }

      const input = document.getElementById("input") as HTMLInputElement;
      if (document.activeElement == input) return;

      switch (event.key.toUpperCase()) {
        case "/":
          input.focus();
          break;
        case "B":
          unlocked ? router.push("/books") : router.push("/");
          break;
      }
    };

    window.addEventListener("scroll", scrollEvent);
    document.addEventListener("keyup", KeyupEvent);

    return () => {
      window.removeEventListener("scroll", scrollEvent);
      document.removeEventListener("keyup", KeyupEvent);
    };
  }, [router, unlocked]);

  // scroll to top button
  const [showTopBtn, setShowTopBtn] = useState(false);

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
              autoComplete="off"
              type="text"
              id="input"
              placeholder="Rozpocznij wyszukiwanie"
              title="Rozpocznij wyszukiwanie [/]"
              onFocus={(e) => e.target.select()}
              onInput={(e) => {
                const input = e.target as HTMLInputElement;

                const { quickSearch } = JSON.parse(
                  localStorage.getItem("settings") as string
                );

                localStorage.setItem(
                  "prevSearch",
                  JSON.stringify({
                    book,
                    search: quickSearch ? input.value : "",
                  })
                );

                input.value ? setShowClearBtn(true) : setShowClearBtn(false);
                setTimeout(() => Search(rawData, input.value), 200);

                // easter egg
                if (unlocked && input.value === "2137") {
                  router.push({
                    pathname: "/hymn",
                    query: {
                      book: "C",
                      title: "7C. Pan kiedyś stanął nad brzegiem",
                    },
                  });
                }
              }}
              onKeyUp={(e) => {
                if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
                const input = e.target as HTMLInputElement;

                switch (e.key) {
                  case "Escape":
                    input.blur();
                    break;
                  case "Enter":
                    const firstResults = document.getElementById("results")
                      ?.firstChild?.firstChild as HTMLLinkElement;

                    if (firstResults.href) {
                      router.push(firstResults.href);
                    } else {
                      input.value = "";
                      Search(rawData, input.value);
                    }
                    break;
                }
              }}
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
              className={styles.clearButton}
              style={{ display: showClearBtn ? "flex" : "none" }}
              onClick={() => {
                const input = document.getElementById(
                  "input"
                ) as HTMLInputElement;

                input.value = "";
                input.focus();

                setData(rawData);
                return setShowClearBtn(false);
              }}
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
                onClick={() => router.push("/books")}
                title="Otwórz listę wszystkich śpiewników [B]"
              >
                <p>{bookShortcut(book ? book : "all")}</p>
              </button>
            </div>
          ) : (
            <div className={styles.filters}>
              <h3>Wybrano:</h3>

              <button className={styles.disabled} tabIndex={-1}>
                <p>{bookShortcut(book ? book : "all")}</p>
              </button>
            </div>
          )}

          <div id="results" className={styles.results}>
            {(isLoading && <div className="loader" />) ||
              (!data.length && (
                <p className={styles.noResults}>Brak wyników wyszukiwania</p>
              )) ||
              data.map(
                (
                  hymn: {
                    book: string;
                    name: string;
                    lyrics: string[];
                  },
                  index: number,
                  row: string
                ) => {
                  return (
                    <div key={index}>
                      <Link
                        onClick={() => {
                          const input = document.getElementById(
                            "input"
                          ) as HTMLInputElement;

                          const { quickSearch } = JSON.parse(
                            localStorage.getItem("settings") as string
                          );

                          localStorage.setItem(
                            "prevSearch",
                            JSON.stringify({
                              book,
                              search: quickSearch ? input.value : "",
                            })
                          );
                        }}
                        href={{
                          pathname: "/hymn",
                          query: {
                            book: bookShortcut(hymn.book),
                            title: hymn.name,
                          },
                        }}
                      >
                        <h2>{hymn.name}</h2>
                        {hymn.lyrics && (
                          <div className={styles.lyrics}>
                            {hymn.lyrics.map((verse: string, index: number) => {
                              return <p key={index}>{verse}</p>;
                            })}
                          </div>
                        )}
                      </Link>

                      {index + 1 !== row.length && <hr />}
                    </div>
                  );
                }
              )}
          </div>

          <button
            title="Powrót na górę strony."
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
