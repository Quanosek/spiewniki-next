import Head from "next/head";
import Image from "next/image";
import router, { useRouter } from "next/router";
import { useState, useEffect } from "react";

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
  const [hymn, setState] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    let { book, title } = router.query as { book: string; title: string };

    (async () => {
      axios
        .get(`/api/xml`, {
          params: { book: book, title: title },
        })
        .then(({ data }) => {
          return setState(data[0]);
        });
    })();
  }, [router]);

  return (
    <>
      <Head>
        {(router.query.title && (
          // filename title
          <title>{router.query.title} / Śpiewniki</title>
        )) || (
          // default title (placeholder)
          <title>Śpiewniki</title>
        )}
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
          <button onClick={() => {}}>
            <Image
              className="icon"
              alt="pdf"
              src="/icons/document.svg"
              width={30}
              height={30}
            />
          </button>

          <button onClick={() => {}}>
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
        <button onClick={backButton}>
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

            <button onClick={() => {}}>
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

          {/* hymn text */}
          <div className={styles.center}>
            <div className={styles.text}>
              {(!hymn && <div className="loader" />) ||
                (hymn && (
                  <>
                    <div className={styles.title}>
                      <p>{hymn.book}</p>
                      <h1>{hymn.title}</h1>
                    </div>

                    <div className={styles.lyrics}>
                      {hymn.lyrics.map((verses: string[], index: number) => {
                        return (
                          <div className={styles.verse} key={index}>
                            {verses.map((verse: string, index: number) => {
                              if (verse.startsWith(".")) {
                                // chord exception
                                return (
                                  <p className={styles.chord} key={index}>
                                    {verse.slice(1)}
                                  </p>
                                );
                              } else {
                                // lines of text correction
                                if (verse.startsWith(" "))
                                  verse = verse.slice(1);
                                return <p key={index}>{verse}</p>;
                              }
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
              <button title="Przejdź do poprzedniej pieśni" onClick={() => {}}>
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
                onClick={randomButton}
              >
                <p>Wylosuj pieśń</p>
              </button>

              <button title="Przejdź do następnej pieśni" onClick={() => {}}>
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
              <p>Zakładki</p>
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

            <button
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
          </div>
        </div>
      </main>

      {/* bottom navbar */}
      <Navbar more={true} />
    </>
  );
}

// back to specific book search page
function backButton() {
  const book = localStorage.getItem("searchPage");

  if (book) {
    router.push({
      pathname: "/search",
      query: { book: book },
    });
  } else router.push("/search");
}
