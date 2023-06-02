import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, ReactElement } from "react";

import styles from "@/styles/components/menu.module.scss";

export default function SettingsMenu() {
  const router = useRouter();

  useEffect(() => {
    // check current theme
    const themeSelector = document.getElementById(
      document.documentElement.className
    ) as HTMLInputElement;

    themeSelector.checked = true;

    // set fontSize slider
    const fontSize = document.getElementById("fontSize") as HTMLInputElement;
    fontSize.value = localStorage.getItem("fontSize") as string;

    // hide/show chords
    const chordsToggle = document.getElementById(
      "chordsToggle"
    ) as HTMLInputElement;

    localStorage.getItem("showChords") ? (chordsToggle.checked = true) : "";
  }, []);

  return (
    <>
      <h2>Ustawienia aplikacji</h2>

      <div className={styles.element}>
        <h3>Motyw kolorów:</h3>

        {Themes(["light", "reading", "black", "dark"])}
      </div>

      <div className={styles.element}>
        <h3>Wielkość tekstu:</h3>

        <div className={styles.fontSize}>
          <div className={styles.smaller}>A</div>
          <input
            type="range"
            min="14"
            max="28"
            step="0.5"
            id="fontSize"
            onLoad={(e) => {
              const fontSize = localStorage.getItem("fontSize") as string;
              const slider = e.target as HTMLInputElement;
              slider.value = fontSize ? fontSize : "21";
            }}
            onChange={(e) => localStorage.setItem("fontSize", e.target.value)}
          />
          <div className={styles.bigger}>A</div>
        </div>
      </div>

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
            if (prompt == true) {
              localStorage.removeItem("theme");
              localStorage.removeItem("fontSize");
              localStorage.removeItem("showChords");

              router.reload();
            }
          }}
        >
          Resetuj
        </button>
        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze"
          onClick={() => router.back()}
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
          name="theme"
          onChange={() => {
            document.documentElement.className = name;
            localStorage.setItem("theme", name);
          }}
        />
      </label>
    );
  });

  return <form className={styles.colorTheme}>{themes}</form>;
}
