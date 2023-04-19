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

      <div className={`${styles.element} ${styles.info}`}>
        <h3>Od twórców:</h3>

        <p>
          Pomysł na napisanie aplikacji zrodził się z potrzeby posiadania
          wszystkich używanych śpiewników w jednym miejscu, bez dostępu do
          internetu. Zaczęło się od prostego programu umożliwiającego
          wyszukiwanie po numerze pieśni z jednego ze śpiewników, a przerodziło
          się z czasem w skomplikowany projekt.
        </p>
        <p>
          Nic nas nie motywuje tak bardzo do pracy jak komentarze i wsparcie ze
          strony osób, które zdecydowały się skorzystać z naszego programu.
          Jeśli więc możesz przekazać dobrowolnie kilka złotych w ramach
          podziękowania, bylibyśmy bardzo wdzięczni.
        </p>
      </div>

      <div className={styles.buttons}>
        <button
          className={styles.supportButton}
          onClick={() => router.push("https://ko-fi.com/Quanosek")}
        >
          Wesprzyj nas
        </button>
        <button>Zamknij</button>
      </div>
    </>
  );
}
