import Head from "next/head";
import Image from "next/image";
import router, { useRouter } from "next/router";
import { useCallback, useState, useEffect, useRef } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import {
  menuLink,
  shareButton,
  randomButton,
  presentationButton,
} from "@/scripts/buttons";

import Presentation from "@/components/presentation";
import Menu from "@/components/menu";
import Navbar from "@/components/navbar";

export default function HymnPage() {
  const router = useRouter();

  const [hymn, setHymn] = useState<any>(); // all hymn data
  const hymnID = useRef<number>(hymn?.id); // current hymn id
  const fontSize = useRef<string>(); // default font size

  const clearHymn = useCallback(() => {
    setHymn(null);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const { book, title } = router.query as any;
    // redirect on invalid url
    if (!title)
      router.push({
        pathname: "/search",
        query: { book },
      });
    if (!book) router.push("/");

    // get hymn data
    (async () => {
      axios
        .get("/api/xml", {
          params: { book, title },
        })
        .then(({ data }) => {
          const hymn = data[0];

          hymnID.current = parseInt(hymn.id);
          setHymn(hymn);
        })
        .catch((err) => {
          console.error(err);
          router.push("/search");
        });
    })();

    // set change displayed font size
    fontSize.current = localStorage.getItem("fontSize")
      ? (localStorage.getItem("fontSize") as string)
      : "21";

    // handle keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case "R":
          clearHymn();
          break;
        // case "P":
        //   presentationButton();
        //   break;
        case "ARROWLEFT":
          changeHymn(hymnID.current, "prev", clearHymn);
          break;
        case "ARROWRIGHT":
          changeHymn(hymnID.current, "next", clearHymn);
          break;
      }
    };

    // keyboard events
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [router, hymnID, fontSize, clearHymn]);

  // set default title
  const pageTitle = hymn ? `${router.query.title} / Śpiewniki` : "Śpiewniki";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Presentation hymn={hymn} />
      <Menu />

      {/* top navbar */}
      <div className={styles.navbar}>
        <button onClick={backButton}>
          <Image
            className={`${styles.back} icon`}
            alt="wstecz"
            src="/icons/arrow.svg"
            width={30}
            height={30}
          />
        </button>

        <div>
          <button onClick={shareButton}>
            <Image
              className="icon"
              alt="ulubione"
              src="/icons/link.svg"
              width={30}
              height={30}
            />
          </button>

          <button className="disabledTemporary" onClick={() => {}}>
            <Image
              className="icon"
              alt="ulubione"
              src="/icons/star_empty.svg"
              width={30}
              height={30}
            />
          </button>
        </div>
      </div>

      <div className="backArrow">
        <button
          onClick={() => {
            localStorage.setItem("focusSearchBox", "true");
            backButton();
          }}
        >
          <Image
            className="icon"
            alt="strzałka"
            src="/icons/arrow.svg"
            width={20}
            height={20}
          />
          <p>Powrót do wyszukiwania</p>
        </button>
      </div>

      <main>
        <div className={styles.container}>
          {/* left side buttons */}
          <div className={`${styles.options} ${styles.leftSide}`}>
            <button onClick={() => router.push("/")}>
              <Image
                className="icon"
                alt="dom"
                src="/icons/home.svg"
                width={20}
                height={20}
              />
              <p>Strona główna</p>
            </button>

            <button onClick={() => router.push("/books")}>
              <Image
                className="icon"
                alt="śpiewnik"
                src="/icons/book.svg"
                width={20}
                height={20}
              />
              <p>Wybierz śpiewnik</p>
            </button>

            <button className="disabledTemporary" onClick={() => {}}>
              <Image
                className="icon"
                alt="dom"
                src="/icons/star_empty.svg"
                width={20}
                height={20}
              />
              <p>Dodaj do ulubionych</p>
            </button>
          </div>

          {/* show all hymn parameters */}
          <div className={styles.center}>
            <div
              className={styles.text}
              style={{
                fontSize: `${fontSize.current}px`,
              }}
            >
              {(!hymn && <div className="loader" />) ||
                (hymn && (
                  <>
                    <div className={styles.title}>
                      <h1>{hymn.title}</h1>
                      <h2>{hymn.book}</h2>
                    </div>

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
                ))}
            </div>

            {/* bottom buttons */}
            <div className={styles.controls}>
              <button
                title="Przejdź do poprzedniej pieśni [←]"
                onClick={() => changeHymn(hymnID.current, "prev", clearHymn)}
              >
                <Image
                  className={`${styles.previous} icon`}
                  alt="strzałka w lewo"
                  src="/icons/arrow.svg"
                  width={15}
                  height={15}
                />

                <p>Poprzednia</p>
              </button>

              <button
                title="Otwórz losową pieśń [R]"
                className={styles.randomButton}
                onClick={() => {
                  clearHymn();
                  randomButton();
                }}
              >
                <p>Wylosuj pieśń</p>
              </button>

              <button
                title="Przejdź do następnej pieśni [→]"
                onClick={() => changeHymn(hymnID.current, "next", clearHymn)}
              >
                <p>Następna</p>

                <Image
                  className={`${styles.next} icon`}
                  alt="strzałka w prawo"
                  src="/icons/arrow.svg"
                  width={15}
                  height={15}
                />
              </button>
            </div>
          </div>

          {/* right side buttons */}
          <div className={styles.options}>
            <button
              className="disabledTemporary"
              title="Włącz prezentację pieśni na pełen ekran [P]"
              onClick={presentationButton}
            >
              <Image
                className="icon"
                alt="presentation"
                src="/icons/monitor.svg"
                width={20}
                height={20}
              />
              <p>Prezentacja</p>
            </button>

            <button
              className="disabledTemporary"
              title="Przejdź do listy ulubionych pieśni [F]"
              onClick={() => menuLink("favorite")}
            >
              <Image
                className="icon"
                alt="favorite"
                src="/icons/bookmark.svg"
                width={20}
                height={20}
              />
              <p>Lista ulubionych</p>
            </button>

            <button
              title="Przejdź do ustawień aplikacji [S]"
              onClick={() => menuLink("settings")}
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
              className="disabledTemporary"
              title="Pobierz oryginalną stronę ze śpiewnika"
              onClick={() => {}}
            >
              <Image
                className="icon"
                alt="pdf"
                src="/icons/document.svg"
                width={20}
                height={20}
              />
              <p>Pobierz PDF</p>
            </button>

            <button
              title="Wydrukuj tekst pieśni"
              onClick={() => window.print()}
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
          </div>
        </div>
      </main>

      {/* bottom navbar */}
      <Navbar setup={"hymn"} />
    </>
  );
}

// back to specific book search page
function backButton() {
  const book = localStorage.getItem("searchPage");

  if (book == "all") {
    router.push("/search");
  } else {
    router.push({
      pathname: "/search",
      query: { book },
    });
  }
}

// previous & next hymn button
function changeHymn(id: number, operator: string, clearHymn: Function) {
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
}
