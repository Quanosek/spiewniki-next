import Image from "next/image";
import { useState, useEffect, useCallback, ReactElement } from "react";

import styles from "@/styles/components/menu.module.scss";

import { openMenu } from "@/scripts/buttons";

interface Settings {
  themeColor: string;
  fontSize: number;
  showChords: boolean;
  contextSearch: boolean;
  quickSearch: boolean;
}

// default settings values
const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

export const defaultSettings = {
  themeColor: unlocked ? "black" : "light",
  fontSize: 21,
  showChords: false,
  contextSearch: true,
  quickSearch: true,
};

export default function SettingsMenu() {
  const settings: Settings = JSON.parse(
    localStorage.getItem("settings") as string
  );

  // dynamic states
  const [
    { fontSize, themeColor, showChords, contextSearch, quickSearch },
    setState,
  ] = useState(settings || defaultSettings);

  // save settings to local storage
  const saveSettings = useCallback(() => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        themeColor,
        fontSize,
        showChords,
        contextSearch,
        quickSearch,
      })
    );
  }, [themeColor, fontSize, showChords, contextSearch, quickSearch]);

  // save settings on change
  useEffect(() => {
    saveSettings();
    document.documentElement.className = `${document.documentElement.classList[0]} ${themeColor}`;
  }, [saveSettings, themeColor]);

  // theme colors labels
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
            name="themeColor"
            checked={themeColor === name}
            onChange={() => {
              setState((prevState) => ({
                ...prevState,
                themeColor: name,
              }));
            }}
          />
        </label>
      );
    });

    return <form className={styles.themeSelection}>{themes}</form>;
  };

  // quick settings options buttons
  const ToggleSwitch = (description: string, name: string, value: boolean) => (
    <div className={styles.toggle}>
      <p>{description}</p>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          name="toggle-checkbox"
          checked={value}
          onChange={() => {
            setState((prevState: any) => {
              return {
                ...prevState,
                [name]: !prevState[name],
              };
            });
          }}
        />

        <span />
      </label>
    </div>
  );

  return (
    <>
      <h2>Ustawienia</h2>

      <div className={styles.content}>
        {/* THEME COLOR */}
        <div className={styles.settingsSection}>
          <h3>Motyw kolorów:</h3>

          {unlocked
            ? Themes(["black", "dark", "light", "reading"])
            : Themes(["light", "reading", "black", "dark"])}
        </div>

        {/* FONT SIZE */}
        <div className={styles.settingsSection}>
          <h3>Wielkość tekstu pieśni:</h3>

          <div className={styles.fontPreview}>
            <p style={{ fontSize }}>Przykładowy tekst.</p>
          </div>

          <div className={styles.fontSlider}>
            <div className={styles.smaller}>A</div>

            <input
              type="range"
              min="14"
              max="28"
              step="0.5"
              value={fontSize}
              onChange={(e) => {
                setState((prevState) => ({
                  ...prevState,
                  fontSize: Number(e.target.value),
                }));
              }}
            />

            <div className={styles.bigger}>A</div>
          </div>
        </div>

        {/* QUICK OPTIONS SWITCHERS */}
        <div className={styles.settingsSection}>
          {ToggleSwitch(
            "Wyświetlanie akordów nad liniami tekstu",
            "showChords",
            showChords
          )}

          {ToggleSwitch(
            "Wyszukiwanie w treści pieśni",
            "contextSearch",
            contextSearch
          )}

          {ToggleSwitch(
            "Szybki powrót do ostatniego wyszukiwania ",
            "quickSearch",
            quickSearch
          )}
        </div>
      </div>

      {/* MENU BUTTONS */}
      <div className={styles.buttons}>
        <button
          className={styles.alert}
          onClick={() => {
            const prompt = confirm(
              "Czy na pewno chcesz przywrócić ustawienia domyślne?"
            );

            if (prompt) setState({ ...defaultSettings });
          }}
        >
          Przywróć domyślne
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
