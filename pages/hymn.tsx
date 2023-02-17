import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import axios from "axios";

import styles from "@styles/pages/hymn.module.scss";

export default function HymnPage() {
  const router = useRouter();
  const { query } = router;

  const [state, setState] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;

    axios
      .get(`/api/xml`, {
        params: {
          book: query.book,
          title: query.title,
        },
      })
      .then(({ data }) => {
        return setState(data);
      });
  }, [router.isReady]);

  if (!state) return;
  const hymn = state.hymn;

  return (
    <>
      <Head>
        <title>{hymn.title} | Śpiewniki</title>
      </Head>

      <main>
        <h1 className={styles.title}>{hymn.title}</h1>

        {
          // displaying formatted lyrics
          hymn.lyrics.map((verses: any, index: number) => {
            return (
              <div className={styles.lyrics} key={index}>
                {verses.map((lines: any, index: number) => {
                  return (
                    <div className={styles.verse} key={index}>
                      {lines.map((element: string, index: number) => {
                        if (element.startsWith(".")) {
                          // chord exception
                          element = element.slice(1);
                          return (
                            <p className={styles.chord} key={index}>
                              {element}
                            </p>
                          );
                        } else {
                          // lines of text
                          if (element.startsWith(" "))
                            element = element.slice(1);
                          return <p key={index}>{element}</p>;
                        }
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })
        }
      </main>
    </>
  );
}
