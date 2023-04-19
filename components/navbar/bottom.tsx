import Image from "next/image";
import router from "next/router";

import axios from "axios";

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
            width={16}
            height={16}
          />
          <p>Wydrukuj</p>
        </button>
      )}

      <button onClick={() => buttonLink("settings")}>
        <Image
          className="icon"
          alt="trybik"
          src="/icons/settings.svg"
          width={16}
          height={16}
        />
        <p>Ustawienia</p>
      </button>

      <button onClick={() => randomButton()}>
        <Image
          className="icon"
          alt="kostka"
          src="/icons/dice.svg"
          width={16}
          height={16}
        />
        <p>Wylosuj</p>
      </button>

      <button onClick={() => buttonLink("favorite")}>
        <Image
          className="icon"
          alt="gwiazdka"
          src="/icons/star_empty.svg"
          width={16}
          height={16}
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
            width={16}
            height={16}
          />
          <p>Udostępnij</p>
        </button>
      )}
    </div>
  );
}

export function buttonLink(name: string) {
  router.push(
    {
      query: { ...router.query, menu: name },
    },
    undefined,
    { shallow: true, scroll: false }
  );
}

export function randomButton() {
  (async () => {
    const data = await axios.get(`/api/xml`).then(({ data }) => data);
    const random = Math.floor(Math.random() * (Math.floor(data.length) + 1));

    router.push({
      pathname: "/hymn",
      query: {
        book: data[random].book,
        title: data[random].title,
      },
    });
  })();
}
