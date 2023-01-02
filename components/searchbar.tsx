import styles from "@styles/main.module.scss";

export default function Searchbar() {
  return (
    <div className={styles.searchbar}>
      <div className={styles.searchIcon}></div>
      <input id="input" placeholder="Wpisz tytuł lub numer pieśni" />
    </div>
  );
}
