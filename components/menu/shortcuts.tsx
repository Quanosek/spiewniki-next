import { useRouter } from "next/router";
import { hiddenMenuQuery } from "../menu";

import styles from "@/styles/components/menu.module.scss";

interface ShortcutProps {
  keyup: string;
  action: string;
}

export default function ShortcutsMenu() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
  const router = useRouter();

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

      <div className={styles.content}>
        <Shortcut keyup="Esc" action="Wyjście z widoku menu" />
        <Shortcut
          keyup="/"
          action={
            router.route === "/search"
              ? "Powrót do paska wyszukiwania"
              : "Wyszukiwanie we wszystkich śpiewnikach"
          }
        />

        {unlocked && (
          <Shortcut keyup="B" action="Lista wszystkich śpiewników" />
        )}
      </div>

      <div className={styles.content}>
        <Shortcut
          keyup="R"
          action={`Losowa pieśń
              ${router.route !== "/" ? " z wybranego śpiewnika" : ""}`}
        />

        {router.route === "/hymn" && (
          <>
            <Shortcut keyup="P" action="Pokaz slajdów wybranej pieśni" />
            <Shortcut
              keyup="D"
              action="Dokument PDF wybranej pieśni (jeśli istnieje)"
            />
            <Shortcut keyup="←" action="Poprzednia pieśń w śpiewniku" />
            <Shortcut keyup="→" action="Następna pieśń w śpiewniku" />
          </>
        )}
      </div>

      <div className={styles.buttons}>
        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze, aby zamknąć menu."
          onClick={() => hiddenMenuQuery(undefined)}
        >
          <p>Zamknij</p>
        </button>
      </div>
    </>
  );
}
