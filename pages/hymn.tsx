import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import MobileNavbar from "@/components/mobileNavbar";
import Presentation from "@/components/presentation";
import { bookShortcut } from "@/scripts/availableBooks";
import { randomHymn, shareButton } from "@/scripts/buttons";
import HymnTypes from "@/scripts/hymnTypes";

export default function HymnPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  // router queries
  const router = useRouter();
  const { book, title, presentation } = router.query as {
    [key: string]: string;
  };

  // hymn data
  const [hymn, setHymn] = useState<HymnTypes>();
  const [isLoading, setLoading] = useState(true);

  const noChords = useRef<boolean>(); // no chords prompt
  const fontSize = useRef<number>(); // set font size

  const [hideControls, setHideControls] = useState(false); // hiding mobile navbar on scroll

  // settings on page load
  useEffect(() => {
    if (!router.isReady) return;

    axios
      .get(`database/${bookShortcut(book)}.json`) // get all hymn data
      .then(({ data }) => {
        const settings = JSON.parse(localStorage.getItem("settings") as string);

        // define new hymn data
        const hymn = data.find((elem: HymnTypes) => elem.name === title);
        hymn.lyrics = Object.values(hymn.song.lyrics);

        // check if hymn file has chords
        const includesChords = hymn.lyrics.some((array: string[]) => {
          return array.some((verse: string) => verse.startsWith("."));
        });

        noChords.current = settings.showChords && !includesChords; // no chords span prompt
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

        setHymn(hymn);
        setLoading(false);
      })
      .catch((err) => {
        // hymn not found
        console.error(err);
        router.push("/404");
      });

    // mobile navbar hide on scroll event
    let lastScrollY = window.scrollY;

    document.onscroll = () => {
      if (window.scrollY - lastScrollY > 50) {
        setHideControls(true);
      }
      if (lastScrollY - window.scrollY > 65 || window.scrollY < 30) {
        setHideControls(false);
      }
    };

    document.onscrollend = () => (lastScrollY = window.scrollY);
  }, [router, book, title]);

  const [hymnFiles, setHymnFiles] = useState<any>({});
  const [isFavorite, setFavorite] = useState(false);

  // fetch additional data
  useEffect(() => {
    if (!hymn) return;

    fetch(`/api/hymnFiles?book=${hymn.book}&title=${hymn.song.title}`)
      .then((res) => res.json())
      .then((data) => setHymnFiles(data))
      .catch((err) => console.error(err));

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    setFavorite(
      favorites.some((elem: { book: string; id: number }) => {
        return elem.book === book && elem.id === hymn.id;
      })
    );
  }, [hymn, book]);

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

  // add/remove hymn to/from favorites
  const favoriteButton = () => {
    if (!hymn) return;

    const bookName = bookShortcut(hymn.book);
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    // remove
    if (
      favorites.some((elem: { book: string; id: number }) => {
        return elem.book === bookName && elem.id === hymn.id;
      })
    ) {
      setFavorite(false);
      favorites = favorites.filter((elem: { book: string; id: number }) => {
        return elem.book !== bookName || elem.id !== hymn.id;
      });

      // add
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

  // open assigned pdf file
  const openDocument = useCallback((file: any) => {
    const { book, id } = file;
    Router.push({ pathname: "/document", query: { book, id } });
  }, []);

  // previous/next hymn buttons
  const changeHymn = useCallback((hymn: HymnTypes, id: number) => {
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

        const hymn = data.find((elem: { id: number }) => elem.id === id);

        Router.push({
          pathname: "/hymn",
          query: {
            book: bookShortcut(hymn.book),
            title: hymn.name,
          },
        });
      })
      .catch((err) => {
        console.error(err);
        Router.back();
      });
  }, []);

  const showPresentation = useCallback((hymn: HymnTypes | undefined) => {
    if (!hymn) return;

    // set presentation mode
    const { menu, ...params } = Router.query;

    Router.push(
      // url
      { query: { ...params, presentation: true } },
      // as
      undefined,
      // options
      { shallow: true }
    );

    // open in fullscreen
    const elem = document.documentElement;
    elem.requestFullscreen && elem.requestFullscreen();

    document.onfullscreenchange = () => {
      if (document.fullscreenElement) {
        document.documentElement.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "";
        Router.back();
      }
    };
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const KeyupEvent = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.metaKey ||
        router.query.menu ||
        router.query.presentation ||
        !hymn
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === "/") {
        localStorage.removeItem("prevSearch");
        localStorage.setItem("focusSearchBox", "true");
        router.push("/search");
      }
      if (key === "B") router.push(unlocked ? "/books" : "/");
      if (key === "R") randomHymn(hymn.book);
      if (key === "P") showPresentation(hymn);
      if (key === "D") openDocument(hymnFiles.pdf);
      if (key === "ARROWLEFT") changeHymn(hymn, hymn.id - 1);
      if (key === "ARROWRIGHT") changeHymn(hymn, hymn.id + 1);
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [
    unlocked,
    router,
    hymn,
    hymnFiles,
    showPresentation,
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

      {hymn && presentation && <Presentation data={hymn} />}

      <main style={{ padding: 0 }}>
        <div className={`${styles.title} ${hideControls ? styles.hide : ""}`}>
          <button onClick={openPrevSearch}>
            <Image
              style={{ rotate: "90deg" }}
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
              <button onClick={() => openDocument(hymnFiles.pdf)}>
                <Image
                  className="icon"
                  alt="pdf"
                  src="/icons/document.svg"
                  width={25}
                  height={25}
                  draggable={false}
                />
              </button>
            )}

            <button onClick={favoriteButton}>
              <Image
                className="icon"
                alt="favorite"
                src={`/icons/star_${isFavorite ? "filled" : "empty"}.svg`}
                width={25}
                height={25}
                draggable={false}
              />
            </button>
          </div>
        </div>

        <div className={styles.container}>
          {/* left side buttons */}
          <div className={`${styles.options} ${styles.leftSide}`}>
            <button onClick={openPrevSearch}>
              <Image
                className="icon"
                alt="search"
                src="/icons/search.svg"
                width={22}
                height={22}
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
                width={22}
                height={22}
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
                <span className={styles.noChords}>
                  Brak akordów do wyświetlenia
                </span>
              )}

              {isLoading ||
                (hymn && (
                  <>
                    <div className={styles.text}>
                      {/* title */}
                      <div className={styles.hymnTitle}>
                        <p>{hymn.book}</p>
                        <h1>{hymn.song.title}</h1>
                      </div>

                      {/* styling for printing */}
                      <hr className={styles.printLine} />

                      {/* lyrics */}
                      <div className={styles.lyrics}>
                        {hymn.lyrics &&
                          hymn.lyrics.map((array, i) => {
                            const id = Object.keys(hymn.song.lyrics)[i];

                            return (
                              <div
                                key={i}
                                id={id}
                                className={`
                                  ${styles.verse}
                                  ${id.includes("T") && styles.italic}
                                `}
                              >
                                {array.map((verse, j) => {
                                  const isChord = verse.startsWith(".");
                                  const { showChords } = JSON.parse(
                                    localStorage.getItem("settings") as string
                                  );

                                  // skip chords line if user don't want to see them
                                  if (isChord && !showChords) return;

                                  const line = verse
                                    .replace(/^[\s.]/, "") // first space
                                    .replace(/(?<=\[:) | (?=:\])/g, "\u00A0"); // spaces between brackets

                                  // lyrics single verse line
                                  return (
                                    <p
                                      key={j}
                                      className={isChord ? styles.chord : ""}
                                    >
                                      {line}
                                    </p>
                                  );
                                })}
                              </div>
                            );
                          })}
                      </div>

                      {/* additional hymn information */}
                      {(hymn.song.copyright || hymn.song.author) && (
                        <div className={styles.credits}>
                          {hymn.song.copyright && <p>{hymn.song.copyright}</p>}
                          {hymn.song.author && <p>{hymn.song.author}</p>}
                        </div>
                      )}
                    </div>

                    {hymn.song.linked_songs && (
                      <span className={styles.linked}>
                        <p className={styles.name}>Powiązane pieśni:</p>

                        {hymn.song.linked_songs.map((linked, i) => {
                          const { book, title } = linked;

                          return (
                            <Link
                              key={i}
                              href={{
                                pathname: "/hymn",
                                query: { book, title },
                              }}
                              title="Przejdź do wybranej pieśni"
                            >
                              <p>{linked.title}</p>
                            </Link>
                          );
                        })}
                      </span>
                    )}
                  </>
                ))}
            </div>

            {/* bottom buttons */}
            {hymn && (
              <div className={styles.controls}>
                <button
                  title="Przejdź do poprzedniej pieśni [←]"
                  className={hideControls ? styles.hide : ""}
                  onClick={() => changeHymn(hymn, hymn.id - 1)}
                >
                  <Image
                    className={`${styles.previous} icon`}
                    alt="left"
                    src="/icons/arrow.svg"
                    width={20}
                    height={20}
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
                  className={hideControls ? styles.hide : ""}
                  onClick={() => changeHymn(hymn, hymn.id + 1)}
                >
                  <p>Następna</p>
                  <Image
                    className={`${styles.next} icon`}
                    alt="right"
                    src="/icons/arrow.svg"
                    width={20}
                    height={20}
                    draggable={false}
                  />
                </button>
              </div>
            )}
          </div>

          {/* right side buttons */}
          <div className={styles.options}>
            <div
              className={styles.presentationButton}
              onMouseLeave={() => showPresOptions(false)}
            >
              <button
                title="Włącz prezentację wybranej pieśni na pełnym ekranie [P]"
                className={styles.default}
              >
                <div
                  className={styles.buttonText}
                  onClick={() => showPresentation(hymn)}
                >
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
                    style={{ rotate: presOptions ? "180deg" : "0deg" }}
                    className="icon"
                    alt="more"
                    src="/icons/arrow.svg"
                    width={18}
                    height={18}
                    draggable={false}
                  />
                </div>
              </button>

              <div
                className={`${styles.list} ${presOptions ? styles.active : ""}`}
              >
                <button
                  tabIndex={-1}
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.append("book", book);
                    params.append("title", title);

                    window.open(
                      `/presentation?${params.toString()}`,
                      "presentation",
                      "width=960,height=540"
                    );

                    localStorage.setItem("presWindow", "true");
                  }}
                >
                  <p>Otwórz w nowym oknie</p>
                </button>
              </div>
            </div>

            <button
              title={
                isFavorite
                  ? "Kliknij, aby usunąć pieśń z listy ulubionych"
                  : "Kliknij, aby dodać pieśń do listy ulubionych"
              }
              onClick={favoriteButton}
            >
              <Image
                className="icon"
                alt="favorite"
                src={`/icons/${isFavorite ? "star_filled" : "star_empty"}.svg`}
                width={20}
                height={20}
                draggable={false}
              />
              <p>{isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}</p>
            </button>

            <button
              tabIndex={hymnFiles.pdf ? 0 : -1}
              title="Otwórz dokument PDF wybranej pieśni [D]"
              className={hymnFiles.pdf ? "" : "disabled"}
              onClick={() => openDocument(hymnFiles.pdf)}
            >
              <Image
                className="icon"
                alt="pdf"
                src="/icons/document.svg"
                width={20}
                height={20}
                draggable={false}
              />
              <p>Otwórz PDF</p>
            </button>

            <button
              title="Skopiuj link do wybranej pieśni"
              onClick={shareButton}
            >
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
              title="Wydrukuj tekst wybranej pieśni"
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

      <MobileNavbar />
    </>
  );
}
