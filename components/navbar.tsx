import Image from "next/image";

export default function Navbar() {
  return (
    <nav>
      <button id="printButton" className="onlyOnHymn icon">
        <Image
          className="icon"
          alt="drukarka"
          src="/icons/printer.svg"
          width={24}
          height={24}
        />
        <p>Wydrukuj</p>
      </button>
      <button id="settingsButton">
        <Image
          className="icon"
          alt="trybik"
          src="/icons/settings.svg"
          width={24}
          height={24}
        />
        <p>Ustawienia</p>
      </button>
      <button id="randomButton">
        <Image
          className="icon"
          alt="kostka"
          src="/icons/dice.svg"
          width={24}
          height={24}
        />
        <p>Wylosuj</p>
      </button>
      <button id="favoriteButton">
        <Image
          className="icon"
          alt="gwiazdka"
          src="/icons/star_empty.svg"
          width={22}
          height={22}
        />
        <p>Ulubione</p>
      </button>
      <button id="shareButton" className="onlyOnHymn">
        <Image
          className="icon"
          alt="link"
          src="/icons/link.svg"
          width={24}
          height={24}
        />
        <p>Udostępnij</p>
      </button>
    </nav>
  );
}
