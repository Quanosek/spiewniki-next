import Head from "next/head";

import styles from "@styles/main.module.scss";

import Searchbar from "@components/searchbar";
import Navbar from "@components/navbar";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Śpiewniki</title>
        <meta
          name="description"
          content="Oficjalna strona ze wszystkimi śpiewnikami Badaczy Pisma Świętego | Krzysztof Olszewski i Jakub Kłało, Wszelkie prawa zastrzeżone ©&nbsp;2022-2023"
        />
        <meta
          name="keywords"
          content="Dabhar, dabhar.org, ZWBPS, ZWBP ŚW, BPSW, Badacze, Wolni badacze, badaczy, Zrzeszenie Wolnych Badaczy Pisma Świętego, Świecki Ruch Misyjny Epifania, Zrzeszenie, Kraków, Warszawa, Białogard, Biłgoraj, nastrazy.org, Na Straży, Wędrówka, Wędrowniczek, Zbawienie.pl, 52Prawdy, śpiewniki, śpiewnik, śpiewnik młodzieżowy, Brzask, brzasku, Śpiewnik Brzasku Tysiąclecia, Cegiełki, Uwielbiajmy Pana, Nowe Pieśni, Koziańskie, Kozy, Poznańskie, Poznań, Śpiewajmy Panu Pieśń Nową, tekst, teksty, słowa, wszystkie pieśni, piosenki, obóz, obozowe, piosenki obozowe, kursy biblijne, kursy, kolonie, kolonia religijna, konwencja, konwencje, Krzysztof Olszewski, Jakub Kłało, klalo.pl"
        />
      </Head>

      <main>
        <div className={styles.title}>
          <h1>Śpiewniki</h1>
          <button id="infoButton" title="Informacje o aplikacji">
            <img className="icon" alt="info" src="/icons/info.svg" />
          </button>
        </div>

        <Searchbar />
        <div className={styles.content}>
          <div className={styles.hymnBooks}>
            <h2>Wybierz śpiewnik:</h2>
            <div className={styles.grid}>
              <button id="brzask">
                <img alt="okładka śpiewnika" src="/covers/brzask.jpg" />
                <h3>
                  Pieśni Brzasku
                  <br />
                  Tysiąclecia
                </h3>
              </button>
              <button id="ciegielki">
                <img alt="okładka śpiewnika" src="/covers/cegielki.jpg" />
                <h3>
                  Uwielbiajmy Pana
                  <br />
                  (Cegiełki)
                </h3>
              </button>
              <button id="nowe">
                <img alt="okładka śpiewnika" src="/covers/nowe.jpg" />
                <h3>
                  Śpiewajmy Panu
                  <br />
                  Pieśń Nową
                </h3>
              </button>
              <button id="epifania">
                <img alt="okładka śpiewnika" src="/covers/epifania.jpg" />
                <h3>
                  Śpiewniczek
                  <br />
                  Młodzieżowy Epifanii
                </h3>
              </button>
            </div>
            <button id="inne" className={styles.otherHymns}>
              <h3>Inne pieśni</h3>
            </button>
          </div>
          <hr />
          <div className={styles.optionsMenu}>
            <h2>Dostępne opcje:</h2>
            <button id="randomButton">
              <img className="icon" alt="kostka" src="/icons/dice.svg" />
              Wylosuj pieśń
            </button>
            <button id="favoriteButton">
              <img
                className="icon"
                alt="gwiazdka"
                src="/icons/star_empty.svg"
              />
              Lista ulubionych
            </button>
            <button id="settingsButton">
              <img className="icon" alt="trybik" src="/icons/settings.svg" />
              Ustawienia
            </button>
            <button id="infoButton">
              <img className="icon" alt="info" src="/icons/info.svg" />
              Informacje
            </button>
          </div>
        </div>
      </main>

      <Navbar />
    </>
  );
}
