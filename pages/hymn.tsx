import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import axios from "axios";

import styles from "@/styles/pages/hymn.module.scss";

import Menu from "@/components/menu";
import TopNavbar from "@/components/navbar/top";
import BottomNavbar from "@/components/navbar/bottom";

export default function HymnPage() {
  const router = useRouter();
  const [hymn, setState] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;

    (async () => {
      const { book, title } = router.query;

      axios
        .get(`/api/xml`, {
          params: { book: book, title: title },
        })
        .then(({ data }) => setState(data[0]));
    })();
  });

  return (
    <>
      <Head>
        {(router.query.title && (
          // filename title
          <title>{router.query.title} | Śpiewniki</title>
        )) || (
          // default title (placeholder)
          <title>Śpiewniki</title>
        )}
      </Head>

      <TopNavbar />

      {/* menu buttons display */}
      <Menu />

      <main>
        <div className={styles.container}>
          <div className={styles.options}>
            <button className={styles.backArrow} onClick={() => router.back()}>
              <Image
                className="icon"
                alt="strzałka"
                src="/icons/arrow.svg"
                width={20}
                height={20}
              />
              <p>Powrót do wyszukiwania</p>
            </button>

            <div className={`${styles.buttons} ${styles.leftSide}`}>
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

              <button onClick={() => router.push("/")}>
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
          </div>

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
                  </>
                ))}
            </div>

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

              <button onClick={() => {}}>
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

          <div className={styles.options}>
            <div className={styles.buttons}>
              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/bookmark.svg"
                  width={20}
                  height={20}
                />
                <p>Zakładki</p>
              </button>

              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/settings.svg"
                  width={20}
                  height={20}
                />
                <p>Ustawienia</p>
              </button>

              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/document.svg"
                  width={20}
                  height={20}
                />
                <p>Pobierz PDF</p>
              </button>

              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/music.svg"
                  width={20}
                  height={20}
                />
                <p>Odtwórz melodię</p>
              </button>

              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/printer.svg"
                  width={20}
                  height={20}
                />
                <p>Wydrukuj</p>
              </button>

              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/link.svg"
                  width={20}
                  height={20}
                />
                <p>Udostępnij</p>
              </button>

              <button onClick={() => {}}>
                <Image
                  className="icon"
                  alt="klucz"
                  src="/icons/monitor.svg"
                  width={20}
                  height={20}
                />
                <p>Prezentacja</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNavbar more={true} />
    </>
  );
}
