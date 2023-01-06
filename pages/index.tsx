import Head from "next/head";
import Image from "next/image";
import router, { useRouter } from "next/router";
import { useEffect } from "react";

import styles from "@styles/pages/index.module.scss";
import Menu from "@components/menu";
import Navbar from "@components/navbar";

export default function IndexPage() {
  const router = useRouter();
  const { query } = router;

  useEffect(() => {
    // showing & hiding menu
    const menuDiv = document.getElementById("menu") as HTMLElement;

    if (query.menu) {
      document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      menuDiv.style.visibility = "visible";
      menuDiv.style.opacity = "1";
    } else {
      document.getElementsByTagName("html")[0].style.overflowY = "";
      menuDiv.style.visibility = "";
      menuDiv.style.opacity = "";
    }
  });

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
        <Menu />

        <div className={styles.title}>
          <h1>Śpiewniki</h1>
          <button
            id="infoButton"
            title="Informacje o aplikacji"
            onClick={() => {
              router.push(
                {
                  pathname: router.asPath,
                  query: { menu: "info" },
                },
                undefined,
                {
                  scroll: false,
                }
              );
            }}
          >
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
              query: { book: "W" },
            });
          }}
        >
          <div className={styles.searchIcon}></div>
          <input
            id="input"
            placeholder="Wpisz tytuł lub numer pieśni"
            disabled
          />
        </div>

        <div className={styles.content}>
          <div className={styles.hymnBooks}>
            <h2>Wybierz śpiewnik:</h2>
            <div className={styles.grid}>
              {HymnbookButton(
                "brzask",
                "PBT",
                "/covers/brzask.jpg",
                <>
                  Pieśni&nbsp;Brzasku
                  <br />
                  Tysiąclecia
                </>
              )}

              {HymnbookButton(
                "ciegielki",
                "C",
                "/covers/cegielki.jpg",
                <>
                  Uwielbiajmy&nbsp;Pana
                  <br />
                  (Cegiełki)
                </>
              )}

              {HymnbookButton(
                "nowe",
                "N",
                "/covers/nowe.jpg",
                <>
                  Śpiewajmy&nbsp;Panu
                  <br />
                  Pieśń&nbsp;Nową
                </>
              )}

              {HymnbookButton(
                "epifania",
                "E",
                "/covers/epifania.jpg",
                <>
                  Śpiewniczek
                  <br />
                  Młodzieżowy&nbsp;Epifanii
                </>
              )}
            </div>

            <button
              id="inne"
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

            <button id="randomButton">
              <Image
                className="icon"
                alt="kostka"
                src="/icons/dice.svg"
                width={10}
                height={10}
              />
              Wylosuj pieśń
            </button>

            {OptionsButton(
              "favoriteButton",
              "favorite",
              "gwiazdka",
              "/icons/star_empty.svg",
              "Lista ulubionych"
            )}

            {OptionsButton(
              "settingsButton",
              "settings",
              "trybik",
              "/icons/settings.svg",
              "Ustawienia"
            )}

            {OptionsButton(
              "infoButton",
              "info",
              "info",
              "/icons/info.svg",
              "Informacje"
            )}
          </div>
        </div>
      </main>

      <Navbar />
    </>
  );
}

function HymnbookButton(id: string, shortcut: string, src: string, name: any) {
  return (
    <button
      id={id}
      onClick={() => {
        router.push({
          pathname: "/search",
          query: { book: `${shortcut}` },
        });
      }}
    >
      <Image
        alt="okładka śpiewnika"
        src={src}
        width={183}
        height={258}
        priority
      />
      <h3>{name}</h3>
    </button>
  );
}

function OptionsButton(
  id: string,
  link: string,
  alt: string,
  src: string,
  name: string
) {
  return (
    <button
      id={id}
      onClick={() => {
        router.push(
          {
            pathname: router.asPath,
            query: { menu: `${link}` },
          },
          undefined,
          {
            scroll: false,
          }
        );
      }}
    >
      <Image className="icon" alt={alt} src={src} width={10} height={10} />
      <p>{name}</p>
    </button>
  );
}
