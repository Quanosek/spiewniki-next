import Head from "next/head";
import Image from "next/image";

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
          <button id="infoButton">
            <Image
              className="icon"
              alt="info"
              src="/icons/info.svg"
              width={26}
              height={26}
            />
          </button>
        </div>

        <Searchbar />

        <div className={styles.hymnBooks}>
          <div className={styles.grid}>
            <button id="brzask">
              <Image
                alt="okładka śpiewnika"
                src="/covers/brzask.jpg"
                width={114}
                height={160}
              />
              <h2>
                Pieśni Brzasku
                <br />
                Tysiąclecia
              </h2>
            </button>
            <button id="ciegielki">
              <Image
                alt="okładka śpiewnika"
                src="/covers/cegielki.jpg"
                width={114}
                height={160}
              />
              <h2>
                Uwielbiajmy Pana
                <br />
                (Cegiełki)
              </h2>
            </button>
            <button id="nowe">
              <Image
                alt="okładka śpiewnika"
                src="/covers/nowe.jpg"
                width={114}
                height={160}
              />
              <h2>
                Śpiewajmy Panu
                <br />
                Pieśń Nową
              </h2>
            </button>
            <button id="epifania">
              <Image
                alt="okładka śpiewnika"
                src="/covers/epifania.jpg"
                width={114}
                height={160}
              />
              <h2>
                Śpiewniczek
                <br />
                Młodzieżowy Epifanii
              </h2>
            </button>
          </div>
          <button id="inne" className={styles.otherHymns}>
            <h2>Inne pieśni</h2>
          </button>
        </div>
      </main>

      <Navbar />
    </>
  );
}
