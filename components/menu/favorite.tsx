import styles from "@/styles/components/menu.module.scss";
import { useRouter } from "next/router";

export default function FavoriteMenu() {
  const router = useRouter();

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
        <button onClick={()=>router.back()}>Zamknij</button>
      </div>
    </>
  );
}
