import Image from "next/image";

import styles from "@/styles/components/menu.module.scss";

export default function SettingsMenu() {
  return (
    <>
      <h2>Ustawienia</h2>

      <div className={styles.element}>
        <h3>Motyw kolorów:</h3>

        <form className={styles.colorTheme}>
          <label className={styles.black} htmlFor="black">
            <Image
              alt="przykładowy tekst"
              src="/icons/text.svg"
              width={50}
              height={50}
            />
            <input type="radio" name="theme" value="black" />
          </label>

          <label className={styles.dark} htmlFor="dark">
            <Image
              alt="przykładowy tekst"
              src="/icons/text.svg"
              width={50}
              height={50}
            />
            <input type="radio" name="theme" value="dark" />
          </label>

          <label className={styles.light} htmlFor="light">
            <Image
              alt="przykładowy tekst"
              src="/icons/text.svg"
              width={50}
              height={50}
            />
            <input type="radio" name="theme" value="light" />
          </label>

          <label className={styles.reading} htmlFor="reading">
            <Image
              alt="przykładowy tekst"
              src="/icons/text.svg"
              width={50}
              height={50}
            />
            <input type="radio" name="theme" value="reading" />
          </label>
        </form>
      </div>

      <div className={styles.element}>
        <h3>Wielkość tekstu:</h3>

        <div className={styles.fontSize}>
          <div className={styles.smaller}>A</div>
          <input type="range" min="14" max="28" step="0.5" />
          <div className={styles.bigger}>A</div>
        </div>
      </div>

      <div className={styles.element}>
        <h3>Wyświetlanie akordów:</h3>

        <label className={styles.chordsToggle}>
          <input type="checkbox" />
          <span />
        </label>
      </div>

      <div className={styles.buttons}>
        <button>Resetuj</button>
        <button>Zamknij</button>
      </div>
    </>
  );
}
