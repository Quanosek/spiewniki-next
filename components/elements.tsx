import Image from "next/image";
import Link from "next/link";
import router from "next/router";

import bookShortcut from "@/scripts/bookShortcut";
import { replaceLink, randomHymn, shareButton } from "@/scripts/buttons";

export function Navbar() {
  return (
    <nav>
      <button onClick={() => router.push("/books")}>
        <Image
          className="icon"
          alt="books"
          src="/icons/book.svg"
          width={16}
          height={16}
          draggable={false}
        />
        <p>Śpiewniki</p>
      </button>

      <button onClick={() => replaceLink("favorites")}>
        <Image
          className="icon"
          alt="list"
          src="/icons/list.svg"
          width={16}
          height={16}
          draggable={false}
        />
        <p>Ulubione</p>
      </button>

      <button
        id="randomButton"
        onClick={() => {
          return randomHymn(bookShortcut(router.query.book as string));
        }}
      >
        <Image
          className="icon"
          alt="random"
          src="/icons/dice.svg"
          width={16}
          height={16}
          draggable={false}
        />
        <p>Wylosuj</p>
      </button>

      <button onClick={() => replaceLink("settings")}>
        <Image
          className="icon"
          alt="settings"
          src="/icons/settings.svg"
          width={16}
          height={16}
          draggable={false}
        />
        <p>Ustawienia</p>
      </button>

      <button onClick={shareButton}>
        <Image
          className="icon"
          alt="share"
          src="/icons/link.svg"
          width={16}
          height={16}
          draggable={false}
        />
        <p>Udostępnij</p>
      </button>
    </nav>
  );
}

export function Footer() {
  return (
    <div className="container">
      <p>
        Stworzone z ❤️ przez{" "}
        <Link href="https://github.com/Quanosek">Jakuba Kłało</Link>
        {" i "}
        <Link href="https://github.com/Krist0f0l0s">
          Krzysztofa Olszewskiego
        </Link>
        .
      </p>

      <p>Wszelkie prawa zastrzeżone &#169; 2023</p>
    </div>
  );
}

export function MobileHeader() {
  return (
    <div className="mobileHeader">
      <Image
        className="icon"
        alt="bpsw"
        src="/logo/bpsw.svg"
        width={50}
        height={50}
        priority={true}
        draggable={false}
      />

      <h1>Śpiewniki</h1>
    </div>
  );
}
