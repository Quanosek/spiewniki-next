import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useState, useEffect } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

import Presentation from "@/components/presentation";
import Menu from "@/components/menu";
import Navbar from "@/components/navbar";

export default function HymnPage() {
  const router = useRouter();

  // operators
  const [hymn, setHymn] = useState<any>(); // all hymn data

  const [fontSize, setFontSize] = useState("21"); // displayed font size
  const [hideNavigators, setHideNavigators] = useState(false); // navigator elements style on scroll
  const [presentation, setPresentation] = useState(false); // navigator elements style on scroll
  const [inFavorites, setInFavorites] = useState(false); // current hymn is n favorites array

  // show placeholder element
  const clearHymn = useCallback(() => {
    setHymn(null);
    window.scrollTo(0, 0);
  }, []);

  // handling random buttons
  const randomButtonHandler = useCallback(() => {
    clearHymn();
    randomHymn(router.query.book);
    localStorage.setItem("searchPage", router.query.book as string);
  }, [clearHymn, router]);

  // showing presentation layout
  const presentationButton = useCallback(() => {
    setPresentation(true);
    const elem = document.documentElement;
    elem.requestFullscreen && elem.requestFullscreen();
  }, []);

  // back to specific book search page
  const backButton = useCallback(() => {
    localStorage.setItem("focusSearchBox", "true");
    const book = localStorage.getItem("searchPage");

    if (!book || book == "all") {
      router.push("/search");
    } else {
      router.push({
        pathname: "/search",
        query: { book },
      });
    }
  }, [router]);

  // previous & next hymn button
  const changeHymn = useCallback(
    (id: number, operator: string) => {
      let position = 0;

      switch (operator) {
        case "prev":
          position = id - 1;
          break;
        case "next":
          position = id + 1;
          break;
      }

      axios
        .get("/api/xml", {
          params: { book: router.query.book },
        })
        .then(({ data }) => {
          if (position < 0 || position >= data.length) return;

          clearHymn();

          router.push({
            pathname: "/hymn",
            query: {
              book: router.query.book,
              title: data[position].title,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          router.back();
        });
    },
    [router, clearHymn]
  );

  const favoriteButon = useCallback(
    (params: { title: string; book: string; id: number }) => {
      let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

      if (
        favorites.some(
          (element: { title: string; book: string; id: number }) =>
            element.title === params.title &&
            element.book === params.book &&
            element.id === params.id
        )
      ) {
        setInFavorites(false);

        favorites = favorites.filter(
          (element: { title: string; book: string; id: number }) =>
            element.title !== params.title ||
            element.book !== params.book ||
            element.id !== params.id
        );
      } else {
        setInFavorites(true);
        favorites.push(params);
      }

      localStorage.setItem("favorites", JSON.stringify(favorites));
    },
    []
  );

  useEffect(() => {
    if (!hymn) return;

    // setting displayed font size
    setFontSize(
      localStorage.getItem("fontSize")
        ? (localStorage.getItem("fontSize") as string)
        : "21"
    );

    // mobile random button fix
    const randomButton = document.getElementById(
      "randomButton"
    ) as HTMLButtonElement;
    randomButton.addEventListener("click", clearHymn);

    // handle favorites
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (
      favorites.some(
        (element: { title: string; book: string; id: number }) =>
          element.title === router.query.title &&
          element.book === router.query.book &&
          element.id === hymn.id[0]
      )
    ) {
      setInFavorites(true);
    } else setInFavorites(false);

    // handle keyboard shortcuts
    function handleKeyPress(event: KeyboardEvent) {
      if (!(presentation || router.query.menu)) {
        switch (event.key.toUpperCase()) {
          case "R":
            return hymn && randomButtonHandler();
          case "P":
            return hymn && presentationButton();
          case "ARROWLEFT":
            return changeHymn(hymn.id[0], "prev");
          case "ARROWRIGHT":
            return changeHymn(hymn.id[0], "next");
        }
      }
    }

    document.addEventListener("keyup", handleKeyPress);
    return () => document.removeEventListener("keyup", handleKeyPress);
  }, [
    hymn,
    router,
    changeHymn,
    clearHymn,
    presentation,
    presentationButton,
    randomButtonHandler,
  ]);

  useEffect(() => {
    if (!router.isReady) return;
    const { book, title } = router.query;

    // redirect on invalid url
    if (!title)
      router.push({
        pathname: "/search",
        query: { book },
      });
    if (!book) router.push("/search");

    // get hymn data
    (() => {
      axios
        .get("/api/xml", {
          params: { book, title },
        })
        .then(({ data }) => setHymn(data[0]))
        .catch((err) => {
          console.error(err);

          if (book) {
            router.push({
              pathname: "/search",
              query: { book },
            });
          } else router.push("/search");
        });
    })();

    // hide navigation on scroll
    let lastScrollY = window.scrollY;
    function hideNavigators() {
      if (window.scrollY > lastScrollY) setHideNavigators(true);
      else setHideNavigators(false);
      lastScrollY = window.scrollY;
    }

    // fullscreen overflow fix for presentation layout
    function fullscreenHandler() {
      if (document.fullscreenElement)
        document.documentElement.style.overflow = "hidden";
      else {
        setPresentation(false);
        document.documentElement.style.overflow = "";
      }
    }

    // events handlers
    document.addEventListener("scroll", hideNavigators);
    document.addEventListener("fullscreenchange", fullscreenHandler);
    return () => {
      document.removeEventListener("scroll", hideNavigators);
      document.removeEventListener("fullscreenchange", fullscreenHandler);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>
          {hymn ? `${router.query.title} / Śpiewniki` : "Śpiewniki"}
        </title>
      </Head>

      {hymn && presentation && <Presentation data={hymn} />}
      <Menu />

      {/* top navbar */}
      <div
        id="topNavbar"
        className={`${styles.topNavbar} ${hideNavigators ? styles.hide : ""}`}
      >
        <button onClick={backButton}>
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
          <button onClick={shareButton}>
            <Image
              className="icon"
              alt="share"
              src="/icons/link.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>

          <button
            className="disabled"
            onClick={() => {
              //
              //
              //
            }}
          >
            <Image
              className="icon"
              alt="music"
              src="/icons/note.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>

          <button
            onClick={() => {
              if (!hymn) return;
              return favoriteButon({
                title: router.query.title as string,
                book: router.query.book as string,
                id: hymn.id[0],
              });
            }}
          >
            <Image
              className="icon"
              alt="favorite"
              src={`/icons/${inFavorites ? "star_filled" : "star_empty"}.svg`}
              width={25}
              height={25}
              draggable={false}
            />
          </button>
        </div>
      </div>

      <div className="backArrow">
        <button onClick={backButton}>
          <Image
            className="icon"
            alt="arrow"
            src="/icons/arrow.svg"
            width={20}
            height={20}
          />
          <p>Powrót</p>
        </button>
      </div>

      <main>
        <div className={styles.container}>
          {/* left side buttons */}
          <div className={`${styles.options} ${styles.leftSide}`}>
            <button
              title="Włącz prezentację pieśni na pełen ekran [P]"
              onClick={() => {
                if (!hymn) return;
                presentationButton();
              }}
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
              title="Otwórz listę wszystkich dostępnych śpiewników"
              onClick={() => router.push("/books")}
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
              onClick={() => {
                if (!hymn) return;
                return favoriteButon({
                  title: router.query.title as string,
                  book: router.query.book as string,
                  id: hymn.id[0],
                });
              }}
            >
              <Image
                className="icon"
                alt="favorite"
                src={`/icons/${inFavorites ? "star_filled" : "star_empty"}.svg`}
                width={20}
                height={20}
              />
              <p>{inFavorites ? "Usuń z ulubionych" : "Dodaj do ulubionych"}</p>
            </button>
          </div>

          {/* show all hymn parameters */}
          <div className={styles.center}>
            <div
              className={styles.text}
              style={{
                fontSize: `${fontSize}px`,
              }}
            >
              {!hymn && <div className="loader" />}
              {hymn && (
                <>
                  <div className={styles.title}>
                    <h1>{hymn.title}</h1>
                    <h2>{hymn.book}</h2>
                  </div>

                  <hr className={styles.printLine} />

                  <div className={styles.lyrics}>
                    {hymn.lyrics.map((verses: string[], index: number) => {
                      return (
                        <div className={styles.verse} key={index}>
                          {verses.map((verse: string, index: number) => {
                            if (
                              verse.startsWith(".") &&
                              !localStorage.getItem("showChords")
                            ) {
                              return;
                            }

                            return (
                              <p
                                key={index}
                                className={
                                  verse.startsWith(".") ? styles.chord : ""
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

                  <div className={styles.credits}>
                    <h3>{hymn.copyright}</h3>
                    <p>{hymn.author}</p>
                  </div>
                </>
              )}
            </div>

            {/* bottom buttons */}
            <div id="controls" className={styles.controls}>
              <button
                title="Przejdź do poprzedniej pieśni [←]"
                onClick={() => changeHymn(hymn.id[0], "prev")}
                className={hideNavigators ? styles.hide : ""}
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
                onClick={randomButtonHandler}
              >
                <p>Wylosuj pieśń</p>
              </button>

              <button
                title="Przejdź do następnej pieśni [→]"
                onClick={() => changeHymn(hymn.id[0], "next")}
                className={hideNavigators ? styles.hide : ""}
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
              title="Pokaż listę ulubionych pieśni [F]"
              onClick={() => replaceLink("favorite")}
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
              className="disabled"
              title="Pokaż nuty pieśni w formacie PDF"
              onClick={() => {
                //
                //
                //
              }}
            >
              <Image
                className="icon"
                alt="document"
                src="/icons/document.svg"
                width={20}
                height={20}
              />
              <p>Pokaż nuty</p>
            </button>

            <button
              className="disabled"
              title="Odtwórz ścieżkę audio pieśni"
              onClick={() => {
                //
                //
                //
              }}
            >
              <Image
                className="icon"
                alt="music"
                src="/icons/note.svg"
                width={20}
                height={20}
              />
              <p>Odtwórz audio</p>
            </button>

            <button title="Skopiuj link do pieśni" onClick={shareButton}>
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
              onClick={() => hymn && window.print()}
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

      {/* bottom navbar */}
      <Navbar setup={"hymn"} />
    </>
  );
}
