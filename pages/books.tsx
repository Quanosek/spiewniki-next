import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from "react";

import styles from "@/styles/pages/books.module.scss";

import bookNames from "@/scripts/bookNames";

export default function BooksPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Wszystkie śpiewniki / Śpiewniki</title>
      </Head>

      <div className="backArrow">
        <button onClick={() => router.back()}>
          <Image
            className="icon"
            alt="arrow"
            src="/icons/arrow.svg"
            width={20}
            height={20}
          />
          <p>Powrót</p>
        </button>
      </div>

      <main>
        <div className={styles.title}>
          <button
            title="Powrót do strony głównej"
            className={styles.backArrow}
            onClick={() => router.back()}
          >
            <Image
              className="icon"
              alt="info"
              src="/icons/arrow.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>

          <h2>Lista wszystkich śpiewników:</h2>
        </div>

        <div className={styles.books}>
          <Link
            className={styles.all}
            href={{
              pathname: "/search",
            }}
          >
            <p>{bookNames("all")}</p>
          </Link>

          <hr />

          {Books(["PBT", "UP", "N", "K", "P", "E", "S", "R"])}
        </div>
      </main>
    </>
  );
}

// show all books
function Books(names: string[]) {
  const books: ReactElement[] = [];

  names.forEach((name, index) => {
    books.push(
      <div key={index}>
        <Link
          href={{
            pathname: "/search",
            query: { book: name },
          }}
        >
          <p>{bookNames(name)}</p>
        </Link>

        {
          index + 1 !== names.length && <hr /> // separate results
        }
      </div>
    );
  });

  return <div className={styles.list}>{books}</div>;
}
