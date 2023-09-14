import Image from "next/image";
import { useState, useEffect, ReactElement } from "react";

import styles from "@/styles/components/menu.module.scss";
import { replaceLink } from "@/scripts/buttons";

export default function SettingsMenu() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  // default values
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "21"
  );
  const [showChords, setShowChords] = useState(
    Boolean(localStorage.getItem("showChords")) || false
  );
  const [colorTheme, setColorTheme] = useState(
    document.documentElement.classList[1]
  );

  // save changes to local storage
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);

    showChords
      ? localStorage.setItem("showChords", "true")
      : localStorage.removeItem("showChords");

    localStorage.setItem("colorTheme", colorTheme);
    document.documentElement.className = `${document.documentElement.classList[0]} ${colorTheme}`;
  }, [fontSize, showChords, colorTheme]);

  // quick books selection
  const Themes = (names: string[]) => {
    const themes: ReactElement[] = [];

    names.forEach((name) => {
      themes.push(
        <label htmlFor={name} key={name}>
          <Image
            alt="text"
            src="/icons/text.svg"
            width={50}
            height={50}
            priority={true}
            draggable={false}
          />

          <input
            type="radio"
            id={name}
            value={name}
            name="colorTheme"
            checked={colorTheme === name}
            onChange={() => setColorTheme(name)}
          />
        </label>
      );
    });

    return <form className={styles.colorTheme}>{themes}</form>;
  };

  return (
    <>
      <h2>Ustawienia aplikacji</h2>

      {/* COLOR THEME */}
      <div className={styles.element}>
        <h3>Motyw kolorów:</h3>

        {unlocked
          ? Themes(["black", "dark", "light", "reading"])
          : Themes(["light", "reading", "black", "dark"])}
      </div>

      {/* FONT SIZE */}
      <div className={styles.element}>
        <h3>Wielkość tekstu pieśni:</h3>

        <div className={styles.fontPreview}>
          <p style={{ fontSize: `${fontSize}px` }}>Przykładowy tekst.</p>
        </div>

        <div className={styles.fontSlider}>
          <div className={styles.smaller}>A</div>
          <input
            type="range"
            min="14"
            max="28"
            step="0.5"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          />
          <div className={styles.bigger}>A</div>
        </div>
      </div>

      {/* SHOW CHORDS */}
      <div className={styles.element}>
        <h3>Wyświetlanie akordów:</h3>

        <label className={styles.chordsToggle}>
          <input
            type="checkbox"
            checked={showChords}
            onChange={() => setShowChords((prev) => !prev)}
          />
          <span />
        </label>
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => {
            const prompt = confirm(
              "Czy na pewno chcesz przywrócić domyślne ustawienia?"
            );
            if (prompt) {
              setColorTheme(unlocked ? "black" : "light");
              setFontSize("21");
              setShowChords(false);
            }
          }}
        >
          Resetuj
        </button>

        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze."
          onClick={() => replaceLink(undefined)}
        >
          Zapisz
        </button>
      </div>
    </>
  );
}
