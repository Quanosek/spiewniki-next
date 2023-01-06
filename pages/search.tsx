import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useRef, useEffect } from "react";

import styles from "@styles/pages/search.module.scss";
import Searching from "@scripts/searching";

export default function SearchPage() {
  const router = useRouter();
  const { query } = router;
  const book = (query.book ? query.book : "all") as string;

  const inputRef: any = useRef(null);

  useEffect(() => {
    // focus on searching all
    if (book === "all") inputRef.current.focus();

    // searching input
    const input = document.getElementById("input") as HTMLInputElement;
    const loader = document.getElementById("loader") as HTMLElement;
    const results = document.getElementById("results") as HTMLElement;
    Searching(book, input.value, results);

    input.addEventListener("input", () => {
      Searching(book, input.value, results);
    });
  });

  return (
    <>
      <Head>
        <title>Wyszukiwanie | Śpiewniki</title>
      </Head>

      <main className={styles.main}>
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
            />
          </button>
          <div className={styles.searchbar}>
            <input ref={inputRef} id="input" placeholder="Wyszukaj..." />
            <div className={styles.searchIcon}></div>
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
    case "all":
      short = "Wszystkie śpiewniki";
      break;
    case "brzask":
      short = "Pieśni Brzasku Tysiąclecia";
      break;
    case "cegielki":
      short = "Uwielbiajmy Pana (Cegiełki)";
      break;
    case "nowe":
      short = "Śpiewajmy Panu Pieśń Nową";
      break;
    case "epifania":
      short = "Śpiewniczek Młodzieżowy Epifanii";
      break;
    case "inne":
      short = "Inne pieśni";
      break;
  }

  return short;
}
