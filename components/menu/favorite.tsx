import styles from "@/styles/components/menu.module.scss";

export default function FavoriteMenu() {
  return (
    <>
      <div className={styles.favoriteTitle}>
        <h2>Lista ulubionych</h2>
        <p>brak pieśni na liście</p>
      </div>

      <div className={styles.element}>
        <div className={styles.favoriteList}>
          <p>Dodaj pierwszą ulubioną pieśń</p>
        </div>
      </div>

      <div className={styles.buttons}>
        <button>Wyczyść listę</button>
        <button>Zamknij</button>
      </div>
    </>
  );
}
