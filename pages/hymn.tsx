import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useState, useEffect, useRef } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import { Header, Navbar } from "@/components/elements";
import Menu from "@/components/menu";
import Presentation from "@/components/presentation";

import bookShortcut from "@/scripts/bookShortcut";
import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

export default function HymnPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  const router = useRouter();
  const { book, title } = router.query as { book: string; title: string };

  const [isLoading, setLoading] = useState(true);
  const [hymn, setHymn] = useState<any>();

  const noChords = useRef(false);

  // fetch data on startup
  useEffect(() => {
    if (!router.isReady) return;

    // url errors handling
    if (book && !bookShortcut(book)) router.push("/404");
    const params = Object.keys(router.query);
    if (!(params.includes("book") && params.includes("title"))) {
      router.push("/404");
    }

    // get all hymn data
    axios
      .get(`database/${bookShortcut(book)}.json`)
      .then(({ data }) => {
        const hymn = data.find((elem: any) => elem.name === title);
        hymn.lyrics = Object.values(hymn.song.lyrics);

        // check if hymn has chords
        if (localStorage.getItem("showChords")) {
          const includesChords = hymn.lyrics.some((array: string[]) => {
            return array.some((verse: string) => verse.startsWith("."));
          });

          if (!includesChords) noChords.current = true;
          else noChords.current = false;
        } else noChords.current = false;

        // linked songs format
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
      .catch((err) => console.error(err));
  }, [router, book, title]);

  // previous & next hymn buttons
  const changeHymn = useCallback(
    (id: number, operator: string) => {
      setLoading(true);

      let position = 0;
      switch (operator) {
        case "prev":
          position = id - 1;
          break;
        case "next":
          position = id + 1;
          break;
      }

      if (position < 0) {
        setLoading(false);
        alert("To jest pierwsza pieśń w tym śpiewniku!");
        return;
      }

      axios
        .get(`database/${hymn.book}.json`)
        .then(({ data }) => {
          if (position >= data.length) {
            setLoading(false);
            alert("To jest ostatnia pieśń w tym śpiewniku!");
            return;
          }

          const hymn = data.find((elem: any) => elem.id === position);

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
          setLoading(false);
        });
    },
    [hymn, router]
  );

  const randomBtn = (book: string) => {
    setLoading(true);
    randomHymn(book);
  };

  // hide bottom navbar on mobile
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const navigation = () => {
      if (window.scrollY > lastScrollY) setHideNavbar(true);
      else setHideNavbar(false);
      lastScrollY = window.scrollY;
    };

    // handle presentation layout on fullscreen mode
    const presentation = () => {
      if (document.fullscreenElement)
        document.documentElement.style.overflow = "hidden";
      else {
        setSlideshowMode(false);
        document.documentElement.style.overflow = "";
      }
    };

    document.addEventListener("scroll", navigation);
    document.addEventListener("fullscreenchange", presentation);
    return () => {
      document.removeEventListener("scroll", navigation);
      document.removeEventListener("fullscreenchange", presentation);
    };
  }, []);

  // show presentation layout
  const [slideshowMode, setSlideshowMode] = useState(false);

  const slideshowBtn = () => {
    setSlideshowMode(true);
    const elem = document.documentElement;
    elem.requestFullscreen && elem.requestFullscreen();
  };

  // connected files
  const [hymnFiles, setHymnFiles] = useState<any>({});

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
  }, [hymn]);

  const [fontSize, setFontSize] = useState("21"); // set page font size
  const [favHymn, setFavHymn] = useState(false); // check if hymn is in favorites

  useEffect(() => {
    if (!hymn) return;

    setFontSize(localStorage.getItem("fontSize") || "21");

    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (
      favorites.some((element: { book: string; id: number }) => {
        return element.book === router.query.book && element.id === hymn.id;
      })
    ) {
      setFavHymn(true);
    } else setFavHymn(false);

    // keyboard shortcuts
    const KeyupEvent = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        slideshowMode ||
        router.query.menu
      ) {
        return;
      }

      switch (event.key.toUpperCase()) {
        case "/":
          localStorage.setItem("focusSearchBox", "true");
          router.push("/search");
          break;
        case "B":
          unlocked ? router.push("/books") : router.push("/");
          break;
        case "R":
          randomBtn(hymn.book);
          break;
        case "P":
          slideshowBtn();
          break;
        case "N":
          hymnFiles.pdf && openDocument();
          break;
        case "ARROWLEFT":
          changeHymn(hymn.id, "prev");
          break;
        case "ARROWRIGHT":
          changeHymn(hymn.id, "next");
          break;
      }
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [
    hymn,
    router,
    slideshowMode,
    unlocked,
    hymnFiles,
    openDocument,
    changeHymn,
  ]);

  // add/remove hymn to/from local favorites list
  const favoriteButton = () => {
    const book = bookShortcut(hymn.book);
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    // remove from favorites list
    if (
      favorites.some((elem: { book: string; id: number }) => {
        return elem.book === book && elem.id === hymn.id;
      })
    ) {
      setFavHymn(false);
      favorites = favorites.filter((elem: { book: string; id: number }) => {
        return elem.book !== book || elem.id !== hymn.id;
      });

      // add to favorites list
    } else {
      setFavHymn(true);
      favorites = [
        {
          book,
          id: hymn.id,
          title: hymn.name,
        },
      ].concat(favorites);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  // back to search page with specific book
  const backButton = () => {
    localStorage.setItem("focusSearchBox", "true");
    const prevSearch = localStorage.getItem("prevSearch");

    if (!prevSearch) {
      router.push("/search");
    } else {
      router.push({
        pathname: "/search",
        query: { book: prevSearch },
      });
    }
  };

  return (
    <>
      <Head>
        <title>
          {hymn ? `${title} / Śpiewniki` : "Ładowanie... / Śpiewniki"}
        </title>
      </Head>

      <Menu />
      {slideshowMode && <Presentation data={hymn} />}

      <Header
        buttons={
          unlocked
            ? {
                leftSide: {
                  title: "Powrót do wyszukiwania",
                  icon: "arrow",
                  onclick: () => backButton(),
                },
              }
            : {
                leftSide: {
                  title: "Powrót do wyszukiwania",
                  icon: "arrow",
                  onclick: () => backButton(),
                },
                rightSide: {
                  title: "Nastraży.org",
                  onclick: () => router.push("https://nastrazy.org/"),
                },
              }
        }
      />

      <div className="container">
        <div
          className={`mobile-header ${styles.navigation} ${
            hideNavbar ? styles.hide : ""
          }`}
        >
          <button
            className="left-button"
            style={{ rotate: "90deg" }}
            onClick={backButton}
          >
            <Image
              className={`${styles.back} icon`}
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

            <button onClick={favoriteButton}>
              <Image
                className="icon"
                alt="favorite"
                src={`/icons/${favHymn ? "star_filled" : "star_empty"}.svg`}
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
              <button
                title={
                  unlocked
                    ? "Otwórz listę wszystkich śpiewników [B]"
                    : "Przejdź do wyboru śpiewników"
                }
                onClick={() => {
                  return unlocked ? router.push("/books") : router.push("/");
                }}
              >
                <Image
                  className="icon"
                  alt="book"
                  src="/icons/book.svg"
                  width={20}
                  height={20}
                />
                <p>Wybierz śpiewnik</p>
              </button>

              <button
                title="Pokaż listę ulubionych pieśni [F]"
                onClick={() => replaceLink("favorites")}
              >
                <Image
                  className="icon"
                  alt="list"
                  src="/icons/list.svg"
                  width={20}
                  height={20}
                />
                <p>Lista ulubionych</p>
              </button>

              <button
                title="Pokaż ustawienia aplikacji [S]"
                onClick={() => replaceLink("settings")}
              >
                <Image
                  className="icon"
                  alt="settings"
                  src="/icons/settings.svg"
                  width={20}
                  height={20}
                />
                <p>Ustawienia</p>
              </button>

              <button
                className="desktop-only disabled"
                title="Pokaż listę skrótów klawiszowych"
                onClick={() => replaceLink("shortcuts")}
              >
                <Image
                  className="icon"
                  alt="shortcuts"
                  src="/icons/keyboard.svg"
                  width={20}
                  height={20}
                />
                <p>Skróty klawiszowe</p>
              </button>
            </div>

            {/* show all hymn parameters */}
            <div className={styles.center}>
              <div
                className={styles.content}
                style={{
                  fontSize: `${fontSize}px`,
                }}
              >
                {noChords.current && (
                  <span
                    className={styles.noChords}
                    onClick={() => replaceLink("settings")}
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
                                  // skip chords line if user don't want to see them
                                  if (
                                    verse.startsWith(".") &&
                                    !localStorage.getItem("showChords")
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
                                  title="Kliknij, aby przejść do wybranej pieśni."
                                  onClick={() => setLoading(true)}
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
                  onClick={() => changeHymn(hymn.id, "prev")}
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
                  title="Otwórz losową pieśń [R]"
                  className={styles.randomButton}
                  onClick={() => randomBtn(hymn.book)}
                >
                  <p>Wylosuj pieśń</p>
                </button>

                <button
                  title="Przejdź do następnej pieśni [→]"
                  onClick={() => changeHymn(hymn.id, "next")}
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
              <button
                title="Włącz prezentację pieśni na pełen ekran [P]"
                onClick={slideshowBtn}
              >
                <Image
                  className="icon"
                  alt="presentation"
                  src="/icons/presentation.svg"
                  width={20}
                  height={20}
                />
                <p>Pokaz slajdów</p>
              </button>

              <button
                title={
                  favHymn
                    ? "Kliknij, aby usunąć pieśń z listy ulubionych"
                    : "Kliknij, aby dodać pieśń do listy ulubionych"
                }
                onClick={favoriteButton}
              >
                <Image
                  className="icon"
                  alt="favorite"
                  src={`/icons/${favHymn ? "star_filled" : "star_empty"}.svg`}
                  width={20}
                  height={20}
                />
                <p>{favHymn ? "Usuń z ulubionych" : "Dodaj do ulubionych"}</p>
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
