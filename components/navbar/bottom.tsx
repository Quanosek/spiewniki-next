import Image from "next/image";
import router, { useRouter } from "next/router";

import styles from "@/styles/components/navbar.module.scss";
import { useEffect } from "react";

export default function bottomNavbar(param: { more: boolean }) {
  const more = param.more;
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    window.addEventListener("keydown", keydownListener, true);
    return () => window.removeEventListener("keydown", keydownListener, true);
  }, [router, keydownListener]);

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
  router.replace(
    {
      query: { ...router.query, menu: name },
    },
    undefined,
    { shallow: true, scroll: false }
  );
}

export function randomButton() {
  return;
}

function keydownListener(e: KeyboardEvent) {
  (document.activeElement as HTMLElement).blur();
  const { menu, ...params } = router.query;

  switch (e.key) {
    case "r":
      if (!menu) {
        randomButton();
        return;
      }
      break;

    case "f":
      buttonLink("favorite");
      break;

    case "s":
      buttonLink("settings");
      break;

    case "Escape":
      if (menu) {
        router.replace({
          query: { ...params },
        });
      }
      break;
  }
}
