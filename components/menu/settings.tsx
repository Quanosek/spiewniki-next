import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect, ReactElement } from "react";

import styles from "@/styles/components/menu.module.scss";

import { replaceLink } from "@/scripts/buttons";

export default function SettingsMenu() {
  const router = useRouter();

  // default values
  const fontSizeValue = localStorage.getItem("fontSize")
    ? (localStorage.getItem("fontSize") as string)
    : "21";
  const [fontSize, setFontSize] = useState<string>(fontSizeValue);

  // default behavior
  useEffect(() => {
    // colorTheme
    const themeSelector = document.getElementById(
      document.documentElement.className
    ) as HTMLInputElement;

    themeSelector.checked = true;

    // fontSize
    const fontSlider = document.getElementById(
      "fontSlider"
    ) as HTMLInputElement;
    const fontPreview = document.getElementById(
      "fontPreview"
    ) as HTMLDivElement;
    fontSlider.value = fontSize as string;
    fontPreview.style.fontSize = fontSize + "px";

    // showChords
    const chordsToggle = document.getElementById(
      "chordsToggle"
    ) as HTMLInputElement;
    localStorage.getItem("showChords") ? (chordsToggle.checked = true) : "";
  }, [fontSize]);

  return (
    <>
      <h2>Ustawienia aplikacji</h2>

      {/* COLOR THEME */}
      <div className={styles.element}>
        <h3>Motyw kolorów:</h3>

        {process.env.showAll && Themes(["black", "dark", "light", "reading"])}
        {!process.env.showAll && Themes(["light", "reading", "black", "dark"])}
      </div>

      {/* FONT SIZE */}
      <div className={styles.element}>
        <h3>Wielkość tekstu pieśni:</h3>

        <div id="fontPreview" className={styles.fontPreview}>
          <p style={{ fontSize: fontSize }}>Przykładowy tekst.</p>
        </div>

        <div className={styles.fontSlider}>
          <div className={styles.smaller}>A</div>
          <input
            type="range"
            min="14"
            max="28"
            step="0.5"
            id="fontSlider"
            onChange={(e) => {
              setFontSize(e.target.value);
              localStorage.setItem("fontSize", e.target.value);
            }}
          />
          <div className={styles.bigger}>A</div>
        </div>
      </div>

      {/* SHOW CHORDS */}
      <div className={styles.element}>
        <h3>Wyświetlanie akordów:</h3>

        <label className={styles.chordsToggle}>
          <input
            id="chordsToggle"
            type="checkbox"
            onChange={(e) => {
              e.target.checked
                ? localStorage.setItem("showChords", "true")
                : localStorage.removeItem("showChords");
            }}
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
              localStorage.removeItem("colorTheme");
              localStorage.removeItem("fontSize");
              localStorage.removeItem("showChords");

              return router.reload();
            }
          }}
        >
          Resetuj
        </button>

        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze"
          onClick={() => replaceLink(undefined)}
        >
          Zapisz
        </button>
      </div>
    </>
  );
}

// quick books selection
function Themes(names: string[]) {
  const themes: ReactElement[] = [];

  names.forEach((name) => {
    themes.push(
      <label htmlFor={name} key={name}>
        <Image
          alt="przykładowy tekst"
          src="/icons/text.svg"
          width={50}
          height={50}
        />
        <input
          type="radio"
          id={name}
          name="colorTheme"
          onChange={() => {
            document.documentElement.className = name;
            localStorage.setItem("colorTheme", name);
          }}
        />
      </label>
    );
  });

  return <form className={styles.colorTheme}>{themes}</form>;
}
