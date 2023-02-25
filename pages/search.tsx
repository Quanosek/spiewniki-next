import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import styles from "@styles/pages/search.module.scss";

import Results from "@components/results";

import Search from "@scripts/search";
import BookNames from "@scripts/bookNames";

export default function SearchPage() {
  const router = useRouter();
  const book = router.query.book as string;

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const book = router.query.book as string;

    (async () => setData(await Search(book, "")))();
  }, [router.isReady, router.query]);

  if (!data) return;

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
                id="input"
                placeholder="Wpisz numer, tytuł, lub fragment tekstu pieśni"
                onFocus={(e) => e.target.select()}
                onInput={async (e) => {
                  const input = (e.target as HTMLInputElement).value;
                  const searchIcon = document.getElementById(
                    "searchIcon"
                  ) as HTMLElement;
                  const clearIcon = document.getElementById(
                    "clearIcon"
                  ) as HTMLElement;

                  if (!input) {
                    searchIcon.style.display = "";
                    clearIcon.style.display = "";
                  } else {
                    searchIcon.style.display = "none";
                    clearIcon.style.display = "flex";
                  }

                  if (input === "2137") {
                    router.push(
                      `/hymn?book=UP&title=7C. Pan kiedyś stanął nad brzegiem (Barka)`
                    );
                  }

                  setData(await Search(book, input));
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

          <Results results={data} />
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
