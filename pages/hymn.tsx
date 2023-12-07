import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState, useEffect, useRef } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import { Navbar } from "@/components/assets";
import Presentation from "@/components/presentation";

import { bookShortcut } from "@/scripts/bookShortcut";
import { openMenu, randomHymn, shareButton } from "@/scripts/buttons";

interface RouterQuery {
  [key: string]: string; // all params are strings
}

export default function HymnPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  // get params from url
  const router = useRouter();
  const { book, title } = router.query as RouterQuery;

  // hymn data
  const [hymn, setHymn] = useState<any>();
  const [isLoading, setLoading] = useState<boolean>(true);

  // show presentation layout
  const [presentationMode, setPresentationMode] = useState<boolean>();

  const noChords = useRef<boolean>(); // no chords prompt
  const fontSize = useRef<number>(); // set font size

  // hiding mobile navbar on scroll
  const [hideNavbar, setHideNavbar] = useState<boolean>(false);

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
      if (window.scrollY > lastScrollY) setHideNavbar(true);
      else setHideNavbar(false);
      lastScrollY = window.scrollY;
    };
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

  // enable presentation mode
  const [showPresOptions, setShowPresOptions] = useState(false);

  const showPresentation = useCallback(() => {
    // request fullscreen
    const elem = document.documentElement;
    elem.requestFullscreen && elem.requestFullscreen();

    setPresentationMode(true); // show presentation layout

    // add presentation param from url
    const { presentation, ...params } = router.query;
    router.push({ query: { ...params, presentation: true } }, undefined, {
      scroll: false,
      shallow: true,
    });
  }, [router]);

  // add/remove hymn to/from local favorites list
  const [isFavorite, setIsFavorite] = useState(false); // check hymn in favorites list

  const favoriteButton = () => {
    const book = bookShortcut(hymn.book);
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    // remove from favorites list
    if (
      favorites.some((elem: { book: string; id: number }) => {
        return elem.book === book && elem.id === hymn.id;
      })
    ) {
      setIsFavorite(false);
      favorites = favorites.filter((elem: { book: string; id: number }) => {
        return elem.book !== book || elem.id !== hymn.id;
      });

      // add to favorites list
    } else {
      setIsFavorite(true);
      favorites = [
        {
          book,
          id: hymn.id,
          title: hymn.name,
          timestamp: Date.now(),
        },
      ].concat(favorites);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  // check if hymn has connected files
  const [hymnFiles, setHymnFiles] = useState<any>({}); // connected files

  const openDocument = useCallback(() => {
    const { book, id } = hymnFiles.pdf;

    router.push({
      pathname: "/document",
      query: { book, id },
    });
  }, [hymnFiles, router]);

  useEffect(() => {
    if (!hymn) return;

    fetch(`/api/hymnFiles?book=${hymn.book}&title=${hymn.song.title}`)
      .then((res) => res.json())
      .then((data) => setHymnFiles(data))
      .catch((err) => console.error(err));

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(
      favorites.some((element: { book: string; id: number }) => {
        return element.book === router.query.book && element.id === hymn.id;
      })
    );
  }, [router, hymn]);

  // previous & next hymn buttons
  const changeHymn = useCallback(
    (id: number) => {
      // remove searching input from storage
      const fromStorage = localStorage.getItem("prevSearch");
      if (fromStorage) {
        const json = JSON.parse(fromStorage);
        json.search = "";
        localStorage.setItem("prevSearch", JSON.stringify(json));
      }

      if (id < 0) {
        setLoading(false);
        alert("To jest pierwsza pieśń w tym śpiewniku!");
        return;
      }

      axios
        .get(`database/${hymn.book}.json`)
        .then(({ data }) => {
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
    [hymn, router]
  );

  // keyboard shortcuts
  useEffect(() => {
    if (!hymn) return;

    const KeyupEvent = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        presentationMode ||
        router.query.menu
      ) {
        return;
      }

      switch (event.key.toUpperCase()) {
        case "/":
          localStorage.removeItem("prevSearch");
          localStorage.setItem("focusSearchBox", "true");
          router.push("/search");
          break;
        case "B":
          router.push(unlocked ? "/books" : "/");
          break;
        case "R":
          randomHymn(hymn.book);
          break;
        case "P":
          showPresentation();
          break;
        case "D":
          hymnFiles.pdf && openDocument();
          break;
        case "ARROWLEFT":
          changeHymn(hymn.id - 1);
          break;
        case "ARROWRIGHT":
          changeHymn(hymn.id + 1);
          break;
      }
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [
    unlocked,
    router,
    hymn,
    presentationMode,
    hymnFiles,
    openDocument,
    changeHymn,
    showPresentation,
  ]);

  return (
    <>
      <Head>
        <title>{`${hymn ? title : "Ładowanie..."} / Śpiewniki`}</title>
      </Head>

      {presentationMode && <Presentation data={hymn} />}

      <div className="container">
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
                        <div className={styles.title}>
                          <p>{hymn.book}</p>
                          <h1>{hymn.song.title}</h1>
                        </div>

                        <hr className={styles.printLine} />

                        <div className={styles.lyrics}>
                          {hymn.lyrics.map((array: string[], index: number) => {
                            return (
                              <div className={styles.verse} key={index}>
                                {array.map((verse: string, index: number) => {
                                  const settings = JSON.parse(
                                    localStorage.getItem("settings") as string
                                  );

                                  // skip chords line if user don't want to see them
                                  if (
                                    verse.startsWith(".") &&
                                    !settings?.showChords
                                  ) {
                                    return;
                                  }

                                  // display lyrics line
                                  return (
                                    <p
                                      key={index}
                                      className={
                                        verse.startsWith(".")
                                          ? styles.chord
                                          : ""
                                      }
                                    >
                                      {verse.replace(/^[\s.]/, "")}
                                    </p>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>

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
                              return (
                                <Link
                                  key={index}
                                  title="Przejdź do wybranej pieśni"
                                  href={{
                                    pathname: "/hymn",
                                    query: {
                                      book: linked.book,
                                      title: linked.title,
                                    },
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
                  onClick={() => changeHymn(hymn.id - 1)}
                  className={hideNavbar ? styles.hide : ""}
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
                  title="Otwórz losową pieśń ze śpiewnika [R]"
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
                onMouseLeave={() => {
                  setShowPresOptions(false);
                }}
              >
                <button
                  className={styles.defaultView}
                  title="Włącz tryb prezentacji pieśni na pełen ekran [P]"
                  onClick={showPresentation}
                >
                  <div>
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

                  <Image
                    style={{
                      transform: showPresOptions
                        ? "rotate(180deg)"
                        : "rotate(0)",
                    }}
                    className={`${styles.moreArrow} icon`}
                    alt="arrow down"
                    src="/icons/arrow.svg"
                    width={20}
                    height={20}
                    draggable={false}
                    onMouseEnter={() => {
                      setShowPresOptions(true);
                    }}
                  />
                </button>

                <div
                  className={`${styles.presOptions} ${
                    showPresOptions ? styles.active : ""
                  }`}
                >
                  <button
                    tabIndex={-1}
                    title="Otwórz prezentację w oddzielnym, mniejszym oknie."
                    onClick={() => {
                      window.open(
                        `/hymn?book=${book}&title=${title}&presentation=true`,
                        "presentation",
                        "width=960,height=540"
                      );
                    }}
                  >
                    <p>Otwórz w osobnym oknie</p>
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
                className={`${hymnFiles.pdf ? "" : "disabled"}`}
                tabIndex={hymnFiles.pdf ? 0 : -1}
                title="Otwórz plik PDF pieśni [N]"
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

      <Navbar />
    </>
  );
}
