import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from "react";

import styles from "@/styles/pages/books.module.scss";
import bookShortcut, { bookList, pdfBooks } from "@/scripts/bookShortcut";

import { Header } from "@/components/elements";

export default function BooksPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Lista śpiewników / Śpiewniki</title>
      </Head>

      <Header
        buttons={{
          leftSide: {
            title: "Powrót",
            icon: "arrow",
            onclick: () => router.back(),
          },
        }}
      />

      <div className="container">
        <main>
          <div className={styles.title}>
            <button className={styles.backArrow} onClick={() => router.back()}>
              <Image
                className="icon"
                alt="back"
                src="/icons/arrow.svg"
                width={25}
                height={25}
                draggable={false}
              />
            </button>

            <h2>Lista wszystkich śpiewników:</h2>
          </div>

          <div className={styles.list}>
            <Link className={styles.all} href={"/search"}>
              <p>{bookShortcut("all")}</p>
            </Link>

            <hr />

            {Books(bookList())}
          </div>
        </main>
      </div>
    </>
  );
}

// show all books
const Books = (names: string[]) => {
  const books: ReactElement[] = [];

  names.forEach((name, index) => {
    books.push(
      <div key={index}>
        <div className={styles.book}>
          <Link
            className={styles.toSearch}
            href={{
              pathname: "/search",
              query: { book: name },
            }}
          >
            <p>{bookShortcut(name)}</p>
          </Link>

          {pdfBooks().includes(name) && (
            <Link
              className={styles.toFile}
              href={`/pdf/${bookShortcut(name)}.pdf`}
              target="_blank"
            >
              <p>Otwórz PDF</p>
              <Image
                className="icon"
                alt="pdf file"
                src="/icons/document.svg"
                width={20}
                height={20}
                draggable={false}
              />
            </Link>
          )}
        </div>

        {index + 1 !== names.length && <hr />}
      </div>
    );
  });

  return <div className={styles.books}>{books}</div>;
};
