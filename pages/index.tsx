import Head from "next/head";
import Image from "next/image";
import router from "next/router";
import { ReactElement } from "react";

import styles from "@/styles/pages/index.module.scss";

import Menu from "@/components/menu";
import BottomNavbar, {
  buttonLink,
  randomButton,
} from "@/components/navbar/bottom";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Śpiewniki</title>
        <meta
          name="description"
          content='Oficjalna strona z zebranymi w jednym miejscu wszystkimi pieśniami: Zrzeszenia Wolnych Badaczy Pisma Świętego, Świeckiego Ruchu Misyjnego "Epifania", Chóru "Syloe" i wielu innych. | Wszelkie prawa zastrzeżone &#169; 2023 | Jakub Kłało'
        />
        <meta
          name="keywords"
          content="Dabhar, dabhar.org, ZWBPS, ZWBP ŚW, BPSW, Badacze, Wolni badacze, badaczy, Zrzeszenie Wolnych Badaczy Pisma Świętego, Świecki Ruch Misyjny Epifania, Epifanii, Zrzeszenie, Kraków, Warszawa, Białogard, Biłgoraj, nastrazy.org, Na Straży, Wędrówka, Wędrowniczek, Zbawienie.pl, 52Prawdy, śpiewniki, śpiewnik, śpiewnik młodzieżowy, śpiewniczek, śpiewniczki, Brzask, brzasku, Śpiewnik Brzasku Tysiąclecia, Cegiełki, Uwielbiajmy Pana, Nowe Pieśni, Koziańskie, Kozy, Poznańskie, Poznań, Śpiewajmy Panu Pieśń Nową, tekst, teksty, słowa, wszystkie pieśni, piosenki, nuty, pdf, obóz, obozowe, piosenki obozowe, kursy biblijne, kursy, kolonie, kolonia religijna, konwencja, konwencje, Jakub Kłało, klalo.pl"
        />
      </Head>

      {/* menu buttons display */}
      <Menu />

      <main>
        <div className={styles.mobileTitle}>
          <h1>Śpiewniki</h1>

          <button
            className={styles.infoButton}
            onClick={() => buttonLink("info")}
          >
            <Image
              className="icon"
              alt="info"
              src="/icons/info.svg"
              width={25}
              height={25}
              draggable="false"
            />
          </button>
        </div>

        <button
          className={styles.searchBox}
          onClick={() => router.push("/search")}
        >
          <Image
            className="icon"
            alt="search"
            src="/icons/search.svg"
            width={25}
            height={25}
            draggable="false"
          />
          <p>Rozpocznij wyszukiwanie...</p>
        </button>

        <div className={styles.container}>
          <div className={styles.hymnBooks}>
            <div className={styles.grid}>
              {HymnbookButton(
                "PBT",
                "Okładka śpiewnika Pieśni Brzasku Tysiąclecia",
                <>
                  Pieśni&nbsp;Brzasku
                  <br />
                  Tysiąclecia
                </>
              )}

              {HymnbookButton(
                "UP",
                "Okładka śpiewnika Uwielbiamy Pana (Cegiełki)",
                <>
                  Uwielbiajmy&nbsp;Pana
                  <br />
                  (Cegiełki)
                </>
              )}

              {HymnbookButton(
                "N",
                "Okładka śpiewnika Śpiewajmy Panu Pieśń Nową",
                <>
                  Śpiewajcie&nbsp;Panu
                  <br />
                  Pieśń&nbsp;Nową
                </>
              )}

              {HymnbookButton(
                "E",
                "Okładka Śpiewniczka Młodzieżowego Epifanii",
                <>
                  Śpiewniczek
                  <br />
                  Młodzieżowy&nbsp;Epifanii
                </>
              )}
            </div>

            <button
              className={styles.otherHymns}
              onClick={() => router.push("/books")}
            >
              <h3>Lista wszystkich śpiewników</h3>
            </button>
          </div>

          <hr />

          <div className={styles.optionsMenu}>
            <h2>Dostępne opcje:</h2>

            <button
              title="Otwórz losową pieśń [R]"
              onClick={() => randomButton()}
            >
              <Image
                className="icon"
                alt="kostka"
                src="/icons/dice.svg"
                width={20}
                height={20}
              />
              <p>Wylosuj pieśń</p>
            </button>

            <button
              title="Przejdź do listy ulubionych pieśni [F]"
              onClick={() => buttonLink("favorite")}
            >
              <Image
                className="icon"
                alt="gwiazdka"
                src="/icons/bookmark.svg"
                width={20}
                height={20}
              />
              <p>Zakładki</p>
            </button>

            <button
              title="Przejdź do ustawień aplikacji [S]"
              onClick={() => buttonLink("settings")}
            >
              <Image
                className="icon"
                alt="trybik"
                src="/icons/settings.svg"
                width={20}
                height={20}
              />
              <p>Ustawienia</p>
            </button>

            <button
              title="Informacje od twórców strony [I]"
              onClick={() => buttonLink("info")}
            >
              <Image
                className="icon"
                alt="info"
                src="/icons/info.svg"
                width={20}
                height={20}
              />
              <p>Informacje</p>
            </button>
          </div>
        </div>

        {/* <div className={styles.tagsMenu}>
          <h2>Przeglądaj pieśni według słów kluczowych:</h2>

          {TagButtons([
            "Wieczerza Pańska",
            "Chrzest",
            "Pogrzeb",
            "Nabożeństwo świadectw i modlitw",
            "Nabożeństwo noworoczne",
          ])}

          {TagButtons([
            "Dla najmłodszych",
            "Radosne",
            "Szybkie",
            "Krótkie",
            "O poranku",
            "Na wieczór",
            "Spokojne",
            "Długie",
            "Smutne",
            "Z pokazywaniem",
            "Po hebrajsku",
            "Dla chóru",
            "Śpiewane na głosy",
          ])}
        </div> */}
      </main>

      {/* navbar buttons on mobile view */}
      <BottomNavbar more={false} />
    </>
  );
}

// quick hymnbook selection
function HymnbookButton(shortcut: string, alt: string, name: ReactElement) {
  return (
    <button
      onClick={() => {
        router.push({
          pathname: "/search",
          query: { book: shortcut },
        });
      }}
    >
      <Image
        alt={alt}
        src={`/covers/${shortcut}.webp`}
        width={850}
        height={1200}
        priority={true}
      />
      <h3>{name}</h3>
    </button>
  );
}

// // quick tag selection
// function TagButtons(buttons: any) {
//   return (
//     <div className={styles.tagsCategory}>
//       {buttons.map((name: string, index: number) => {
//         return (
//           <button
//             key={index}
//             onClick={() => {
//               router.push({
//                 pathname: "/search",
//                 query: { tags: name },
//               });
//             }}
//           >
//             <p>{name}</p>
//           </button>
//         );
//       })}
//     </div>
//   );
// }
