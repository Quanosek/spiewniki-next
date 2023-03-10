import Head from "next/head";
import Image from "next/image";
import router, { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";

import styles from "@/styles/pages/index.module.scss";

import Menu from "@/components/menu";
import BottomNavbar, {
  buttonLink,
  randomButton,
} from "@/components/navbar/bottom";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    window.addEventListener("keydown", keydownListener, true);
    return () => window.removeEventListener("keydown", keydownListener, true);
  }, [router, keydownListener]);

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

      <main>
        <Menu />

        <div className={styles.container}>
          <div className={styles.title}>
            <h1>Śpiewniki</h1>

            <button onClick={() => buttonLink("info")}>
              <Image
                className="icon"
                alt="info"
                src="/icons/info.svg"
                width={25}
                height={25}
              />
            </button>
          </div>

          <div
            className={styles.searchbar}
            onClick={() => {
              router.push({
                pathname: "/search",
                query: { book: "all" },
              });
            }}
          >
            <div className={styles.searchIcon}></div>
            <input
              type="text"
              id="input"
              title="Przejdź do sekcji wyszukiwania [/]"
              placeholder="Kliknij, aby rozpocząć wyszukiwanie"
              disabled
            />
          </div>

          <div className={styles.content}>
            <div className={styles.hymnBooks}>
              <h2>Wybierz śpiewnik:</h2>

              <div className={styles.grid}>
                {HymnbookButton(
                  "PBT",
                  <>
                    Pieśni&nbsp;Brzasku
                    <br />
                    Tysiąclecia
                  </>
                )}

                {HymnbookButton(
                  "UP",
                  <>
                    Uwielbiajmy&nbsp;Pana
                    <br />
                    (Cegiełki)
                  </>
                )}

                {HymnbookButton(
                  "N",
                  <>
                    Śpiewajcie&nbsp;Panu
                    <br />
                    Pieśń&nbsp;Nową
                  </>
                )}

                {HymnbookButton(
                  "E",
                  <>
                    Śpiewniczek
                    <br />
                    Młodzieżowy&nbsp;Epifanii
                  </>
                )}
              </div>

              <button
                className={styles.otherHymns}
                onClick={() => {
                  router.push({
                    pathname: "/search",
                    query: { book: "I" },
                  });
                }}
              >
                <h3>Inne pieśni</h3>
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
                  width={32}
                  height={32}
                />
                Wylosuj pieśń
              </button>

              <button
                title="Przejdź do listy ulubionych pieśni [F]"
                onClick={() => buttonLink("favorite")}
              >
                <Image
                  className="icon"
                  alt="gwiazdka"
                  src="/icons/star_empty.svg"
                  width={32}
                  height={32}
                />
                <p>Lista ulubionych</p>
              </button>

              <button
                title="Przejdź do ustawień aplikacji [S]"
                onClick={() => buttonLink("settings")}
              >
                <Image
                  className="icon"
                  alt="trybik"
                  src="/icons/settings.svg"
                  width={32}
                  height={32}
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
                  width={32}
                  height={32}
                />
                <p>Informacje</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNavbar more={false} />
    </>
  );
}

function HymnbookButton(shortcut: string, name: ReactElement) {
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
        alt="okładka śpiewnika"
        src={`/covers/${shortcut}.webp`}
        width={850}
        height={1200}
        priority={true}
      />
      <h3>{name}</h3>
    </button>
  );
}

function keydownListener(e: KeyboardEvent) {
  switch (e.key) {
    case "/":
      router.push({
        pathname: "/search",
        query: { book: "all" },
      });
      break;

    case "i":
      buttonLink("info");
      break;
  }
}
