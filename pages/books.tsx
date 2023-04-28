import Head from "next/head";
import Link from "next/link";
import { ReactElement } from "react";

import styles from "@/styles/pages/books.module.scss";

import bookNames from "@/scripts/bookNames";

export default function FiltersPage() {
  return (
    <>
      <Head>
        <title>Wszystkie śpiewniki | Śpiewniki</title>
      </Head>

      <main>
        <h2>Lista wszystkich śpiewników:</h2>

        {Books(["PBT", "UP", "N", "E", "S", "R"])}
      </main>
    </>
  );
}

function Books(names: string[]) {
  const books: ReactElement[] = [];

  names.forEach((name, index) => {
    books.push(
      <>
        <Link
          href={{
            pathname: `/search`,
            query: { book: name },
          }}
          key={name}
        >
          <p>
            {index + 1}. {bookNames(name)}
          </p>
        </Link>

        {
          index + 1 !== names.length && <hr /> // separate results
        }
      </>
    );
  });

  return <div className={styles.books}>{books}</div>;
}
