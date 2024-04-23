import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { bookShortcut } from "@/scripts/availableBooks";
import { openMenu, randomHymn, shareButton } from "@/scripts/buttons";

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

export function Header() {
  return (
    <div className="container">
      <Link
        href="/"
        title={
          unlocked
            ? "Zebrane w jednym miejscu śpiewniki i pieśni religijne."
            : ""
        }
        className="title"
      >
        <Image
          className="icon"
          alt="logotype"
          src="/logo/bpsw.svg"
          width={45}
          height={45}
          priority={true}
          draggable={false}
        />

        <h2>Śpiewniki</h2>
      </Link>

      <div className="buttons">
        <button onClick={() => openMenu("favorites")}>
          <p>Lista ulubionych</p>
        </button>

        <button onClick={() => openMenu("settings")}>
          <p>Ustawienia</p>
        </button>

        <button className="desktopOnly" onClick={() => openMenu("shortcuts")}>
          <p>Skróty klawiszowe</p>
        </button>

        {!unlocked && (
          <Link href="https://nastrazy.org/">
            <p>Nastrazy.org</p>
          </Link>
        )}
      </div>
    </div>
  );
}

export function MobileNavbar() {
  const router = useRouter();

  let moreButtons = true;
  if (!unlocked && router.pathname === "/") moreButtons = false;

  return (
    <nav>
      {moreButtons && (
        <button
          onClick={() => {
            localStorage.removeItem("prevSearch");
            unlocked ? router.push("/books") : router.push("/");
          }}
        >
          <Image
            className="icon"
            alt="books"
            src="/icons/book.svg"
            width={20}
            height={20}
            draggable={false}
          />
          <p>Śpiewniki</p>
        </button>
      )}

      <button onClick={() => openMenu("favorites")}>
        <Image
          className="icon"
          alt="list"
          src="/icons/list.svg"
          width={20}
          height={20}
          draggable={false}
        />
        <p>Ulubione</p>
      </button>

      <button
        onClick={() => {
          const book = router.query.book as string;
          randomHymn(bookShortcut(book));
        }}
      >
        <Image
          className="icon"
          alt="random"
          src="/icons/dice.svg"
          width={20}
          height={20}
          draggable={false}
        />
        <p>Wylosuj</p>
      </button>

      <button onClick={() => openMenu("settings")}>
        <Image
          className="icon"
          alt="settings"
          src="/icons/settings.svg"
          width={20}
          height={20}
          draggable={false}
        />
        <p>Ustawienia</p>
      </button>

      {moreButtons && (
        <button onClick={shareButton}>
          <Image
            className="icon"
            alt="share"
            src="/icons/link.svg"
            width={20}
            height={20}
            draggable={false}
          />
          <p>Udostępnij</p>
        </button>
      )}
    </nav>
  );
}

export function Footer({ children }: any) {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

  return (
    <div className="container">
      <div>
        <p>
          Stworzone z {unlocked ? "💙" : "❤️"} przez{" "}
          <Link href="https://github.com/Quanosek/">Jakuba Kłało</Link>
          {" i "}
          <Link href="https://github.com/Krist0f0l0s/">
            Krzysztofa Olszewskiego
          </Link>
        </p>

        <p>
          Wszelkie prawa zastrzeżone &#169; 2022-{new Date().getFullYear()}
          {unlocked ? (
            <>
              {" │ "}
              domena&nbsp;<Link href="https://www.klalo.pl/">klalo.pl</Link>
            </>
          ) : (
            ""
          )}
        </p>
      </div>

      {children}
    </div>
  );
}
