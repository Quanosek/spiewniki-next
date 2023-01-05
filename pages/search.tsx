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

      <main>
        <h1>Wyszukiwanie</h1>
        <div className={styles.searchbar}>
          <div className={styles.searchIcon}></div>
          <input
            ref={inputRef}
            id="input"
            placeholder="Wpisz tytuł lub numer pieśni"
          />
        </div>

        <h2>{book}</h2>
      </main>
    </>
  );
}
