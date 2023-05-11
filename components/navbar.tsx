import Image from "next/image";
import { useRouter } from "next/router";

import styles from "@/styles/components/navbar.module.scss";

import { buttonLink, randomButton } from "@/scripts/buttons";

export default function bottomNavbar(param: { more: boolean }) {
  const more = param.more;

  const router = useRouter();

  return (
    <div className={styles.bottom}>
      {(more && (
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
      )) || (
        <button onClick={() => buttonLink("info")}>
          <Image
            className="icon"
            alt="info"
            src="/icons/info.svg"
            width={16}
            height={16}
          />
          <p>Informacje</p>
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

      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: "Śpiewniki",
              text: "Udostępnij śpiewniki!",
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
    </div>
  );
}
