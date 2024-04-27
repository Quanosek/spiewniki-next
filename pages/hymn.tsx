import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import { MobileNavbar } from "@/components/assets";
import Presentation from "@/components/presentation";

import { bookShortcut } from "@/scripts/availableBooks";
import { openMenu, randomHymn, shareButton } from "@/scripts/buttons";

interface RouterQuery {
  [key: string]: string;
}

export default function HymnPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  // get params from url
  const router = useRouter();
  const { book, title } = router.query as RouterQuery;

  // hymn data
  const [hymn, setHymn] = useState<any>();
  const [isLoading, setLoading] = useState(true);

  // show presentation layout
  const [presentationMode, setPresentationMode] = useState<boolean>();

  const noChords = useRef<boolean>(); // no chords prompt
  const fontSize = useRef<number>(); // set font size

  // hiding mobile navbar on scroll
  const [hideNavbar, setHideNavbar] = useState(false);

  // settings on page load
  useEffect(() => {
    if (!router.isReady) return;
    const { book, title, presentation } = router.query as RouterQuery;
    const presBoolean = /true/.test(presentation);

    axios
      .get(`database/${bookShortcut(book)}.json`) // get all hymn data
      .then(({ data }) => {
        const settings = JSON.parse(localStorage.getItem("settings") as string);

        // define new hymn data
        const hymn = data.find((elem: any) => elem.name === title);
        hymn.lyrics = Object.values(hymn.song.lyrics);

        // check if hymn file has chords
        const includesChords = hymn.lyrics.some((array: string[]) => {
          return array.some((verse: string) => verse.startsWith("."));
        });
        if (settings.showChords && !includesChords) noChords.current = true;
        else noChords.current = false;

        fontSize.current = settings.fontSize; // set loaded content font size

        // linked songs reformat
        if (hymn.song.linked_songs) {
          hymn.song.linked_songs = Object.values(hymn.song.linked_songs).map(
            (song: any) => {
              const splitSong = song.split("\\");

              return {
                book: bookShortcut(splitSong[0]),
                title: splitSong[1],
              };
            }
          );
        }

        setHymn(hymn); // hymn data
        setLoading(false); // stop loading animation
        setPresentationMode(presBoolean); // show presentation layout
      })
      .catch((err) => {
        // hymn not found
        console.error(err);
        router.push("/404");
      });

    // hide overflow on presentation mode active
    if (presentation) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";

    // fullscreen change event
    document.onfullscreenchange = () => {
      if (!document.fullscreenElement) router.back();
    };

    // mobile navbar hide on scroll event
    let lastScrollY = window.scrollY;

    document.onscroll = () => {
      if (window.scrollY - lastScrollY > 50) {
        setHideNavbar(true);
      }
      if (lastScrollY - window.scrollY > 65 || window.scrollY < 30) {
        setHideNavbar(false);
      }
    };

    document.onscrollend = () => (lastScrollY = window.scrollY);
  }, [router]);

  // enable presentation mode
  const showPresentation = useCallback(() => {
    // request fullscreen
    const elem = document.documentElement;
    elem.requestFullscreen && elem.requestFullscreen();

    // redirect to presentation view
    const { ...params } = router.query;
    router.push({ query: { ...params, presentation: true } });
  }, [router]);

  // back to search page with specific book
  const openPrevSearch = () => {
    localStorage.setItem("focusSearchBox", "true");

    const prevSearch = localStorage.getItem("prevSearch");
    if (prevSearch) {
      const { book } = JSON.parse(prevSearch);

      if (book) {
        router.push({
          pathname: "/search",
          query: { book },
        });
      } else router.push("/search");
    } else router.push("/search");
  };

  // add/remove hymn to/from local favorites list
  const [isFavorite, setFavorite] = useState(false);

  const favoriteButton = () => {
    const bookName = bookShortcut(hymn.book);
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    // remove from favorites list
    if (
      favorites.some((elem: { book: string; id: number }) => {
        return elem.book === bookName && elem.id === hymn.id;
      })
    ) {
      setFavorite(false);
      favorites = favorites.filter((elem: { book: string; id: number }) => {
        return elem.book !== bookName || elem.id !== hymn.id;
      });

      // add to favorites list
    } else {
      setFavorite(true);
      favorites = [
        {
          book: bookName,
          id: hymn.id,
          title: hymn.name,
          timestamp: Date.now(),
        },
      ].concat(favorites);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  // check connected files
  const [hymnFiles, setHymnFiles] = useState<any>({});

  const openDocument = useCallback(() => {
    const { book, id } = hymnFiles.pdf;

    router.push({ pathname: "/document", query: { book, id } });
  }, [hymnFiles, router]);

  // load additional data for hymn
  useEffect(() => {
    if (!hymn) return;

    fetch(`/api/hymnFiles?book=${hymn.book}&title=${hymn.song.title}`)
      .then((res) => res.json())
      .then((data) => setHymnFiles(data))
      .catch((err) => console.error(err));

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    setFavorite(
      favorites.some((element: { book: string; id: number }) => {
        return element.book === router.query.book && element.id === hymn.id;
      })
    );
  }, [router, hymn]);

  // previous/next hymn buttons
  const changeHymn = useCallback(
    (id: number) => {
      // remove searching input from storage
      const fromStorage = localStorage.getItem("prevSearch");
      if (fromStorage) {
        const json = JSON.parse(fromStorage);
        json.search = "";
        localStorage.setItem("prevSearch", JSON.stringify(json));
      }
      // first result
      if (id < 0) {
        setLoading(false);
        return alert("To jest pierwsza pieśń w tym śpiewniku!");
      }

      axios
        .get(`database/${hymn.book}.json`)
        .then(({ data }) => {
          // last result
          if (id >= data.length) {
            return alert("To jest ostatnia pieśń w tym śpiewniku!");
          }

          const hymn = data.find((elem: any) => elem.id === id);

          router.push({
            pathname: "/hymn",
            query: {
              book: bookShortcut(hymn.book),
              title: hymn.name,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          router.back();
        });
    },
    [router, hymn]
  );

  // keyboard shortcuts
  useEffect(() => {
    if (!(hymn && router.isReady)) return;

    const KeyupEvent = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        router.query.menu ||
        presentationMode
      ) {
        return;
      }

      const key = event.key.toUpperCase();

      if (key === "/") {
        localStorage.removeItem("prevSearch");
        localStorage.setItem("focusSearchBox", "true");
        router.push("/search");
      }
      if (key === "B") router.push(unlocked ? "/books" : "/");
      if (key === "R") randomHymn(hymn.book);
      if (key === "P") showPresentation();
      if (key === "D") hymnFiles.pdf && openDocument();
      if (key === "ARROWRIGHT") changeHymn(hymn.id + 1);
      if (key === "ARROWLEFT") changeHymn(hymn.id - 1);
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [
    hymn,
    router,
    presentationMode,
    unlocked,
    showPresentation,
    hymnFiles,
    openDocument,
    changeHymn,
  ]);

  // presentation mode options buttons list
  const [presOptions, showPresOptions] = useState(false);

  return (
    <>
      <Head>
        <title>{hymn ? `${title} / Śpiewniki` : "Śpiewniki"}</title>
      </Head>

      {presentationMode && <Presentation data={hymn} />}

      <div className="container">
        {/* mobile top navbar */}
        <div
          className={`mobileHeader ${styles.mobileHeader} ${
            hideNavbar ? styles.hide : ""
          }`}
        >
          <button style={{ rotate: "90deg" }} onClick={openPrevSearch}>
            <Image
              className="icon"
              alt="back"
              src="/icons/arrow.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>

          <div>
            {hymnFiles.pdf && (
              <button onClick={openDocument}>
                <Image
                  className="icon"
                  alt="pdf_file"
                  src="/icons/document.svg"
                  width={25}
                  height={25}
                  draggable={false}
                />
              </button>
            )}

            <button
              style={{ backgroundColor: "transparent" }}
              onClick={favoriteButton}
            >
              <Image
                className="icon"
                alt="favorite"
                src={`/icons/${isFavorite ? "star_filled" : "star_empty"}.svg`}
                width={25}
                height={25}
                draggable={false}
              />
            </button>
          </div>
        </div>

        <main>
          <div className={styles.container}>
            {/* left side buttons */}
            <div className={`${styles.options} ${styles.leftSide}`}>
              <button onClick={openPrevSearch}>
                <Image
                  className="icon"
                  alt="search"
                  src="/icons/search.svg"
                  width={20}
                  height={20}
                  draggable={false}
                />
                <p>Powrót do wyszukiwania</p>
              </button>

              <button
                title={
                  unlocked
                    ? "Otwórz listę wszystkich śpiewników [B]"
                    : "Przejdź do okna wyboru śpiewników."
                }
                onClick={() => {
                  localStorage.removeItem("prevSearch");
                  router.push(unlocked ? "/books" : "/");
                }}
              >
                <Image
                  className="icon"
                  alt="book"
                  src="/icons/book.svg"
                  width={20}
                  height={20}
                  draggable={false}
                />
                <p>Wybór śpiewników</p>
              </button>
            </div>

            {/* show hymn content */}
            <div className={styles.center}>
              <div
                className={styles.content}
                style={{ fontSize: fontSize.current }}
              >
                {noChords.current && (
                  <span
                    className={styles.noChords}
                    onClick={() => openMenu("settings")}
                  >
                    Brak akordów do wyświetlenia
                  </span>
                )}

                {(isLoading && <div className="loader" />) ||
                  (hymn && (
                    <>
                      <div className={styles.text}>
                        {/* title */}
                        <div className={styles.title}>
                          <p>{hymn.book}</p>
                          <h1>{hymn.song.title}</h1>
                        </div>

                        {/* styling for printing */}
                        <hr className={styles.printLine} />

                        {/* lyrics */}
                        <div className={styles.lyrics}>
                          {hymn.lyrics.map((array: string[], i: number) => (
                            <div key={i} className={styles.verse}>
                              {array.map((verse, j) => {
                                const { showChords } = JSON.parse(
                                  localStorage.getItem("settings") as string
                                );

                                // skip chords line if user don't want to see them
                                if (verse.startsWith(".") && !showChords) {
                                  return;
                                }

                                // lyrics single verse line
                                return (
                                  <p
                                    key={j}
                                    className={
                                      verse.startsWith(".") ? styles.chord : ""
                                    }
                                  >
                                    {verse.replace(/^[\s.]/, "")}
                                  </p>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        {/* additional hymn information */}
                        {(hymn.song.copyright || hymn.song.author) && (
                          <div className={styles.credits}>
                            <h3>{hymn.song.copyright}</h3>
                            <p>{hymn.song.author}</p>
                          </div>
                        )}
                      </div>

                      {hymn.song.linked_songs && (
                        <span className={styles.linked}>
                          <p>Powiązane pieśni:</p>

                          {hymn.song.linked_songs.map(
                            (
                              linked: { book: string; title: string },
                              index: number
                            ) => {
                              const { book, title } = linked;

                              return (
                                <Link
                                  key={index}
                                  title="Przejdź do wybranej pieśni"
                                  href={{
                                    pathname: "/hymn",
                                    query: { book, title },
                                  }}
                                >
                                  {linked.title}
                                </Link>
                              );
                            }
                          )}
                        </span>
                      )}
                    </>
                  ))}
              </div>

              {/* bottom buttons */}
              <div className={styles.controls}>
                <button
                  title="Przejdź do poprzedniej pieśni [←]"
                  className={hideNavbar ? styles.hide : ""}
                  onClick={() => changeHymn(hymn.id - 1)}
                >
                  <Image
                    className={`${styles.previous} icon`}
                    alt="arrow left"
                    src="/icons/arrow.svg"
                    width={30}
                    height={30}
                    draggable={false}
                  />
                  <p>Poprzednia</p>
                </button>

                <button
                  title="Otwórz losową pieśń z wybranego śpiewnika [R]"
                  className={styles.randomButton}
                  onClick={() => randomHymn(hymn.book)}
                >
                  <p>Wylosuj pieśń</p>
                </button>

                <button
                  title="Przejdź do następnej pieśni [→]"
                  onClick={() => changeHymn(hymn.id + 1)}
                  className={hideNavbar ? styles.hide : ""}
                >
                  <p>Następna</p>
                  <Image
                    className={`${styles.next} icon`}
                    alt="arrow right"
                    src="/icons/arrow.svg"
                    width={30}
                    height={30}
                    draggable={false}
                  />
                </button>
              </div>
            </div>

            {/* right side buttons */}
            <div className={styles.options}>
              <div
                className={styles.presentationButton}
                onMouseLeave={() => showPresOptions(false)}
              >
                <button
                  title="Włącz pokaz slajdów pieśni na pełnym ekranie [P]"
                  className={styles.defaultView}
                >
                  <div className={styles.buttonText} onClick={showPresentation}>
                    <Image
                      className="icon"
                      alt="presentation"
                      src="/icons/monitor.svg"
                      width={20}
                      height={20}
                      draggable={false}
                    />
                    <p>Pokaz slajdów</p>
                  </div>

                  <div
                    className={styles.moreArrow}
                    onClick={() => showPresOptions((prev) => !prev)}
                  >
                    <Image
                      className="icon"
                      style={{
                        transform: presOptions ? "rotate(180deg)" : "rotate(0)",
                      }}
                      alt="arrow down"
                      src="/icons/arrow.svg"
                      width={18}
                      height={18}
                      draggable={false}
                    />
                  </div>
                </button>

                <div
                  className={`${styles.presOptions} ${
                    presOptions ? styles.active : ""
                  }`}
                >
                  <button
                    tabIndex={-1}
                    title="Pokaż pokaz slajdów w oddzielnym oknie."
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append("book", book);
                      params.append("title", title);
                      params.append("presentation", "true");

                      window.open(
                        `/hymn?${params.toString()}`,
                        "presentation",
                        "width=960,height=540"
                      );
                    }}
                  >
                    <p>Otwórz w nowym oknie</p>
                  </button>
                </div>
              </div>

              <button
                title={
                  isFavorite
                    ? "Kliknij, aby usunąć pieśń z listy ulubionych."
                    : "Kliknij, aby dodać pieśń do listy ulubionych."
                }
                onClick={favoriteButton}
              >
                <Image
                  className="icon"
                  alt="favorite"
                  src={`/icons/${
                    isFavorite ? "star_filled" : "star_empty"
                  }.svg`}
                  width={20}
                  height={20}
                  draggable={false}
                />
                <p>
                  {isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                </p>
              </button>

              <button
                tabIndex={hymnFiles.pdf ? 0 : -1}
                title="Otwórz dokument PDF pieśni [D]"
                className={`${hymnFiles.pdf ? "" : "disabled"}`}
                onClick={openDocument}
              >
                <Image
                  className="icon"
                  alt="pdf_file"
                  src="/icons/document.svg"
                  width={20}
                  height={20}
                  draggable={false}
                />
                <p>Otwórz PDF</p>
              </button>

              <button title="Skopiuj link pieśni" onClick={shareButton}>
                <Image
                  className="icon"
                  alt="share"
                  src="/icons/link.svg"
                  width={20}
                  height={20}
                  draggable={false}
                />
                <p>Udostępnij</p>
              </button>

              <button
                title="Wydrukuj tekst pieśni"
                onClick={() => !isLoading && window.print()}
              >
                <Image
                  className="icon"
                  alt="print"
                  src="/icons/printer.svg"
                  width={20}
                  height={20}
                  draggable={false}
                />
                <p>Wydrukuj</p>
              </button>
            </div>
          </div>
        </main>
      </div>

      <MobileNavbar />
    </>
  );
}
