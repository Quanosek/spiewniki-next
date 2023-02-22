import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useRef, useEffect } from "react";

import styles from "@styles/pages/search.module.scss";

import Search from "@scripts/search";
import BookNames from "@scripts/bookNames";

export default function SearchPage() {
  const router = useRouter();
  const { query } = router;
  const book = query.book as string;

  const inputRef: any = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (book === "all") inputRef.current.focus();

    const input = document.getElementById("input") as HTMLInputElement;
    Search(book, input.value);
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>Wyszukiwanie | Śpiewniki</title>
      </Head>

      <main>
        <div className={styles.container}>
          <h1 className={styles.title}>Wyszukiwanie</h1>
          <div className={styles.searchHolder}>
            <button
              className={styles.arrow}
              title="Powrót do strony głównej"
              onClick={() => router.push("/")}
            >
              <Image
                className="icon"
                alt="powrót"
                src="/icons/arrow.svg"
                width={45}
                height={45}
                priority
              />
            </button>

            <div className={styles.searchbar}>
              <input
                ref={inputRef}
                id="input"
                placeholder="Wpisz numer, tytuł, lub fragment tekstu pieśni"
                onFocus={(e) => e.target.select()}
                onInput={(e) => {
                  Search(book, (e.target as HTMLInputElement).value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    const results = document.getElementById("results")
                      ?.firstChild as HTMLLinkElement;
                    if (results.href) router.push(results.href);
                    else clearSearch(book);
                  }
                }}
              />

              <div id="searchIcon" className={styles.searchIcon}>
                <Image
                  className={`${styles.searchIcon} icon`}
                  alt="szukaj"
                  src="/icons/search.svg"
                  width={10}
                  height={10}
                />
              </div>

              <div
                id="clearIcon"
                className={styles.clearIcon}
                onClick={() => clearSearch(book)}
              >
                <Image
                  className="icon"
                  alt="szukaj"
                  src="/icons/close.svg"
                  width={10}
                  height={10}
                />
              </div>
            </div>
          </div>

          <div id="filters" className={styles.filters}>
            <p className={styles.filtersTitle}>Szukaj&nbsp;w:</p>
            <button onClick={() => router.push("/filters")}>
              <p>{BookNames(book)}</p>
            </button>
          </div>

          <div id="results" className={styles.results}></div>
        </div>
      </main>
    </>
  );
}

function clearSearch(book: string) {
  const input = document.getElementById("input") as HTMLInputElement;
  input.value = "";
  input.focus();

  Search(book, input.value);
}
