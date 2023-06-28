import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import styles from "@/styles/components/menu.module.scss";

import { replaceLink } from "@/scripts/buttons";

export default function FavoriteMenu() {
  const router = useRouter();

  const [hoverElement, setHoverElement] = useState(
    undefined as number | undefined
  );

  const favoritesData = localStorage.getItem("favorites") as string;
  let favorites = favoritesData ? JSON.parse(favoritesData) : [];

  favorites = favorites.sort((a: { title: string }, b: { title: string }) => {
    return new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: "base",
    }).compare(a.title, b.title);
  });

  const FavLength = () => {
    if (!favorites.length) return;
    if (favorites.length === 1) return <>dodano 1 pieśń</>;
    else return <>dodano {favorites.length} pieśni</>;
  };

  return (
    <>
      <div className={styles.favTitle}>
        <h2>Lista ulubionych</h2>
        {favorites && <p>{FavLength()}</p>}
      </div>

      <div className={`${styles.element} ${styles.favList}`}>
        {favorites.length ? (
          favorites.map((fav: any, index: number) => {
            return (
              <div
                key={index}
                className={styles.favElement}
                onMouseEnter={() => setHoverElement(index)}
                onMouseLeave={() => setHoverElement(undefined)}
              >
                <Link
                  href={{
                    pathname: "/hymn",
                    query: { book: fav.book, title: fav.title },
                  }}
                >
                  {fav.title}
                </Link>

                <button
                  className={styles.removeButton}
                  style={{
                    display: hoverElement === index ? "block" : "",
                  }}
                  onClick={() => {
                    favorites = favorites.filter(
                      (fav: any) => fav !== favorites[index]
                    );

                    localStorage.setItem(
                      "favorites",
                      JSON.stringify(favorites)
                    );
                  }}
                >
                  <Image
                    className="icon"
                    alt="delete"
                    src="/icons/close.svg"
                    width={16}
                    height={16}
                    draggable={false}
                  />
                </button>
              </div>
            );
          })
        ) : (
          <p className={styles.placeholder}>Dodaj pierwszą ulubioną pieśń</p>
        )}
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => {
            if (!favorites.length) return alert("Brak ulubionych pieśni!");

            const prompt = confirm(
              "Czy na pewno chcesz wyczyścić listę ulubionych?"
            );
            if (prompt) {
              localStorage.removeItem("favorites");
              return router.reload();
            }
          }}
        >
          Wyczyść listę
        </button>
        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze"
          onClick={() => replaceLink(undefined)}
        >
          Zamknij
        </button>
      </div>
    </>
  );
}
