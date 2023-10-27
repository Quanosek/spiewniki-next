import styles from "@/styles/components/menu.module.scss";

import { replaceLink } from "@/scripts/buttons";

export default function SettingsMenu() {
  return (
    <>
      <h2>Skróty klawiszowe</h2>

      <div className={styles.element}>
        {/* 

         */}
      </div>

      <div className={styles.buttons}>
        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze."
          onClick={() => replaceLink(undefined)}
        >
          Zamknij
        </button>
      </div>
    </>
  );
}
