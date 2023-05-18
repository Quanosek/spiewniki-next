import { useRouter } from "next/router";

import styles from "@/styles/components/menu.module.scss";

export default function FavoriteMenu() {
  const router = useRouter();

  return (
    <>
      <div className={styles.favTitle}>
        <h2>Lista ulubionych</h2>
        <p>brak pieśni na liście</p>
      </div>

      <div className={styles.element}>
        <div className={styles.favList}>
          <p className={styles.placeholder}>Dodaj pierwszą ulubioną pieśń</p>
        </div>
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => {
            const prompt = confirm(
              "Czy na pewno chcesz wyczyścić listę ulubionych?"
            );
            if (prompt == true) {
              //
            }
          }}
        >
          Wyczyść listę
        </button>
        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze"
          onClick={() => router.back()}
        >
          Zamknij
        </button>
      </div>
    </>
  );
}
