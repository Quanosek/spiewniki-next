import Image from "next/image";
import router from "next/router";

import styles from "@/styles/components/navbar.module.scss";

export default function bottomNavbar(param: { more: boolean }) {
  const more = param.more;

  return (
    <div className={styles.bottom}>
      {more && (
        <button onClick={() => window.print()}>
          <Image
            className="icon"
            alt="drukarka"
            src="/icons/printer.svg"
            width={30}
            height={30}
          />
          <p>Wydrukuj</p>
        </button>
      )}

      <button
        onClick={() => {
          router.push(
            { query: { ...router.query, menu: "settings" } },
            undefined,
            { scroll: false }
          );
        }}
      >
        <Image
          className="icon"
          alt="trybik"
          src="/icons/settings.svg"
          width={30}
          height={30}
        />
        <p>Ustawienia</p>
      </button>

      <button onClick={() => {}}>
        <Image
          className="icon"
          alt="kostka"
          src="/icons/dice.svg"
          width={30}
          height={30}
        />
        <p>Wylosuj</p>
      </button>

      <button
        onClick={() => {
          router.push(
            { query: { ...router.query, menu: "favorite" } },
            undefined,
            { scroll: false }
          );
        }}
      >
        <Image
          className="icon"
          alt="gwiazdka"
          src="/icons/star_empty.svg"
          width={30}
          height={30}
        />
        <p>Ulubione</p>
      </button>

      {more && (
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: "Śpiewniki",
                text: "Udostępnij pieśń znajomym!",
                url: router.asPath,
              });
            }
          }}
        >
          <Image
            className="icon"
            alt="link"
            src="/icons/link.svg"
            width={30}
            height={30}
          />
          <p>Udostępnij</p>
        </button>
      )}
    </div>
  );
}
