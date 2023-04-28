import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import router from "next/router";
import { ReactElement } from "react";

import styles from "@/styles/pages/index.module.scss";

import bookNames from "@/scripts/bookNames";

import Menu from "@/components/menu";
import BottomNavbar from "@/components/navbar/bottom";

import { buttonLink, randomButton } from "@/scripts/buttons";

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
        </div>

        <Link href={"/search"} className={styles.searchBox}>
          <Image
            className="icon"
            alt="search"
            src="/icons/search.svg"
            width={25}
            height={25}
            draggable="false"
          />
          <p>Rozpocznij wyszukiwanie...</p>
        </Link>

        <div className={styles.container}>
          <div className={styles.hymnBooks}>
            {Books(["PBT", "UP", "N", "E"])}

            <Link href={"/books"} className={styles.all}>
              <p>Lista wszystkich śpiewników</p>
            </Link>
          </div>

          <hr />

          <div className={styles.optionsButtons}>
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
              title="Skopiuj link do aplikacji i podziel się nią ze znajomymi!"
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
                width={20}
                height={20}
              />
              <p>Udostępnij</p>
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

          {Tags([
            "Wieczerza Pańska",
            "Chrzest",
            "Pogrzeb",
            "Nabożeństwo świadectw i modlitw",
            "Nabożeństwo noworoczne",
          ])}

          {Tags([
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

function Books(names: string[]) {
  const books: ReactElement[] = [];

  names.forEach((name) => {
    books.push(
      <Link
        href={{
          pathname: `/search`,
          query: { book: name },
        }}
        key={name}
      >
        <Image
          alt="okładka"
          src={`/covers/${name}.webp`}
          width={850}
          height={1200}
          priority={true}
        />
        <p>{bookNames(name)}</p>
      </Link>
    );
  });

  return <div className={styles.books}>{books}</div>;
}

// // quick tag selection
// function Tags(buttons: string[]) {
//   const tags: ReactElement[] = [];

//   buttons.forEach((name) => {
//     tags.push(
//       <Link
//         href={{
//           pathname: "/search",
//           query: { tags: name },
//         }}
//         key={name}
//       >
//         <p>{name}</p>
//       </Link>
//     );
//   });

//   return <div className={styles.tagsCategory}>{tags}</div>;
// }
