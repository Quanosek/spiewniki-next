import styles from "@/styles/components/menu.module.scss";

import { replaceLink } from "@/scripts/buttons";

export default function ShortcutsMenu() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  interface ShortcutProps {
    keyup: string;
    action: string;
  }

  const Shortcut = ({ keyup, action }: ShortcutProps) => (
    <div className={styles.shortcut}>
      <span className={styles.keyup}>
        <p>{keyup}</p>
      </span>

      <p className={styles.action}>{action}</p>
    </div>
  );

  return (
    <>
      <h2>Skróty klawiszowe</h2>

      <div className={styles.shortcutList}>
        <Shortcut keyup="/" action="Wyszukiwanie we wszystkich śpiewnikach" />

        {unlocked && (
          <Shortcut keyup="B" action="Lista wszystkich śpiewników" />
        )}

        <Shortcut keyup="R" action="Losowa pieśń (z wybranego śpiewnika)" />
        <Shortcut keyup="F" action="Lista ulubionych pieśni" />
        <Shortcut keyup="S" action="Ustawienia aplikacji" />
        <Shortcut keyup="Esc" action="Wyjście z trybu menu/prezentacji" />
        <Shortcut keyup="P" action="Tryb prezentacji" />
        <Shortcut
          keyup="N"
          action="Dokument PDF wybranej pieśni (jeśli istnieje)"
        />
        <Shortcut keyup="→" action="Następna pieśń w śpiewniku" />
        <Shortcut keyup="←" action="Poprzednia pieśń w śpiewniku" />
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
