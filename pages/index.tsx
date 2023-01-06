import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import styles from "@styles/pages/index.module.scss";
import Menu from "@components/menu";
import Navbar from "@components/navbar";

export default function IndexPage() {
  const router = useRouter();
  const { query } = router;

  // showing & hiding menu
  useEffect(() => {
    const menu = document.getElementById("menu") as HTMLElement;
    if (query.menu) {
      document.getElementsByTagName("html")[0].style.overflowY = "hidden";
      menu.style.visibility = "visible";
      menu.style.opacity = "1";
    } else {
      document.getElementsByTagName("html")[0].style.overflowY = "";
      menu.style.visibility = "";
      menu.style.opacity = "";
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

        <Link href="/search" className={styles.searchbar}>
          <div className={styles.searchIcon}></div>
          <input
            id="input"
            placeholder="Wpisz tytuł lub numer pieśni"
            disabled
          />
        </Link>

        <div className={styles.content}>
          <div className={styles.hymnBooks}>
            <h2>Wybierz śpiewnik:</h2>
            <div className={styles.grid}>
              <button
                id="brzask"
                onClick={() => {
                  router.push("/search" + "?book=" + "brzask");
                }}
              >
                <Image
                  alt="okładka śpiewnika"
                  src="/covers/brzask.jpg"
                  width={183}
                  height={258}
                  priority
                />
                <h3>
                  Pieśni&nbsp;Brzasku
                  <br />
                  Tysiąclecia
                </h3>
              </button>
              <button
                id="ciegielki"
                onClick={() => {
                  router.push("/search" + "?book=" + "cegielki");
                }}
              >
                <Image
                  alt="okładka śpiewnika"
                  src="/covers/cegielki.jpg"
                  width={183}
                  height={258}
                  priority
                />
                <h3>
                  Uwielbiajmy&nbsp;Pana
                  <br />
                  (Cegiełki)
                </h3>
              </button>
              <button
                id="nowe"
                onClick={() => {
                  router.push("/search" + "?book=" + "nowe");
                }}
              >
                <Image
                  alt="okładka śpiewnika"
                  src="/covers/nowe.jpg"
                  width={183}
                  height={258}
                  priority
                />
                <h3>
                  Śpiewajmy&nbsp;Panu
                  <br />
                  Pieśń&nbsp;Nową
                </h3>
              </button>
              <button
                id="epifania"
                onClick={() => {
                  router.push("/search" + "?book=" + "epifania");
                }}
              >
                <Image
                  alt="okładka śpiewnika"
                  src="/covers/epifania.jpg"
                  width={183}
                  height={258}
                  priority
                />
                <h3>
                  Śpiewniczek
                  <br />
                  Młodzieżowy&nbsp;Epifanii
                </h3>
              </button>
            </div>
            <button
              id="inne"
              className={styles.otherHymns}
              onClick={() => {
                router.push("/search" + "?book=" + "inne");
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
            <button
              id="favoriteButton"
              onClick={() => {
                router.push(
                  {
                    pathname: router.asPath,
                    query: { menu: "favorite" },
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
                alt="gwiazdka"
                src="/icons/star_empty.svg"
                width={10}
                height={10}
              />
              Lista ulubionych
            </button>
            <button
              id="settingsButton"
              onClick={() => {
                router.push(
                  {
                    pathname: router.asPath,
                    query: { menu: "settings" },
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
                alt="trybik"
                src="/icons/settings.svg"
                width={10}
                height={10}
              />
              Ustawienia
            </button>
            <button
              id="infoButton"
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
                width={10}
                height={10}
              />
              Informacje
            </button>
          </div>
        </div>
      </main>

      <Navbar />
    </>
  );
}
