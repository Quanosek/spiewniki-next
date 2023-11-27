import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import styles from "@/styles/components/menu.module.scss";

import { bookShortcut } from "@/scripts/bookShortcut";
import { openMenu } from "@/scripts/buttons";

export default function FavoritesMenu() {
  const favoritesData = localStorage.getItem("favorites") as string;
  const [favorites, setFavorites] = useState(
    favoritesData ? JSON.parse(favoritesData) : []
  );

  const [hoverElement, setHoverElement] = useState(
    undefined as number | undefined
  );

  return (
    <>
      <div className={styles.favTitle}>
        <h2>Lista ulubionych</h2>
        <p>
          {(favorites.length === 1 && "dodano 1 pieśń") ||
            `dodano ${favorites.length} pieśni`}
        </p>
      </div>

      <div className={`${styles.content} ${styles.favorites}`}>
        {/* <div className={styles.settings}>
          <p>
            {(favorites.length === 1 && "dodano 1 pieśń") ||
              `dodano ${favorites.length} pieśni`}
          </p>

          <div className="disabled">
            <button>Filtry</button>
            <button>Sortuj</button>
          </div>
        </div> */}

        {favorites.length ? (
          favorites.map((fav: any, index: number) => {
            return (
              <div
                key={index}
                className={styles.favorite}
                onMouseEnter={() => setHoverElement(index)}
                onMouseLeave={() => setHoverElement(undefined)}
              >
                <Link
                  href={{
                    pathname: "/hymn",
                    query: { book: fav.book, title: fav.title },
                  }}
                >
                  <p>{fav.title}</p>

                  {/* <span>
                    <p>
                      {fav.timestamp
                        ? new Date(fav.timestamp).toLocaleString("pl-PL", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",

                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "NaN"}
                      {" • "}
                      {bookShortcut(fav.book)}
                    </p>
                  </span> */}
                </Link>

                <button
                  className={styles.removeButton}
                  style={{
                    display: hoverElement === index ? "flex" : "",
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
          className={styles.alert}
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
          title="Kliknij, lub użyj [Esc] na klawiaturze, aby zamknąć menu."
          onClick={() => openMenu(undefined)}
        >
          Zamknij
        </button>
      </div>
    </>
  );
}
