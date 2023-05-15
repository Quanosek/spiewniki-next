import styles from "@/styles/components/menu.module.scss";
import { useRouter } from "next/router";

export default function InfoMenu() {
  const router = useRouter();
  
  return (
    <>
      <h2>Informacje</h2>

      <div className={`${styles.element} ${styles.info}`}>
        <h3>O aplikacji:</h3>

        <p>
          Przedstawiamy zupełnie nową, najbardziej zaawansowaną aplikację do
          wyświetlania pieśni. Umożliwia ona nie tylko wyszukanie i wyświetlanie
          treści wybranej pieśni, ale również wgląd na akordy bezpośrednio w
          tekście, lub pokazanie strony PDF z oryginalnego śpiewnika. Poza tym,
          istnieje możliwość dodawania ulubionych pieśni, aby nigdy o nich nie
          zapomnieć i mieć je zawsze pod ręką. Na komputerach i tabletach
          dostępny jest także pokaz slajdów, dzięki któremu można wyświetlić
          zwrotki pieśni, jedna po drugiej. Wszystkie funkcje obsługują skróty
          klawiszowe (podpisane po najechaniu kursorem na wybrany przycisk).
        </p>
      </div>

      <div className={styles.buttons}>
        <button onClick={()=>router.back()}>Zamknij</button>
      </div>
    </>
  );
}
