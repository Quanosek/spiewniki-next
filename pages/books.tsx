import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/books.module.scss";

import { Header } from "@/components/elements";

export default function BooksPage() {
  const router = useRouter();

  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/booksData")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

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
        <div className="mobile-header">
          <button
            className="left-button"
            style={{ rotate: "90deg" }}
            onClick={() => router.back()}
          >
            <Image
              className="icon"
              alt="back"
              src="/icons/arrow.svg"
              width={25}
              height={25}
              draggable={false}
            />
          </button>

          <div className="center">
            <h2>Lista wszystkich śpiewników:</h2>
          </div>
        </div>

        <main>
          <div className={styles.title}>
            <h2>Lista wszystkich śpiewników:</h2>
          </div>

          <div className={styles.list}>
            <Link className={styles.all} href={"/search"}>
              <p>Pokaż wszystkie</p>
            </Link>

            <hr />

            {!data.length && <div className="loader" />}

            {data.map((book: any, index: number) => {
              return (
                <div key={index}>
                  <div className={styles.book}>
                    <Link
                      className={styles.toSearch}
                      href={{
                        pathname: "/search",
                        query: { book: book.shortcut },
                      }}
                    >
                      <p>{book.name}</p>
                    </Link>

                    {book.pdf && (
                      <Link
                        className={styles.toFile}
                        href={{
                          pathname: "/document",
                          query: { d: book.name },
                        }}
                      >
                        <p>Otwórz PDF</p>
                        <Image
                          className="icon"
                          alt="pdf_file"
                          src="/icons/document.svg"
                          width={20}
                          height={20}
                          draggable={false}
                        />
                      </Link>
                    )}
                  </div>

                  {index + 1 !== data.length && <hr />}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
