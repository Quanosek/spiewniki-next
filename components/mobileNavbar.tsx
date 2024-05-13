import Image from "next/image";
import { useRouter } from "next/router";

import { bookShortcut } from "@/scripts/availableBooks";
import { randomHymn, shareButton } from "@/scripts/buttons";
import { hiddenMenuQuery } from "./menu";

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

export default function MobileNavbarComponent() {
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

      <button onClick={() => hiddenMenuQuery("favorites")}>
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

      <button onClick={() => hiddenMenuQuery("settings")}>
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
