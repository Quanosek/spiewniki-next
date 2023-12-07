import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import axios from "axios";

import styles from "@/styles/components/menu.module.scss";

import { bookShortcut, booksList } from "@/scripts/bookShortcut";
import { openMenu } from "@/scripts/buttons";

export default function FavoritesMenu() {
  const router = useRouter();

  const favoritesData = JSON.parse(localStorage.getItem("favorites") as string);
  const [favorites, setFavorites] = useState(favoritesData || []);

  const [hoverElement, setHoverElement] = useState(
    undefined as number | undefined
  );

  // remove selected hymn from list of favorites
  const removeFromList = (index: number) => {
    const newArray = favorites.filter((fav: any) => {
      return fav !== favorites[index];
    });

    setFavorites(newArray);
    localStorage.setItem("favorites", JSON.stringify(newArray));
  };

  return (
    <>
      <h2>Lista ulubionych</h2>

      <div className={`${styles.content} ${styles.favorites}`}>
        <div className={styles.settings}>
          <span>
            {(favorites.length === 1 && "dodano 1 pieśń") ||
              `dodano ${favorites.length} pieśni`}
          </span>

          <button className={!favorites.length ? "disabled" : ""}>
            <select
              defaultValue="timestamp"
              onChange={(e) => {
                const newArray = favorites.sort((a: any, b: any) => {
                  switch (e.target.value) {
                    case "timestamp":
                      return b.timestamp - a.timestamp;
                    case "alphabetic":
                      return a.title.localeCompare(b.title, undefined, {
                        numeric: true,
                      });
                  }
                });

                setFavorites(newArray);
              }}
            >
              <option value="timestamp">Czas dodania</option>
              <option value="alphabetic">Alfabetycznie</option>
            </select>
            <p>Sortuj</p>

            <Image
              className="icon"
              alt="arrow"
              src="/icons/arrow.svg"
              width={16}
              height={16}
              draggable={false}
            />
          </button>
        </div>

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
                  onClick={async () => {
                    try {
                      // check book
                      if (!booksList().includes(fav.book)) {
                        removeFromList(index);
                        throw new Error();

                        // check title
                      } else {
                        const { data } = await axios.get(
                          `database/${bookShortcut(fav.book)}.json`
                        );

                        if (
                          !data.find((elem: any) => elem.name === fav.title)
                        ) {
                          removeFromList(index);
                          throw new Error();
                        }
                      }
                    } catch (err) {
                      router.back();

                      window.alert(
                        "Nie znaleziono wybranej pieśni! Pozycja została usunięta z listy ulubionych."
                      );
                    }
                  }}
                >
                  <p>{fav.title}</p>

                  <span>
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
                  </span>
                </Link>

                <button
                  className={styles.removeButton}
                  style={{
                    display: hoverElement === index ? "flex" : "",
                  }}
                  onClick={() => removeFromList(index)}
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
