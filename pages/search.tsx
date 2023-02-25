import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import styles from "@/styles/pages/search.module.scss";

import search from "@/scripts/search";
import BookNames from "@/scripts/bookNames";

export default function SearchPage() {
  const router = useRouter();
  const book = router.query.book as string;

  const [data, setState] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const book = router.query.book as string;

    const input = document.getElementById("input") as HTMLInputElement;
    if (book === "all") input.focus();

    (async () => {
      return setState(await search(book, ""));
    })();
  }, [router.isReady, router.query]);

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
              onClick={() => router.back()}
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
                onInput={async (e) => {
                  const input = (e.target as HTMLInputElement).value;
                  changeIcons(input);
                  setState(await search(book, input));
                }}
                onKeyUp={async (e) => {
                  if (e.key === "Enter") {
                    const firstResults = document.getElementById("results")
                      ?.firstChild?.firstChild as HTMLLinkElement;

                    if (firstResults.href) router.push(firstResults.href);
                    else setState(await clearSearch(book));
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
                onClick={async () => setState(await clearSearch(book))}
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
            {book && (
              <Link href={"/filters"}>
                <p>{BookNames(book)}</p>
              </Link>
            )}
          </div>

          <div id="results" className={styles.results}>
            {(!data && ( // loading animation
              <div className={styles.loader} />
            )) ||
              (!data[0] && ( // no results
                <p className={styles.noResults}>Brak wyników wyszukiwania</p>
              )) ||
              // display all searching results
              data.map(
                (
                  hymn: { book: string; title: string; lyrics: string[] },
                  index: number,
                  row: { length: number }
                ) => {
                  return (
                    <div key={index}>
                      <Link
                        href={{
                          pathname: `/hymn`,
                          query: { book: hymn.book, title: hymn.title },
                        }}
                      >
                        <h2>{hymn.title}</h2>
                        {hymn.lyrics && <p>{hymn.lyrics}</p>}
                      </Link>

                      {
                        // separate results
                        index + 1 !== row.length && <hr />
                      }
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </main>
    </>
  );
}

async function clearSearch(book: string) {
  const input = document.getElementById("input") as HTMLInputElement;
  input.value = "";

  changeIcons(input.value);
  input.focus();

  return await search(book, input.value);
}

function changeIcons(input: string) {
  const searchIcon = document.getElementById("searchIcon") as HTMLElement;
  const clearIcon = document.getElementById("clearIcon") as HTMLElement;

  if (!input) {
    searchIcon.style.display = "";
    clearIcon.style.display = "";
  } else {
    searchIcon.style.display = "none";
    clearIcon.style.display = "flex";
  }
}
