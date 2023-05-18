import Image from "next/image";
import { useRouter } from "next/router";

import styles from "@/styles/components/menu.module.scss";

export default function InfoMenu() {
  const router = useRouter();

  return (
    <>
      <h2>Informacje</h2>

      <div className={`${styles.element} ${styles.info}`}>
        <Image alt="spiewniki" src="/logo/icon.svg" width={80} height={80} />

        {textFormat(
          `Przedstawiamy zupełnie nową, najbardziej zaawansowaną aplikację do wyświetlania pieśni.
          Umożliwia ona nie tylko wyszukanie i wyświetlanie treści wybranej pieśni,
          ale również wgląd na akordy bezpośrednio w tekście, lub pokazanie strony PDF
          z oryginalnego śpiewnika. Poza tym, istnieje możliwość dodawania ulubionych pieśni,
          aby nigdy o nich nie zapomnieć i mieć je zawsze pod ręką.
          Na komputerach i tabletach dostępny jest także pokaz slajdów,
          dzięki któremu można wyświetlić zwrotki pieśni, jedna po drugiej.
          Wszystkie funkcje obsługują skróty klawiszowe
          (podpisane po najechaniu kursorem na wybrany przycisk).`
        )}
      </div>

      <div className={styles.buttons}>
        <button
          title="Kliknij, lub użyj [Esc] na klawiaturze"
          onClick={() => router.back()}
        >
          Zamknij
        </button>
      </div>
    </>
  );
}

function textFormat(text: string) {
  // add non-breaking spaces with single letters words
  let pattern = /(\s)([wzoia])(\s)/g;
  let replacement = "$1$2\xa0";

  text = text.replace(pattern, replacement);
  return <p>{text}</p>;
}
