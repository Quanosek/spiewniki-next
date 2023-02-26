import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

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
  }, [router]);

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

      <main>
        <Menu />

        <div className={styles.container}>
          {hymn && (
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
                        if (verse.startsWith(".")) {
                          // chord exception
                          return (
                            <p className={styles.chord} key={index}>
                              {verse.slice(1)}
                            </p>
                          );
                        } else {
                          // lines of text correction
                          if (verse.startsWith(" ")) verse = verse.slice(1);
                          return <p key={index}>{verse}</p>;
                        }
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <BottomNavbar more={true} />
    </>
  );
}
