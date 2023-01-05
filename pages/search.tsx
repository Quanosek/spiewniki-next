import Head from "next/head";
import { useRouter } from "next/router";
import React, { useRef, useEffect } from "react";

import styles from "@styles/pages/search.module.scss";

export default function SearchPage() {
  const router = useRouter();
  const { query } = router;
  const book = query.book ? query.book : "all";

  const inputRef: any = useRef(null);
  useEffect(() => {
    if (book === "all") inputRef.current.focus();
  }, []);

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
            <img className="icon" alt="powrót" src="/icons/arrow.svg" />
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

        <div id="results" className={styles.results}>
          <p className={styles.noResults}>Brak wyników wyszukiwania.</p>
          {/* <hr /> */}
          {/* <p>216. Przyszła chwila dla Syonu</p> */}
        </div>
      </main>
    </>
  );
}

function hymnBookNames(short: any) {
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
