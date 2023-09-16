import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";

import styles from "@/styles/pages/search.module.scss";
import bookShortcut, { bookList } from "@/scripts/bookShortcut";

import { Header } from "@/components/elements";

export default function SearchPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  const router = useRouter();
  const book = router.query.book as string;

  const [isLoading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>();
  const [data, setData] = useState<any>();

  // fetch all data on startup
  useEffect(() => {
    if (!router.isReady) return;

    // url errors handling
    if (book && !bookShortcut(book)) router.push("/404");
    const params = Object.keys(router.query);
    if (params.length && !params.includes("book")) router.push("/search");

    // intelligent focus on search box
    const input = document.getElementById("input") as HTMLInputElement;
    localStorage.getItem("focusSearchBox") === "true" && input.focus();

    // remove temporary localStorage files
    ["prevSearch", "focusSearchBox"].forEach((item) => {
      localStorage.removeItem(item);
    });

    // get all hymns from all books
    if (!book) {
      const all = bookList();
      const Collector = new Array();

      all.forEach(async (book) => {
        Collector.push(
          await axios
            .get(`database/${bookShortcut(book)}.json`)
            .catch((err) => console.error(err))
        );

        if (Collector.length === all.length) {
          let hymns = new Array();

          Collector.map(({ data }) => hymns.push(...data));
          hymns = hymns.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true })
          );

          setRawData(hymns);
          setData(hymns);
          setLoading(false);
        }
      });

      // get all hymns from selected book
    } else {
      axios
        .get(`database/${bookShortcut(book)}.json`)
        .then(({ data }) => {
          setRawData(data);
          setData(data);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    }
  }, [router, book]);

  // searching algorithm
  const Search = (data: [], input: string) => {
    if (!data) return;
    setLoading(true);

    let NamesCollector = new Array();
    let LyricsCollector = new Array();

    // simplify text
    const textFormat = (text: string) => {
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
    };

    data.map((hymn: { book: string; name: string; song: any }) => {
      const { book, name, song } = hymn;

      if (textFormat(hymn.name).includes(textFormat(input))) {
        // title found
        NamesCollector.push({ book, name });
      } else {
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
    let Collector = [...NamesCollector, ...LyricsCollector];
    Collector = Collector.filter((value, index, self) => {
      return index === self.findIndex((x) => x.name === value.name);
    });

    setData(Collector);
    setLoading(false);
    return;
  };

  // clear search bar button
  const [showClearBtn, setShowClearBtn] = useState(false);

  // scroll to top button
  const [showTopBtn, setShowTopBtn] = useState(false);

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

  return (
    <>
      <Head>
        <title>Wyszukiwanie / Śpiewniki</title>
      </Head>

      <Header
        buttons={
          unlocked
            ? {
                leftSide: {
                  title: "Powrót do strony głównej",
                  icon: "arrow",
                  onclick: () => router.push("/"),
                },
              }
            : {
                leftSide: {
                  title: "Powrót do śpiewników",
                  icon: "arrow",
                  onclick: () => router.push("/"),
                },
                rightSide: {
                  title: "Na Straży.org",
                  icon: "external_link",
                  onclick: () => router.push("https://nastrazy.org/"),
                },
              }
        }
      />

      <div className="container">
        <main>
          <div className={styles.mobileTitle}>
            <button onClick={() => router.push("/")}>
              <Image
                className="icon"
                alt="back"
                src="/icons/arrow.svg"
                width={25}
                height={25}
                draggable={false}
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
              title="Możesz również użyć [/] na klawiaturze, aby rozpocząć wyszukiwanie."
              onFocus={(e) => e.target.select()}
              onInput={(e) => {
                const input = e.target as HTMLInputElement;
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
                          if (book) localStorage.setItem("prevSearch", book);
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
            title="Powrót na górę strony"
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
