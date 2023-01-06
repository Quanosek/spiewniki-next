import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useRef, useEffect } from "react";

import styles from "@styles/pages/search.module.scss";
import Search from "@scripts/search";

export default function SearchPage() {
  const router = useRouter();
  const { query } = router;
  const book = query.book as string;

  const inputRef: any = useRef(null);

  useEffect(() => {
    if (!book) return; // ignore default empty
    if (book === "W") inputRef.current.focus(); // focus on searching all

    // read searching input
    const input = document.getElementById("input") as HTMLInputElement;
    const results = document.getElementById("results") as HTMLElement;
    Search(book, input.value, results);

    input.addEventListener("input", () => {
      Search(book, input.value, results);
    });
  }, [book]);

  return (
    <>
      <Head>
        <title>Wyszukiwanie | Śpiewniki</title>
      </Head>

      <main className={styles.main}>
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
              placeholder="Wyszukaj..."
              onFocus={(e) => e.target.select()}
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
              onClick={() => {
                clearButton(book);
              }}
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
            <p>{hymnBookNames(book)}</p>
          </button>
        </div>
        <div id="results" className={styles.results}></div>
      </main>
    </>
  );
}

function hymnBookNames(short: string) {
  switch (short) {
    case "W":
      short = "Wszystkie śpiewniki";
      break;
    case "PBT":
      short = "Pieśni Brzasku Tysiąclecia";
      break;
    case "C":
      short = "Uwielbiajmy Pana (Cegiełki)";
      break;
    case "N":
      short = "Śpiewajmy Panu Pieśń Nową";
      break;
    case "E":
      short = "Śpiewniczek Młodzieżowy Epifanii";
      break;
    case "I":
      short = "Inne pieśni";
      break;
  }

  return short;
}

function clearButton(book: string) {
  const input = document.getElementById("input") as HTMLInputElement;
  const results = document.getElementById("results") as HTMLInputElement;

  input.value = "";
  input.focus();
  Search(book, input.value, results);
}
