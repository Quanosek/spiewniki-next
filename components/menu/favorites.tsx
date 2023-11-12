import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "@/styles/components/menu.module.scss";

import { openMenu } from "@/scripts/buttons";

export default function FavoritesMenu() {
  const favoritesData = localStorage.getItem("favorites") as string;
  const [favorites, setFavorites] = useState(
    favoritesData ? JSON.parse(favoritesData) : []
  );

  const [hoverElement, setHoverElement] = useState(
    undefined as number | undefined
  );

  const info = () => {
    if (!favorites.length) return;

    if (favorites.length === 1) return <>dodano 1 pieśń</>;
    else return <>dodano {favorites.length} pieśni</>;
  };

  return (
    <>
      <div className={styles.favTitle}>
        <h2>Lista ulubionych</h2>
        <p>{info()}</p>
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
                    const newArray = favorites.filter((fav: any) => {
                      return fav !== favorites[index];
                    });

                    setFavorites(newArray);
                    localStorage.setItem("favorites", JSON.stringify(newArray));
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
          <p className={styles.placeholder}>Brak pozycji do wyświetlenia</p>
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
              setFavorites([]);
              localStorage.removeItem("favorites");
            }
          }}
        >
          Wyczyść listę
        </button>

        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze."
          onClick={() => openMenu(undefined)}
        >
          Zamknij
        </button>
      </div>
    </>
  );
}
