import styles from "@styles/components.module.scss";

export default function Navbar() {
  return (
    <div className={styles.navigation}>
      <button id="printButton" className="onlyOnHymn">
        <img className="icon" alt="drukarka" src="/icons/printer.svg" />
        <p>Wydrukuj</p>
      </button>
      <button id="settingsButton">
        <img className="icon" alt="trybik" src="/icons/settings.svg" />
        <p>Ustawienia</p>
      </button>
      <button id="randomButton">
        <img className="icon" alt="kostka" src="/icons/dice.svg" />
        <p>Wylosuj</p>
      </button>
      <button id="favoriteButton">
        <img className="icon" alt="gwiazdka" src="/icons/star_empty.svg" />
        <p>Ulubione</p>
      </button>
      <button id="shareButton" className="onlyOnHymn">
        <img className="icon" alt="link" src="/icons/link.svg" />
        <p>Udostępnij</p>
      </button>
    </div>
  );
}
