import Head from "next/head";
import Image from "next/image";
import Script from "next/script";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.scss";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-HCQEGEJ39Q"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-HCQEGEJ39Q');
      `}
      </Script>

      <Head>
        <title>Śpiewniki | Zrzeszenie Wolnych Badaczy Pisma Świętego</title>
        <meta
          name="description"
          content="Wszystkie Śpiewniki Zrzeszenia Wolnych Badaczy Pisma Świętego | Krzysztof Olszewski i Jakub Kłało, Wszelkie prawa zastrzeżone ©&nbsp;2022-2023"
        />
        <meta
          name="keywords"
          content="Dabhar, dabhar.org, ZWBPS, ZWBP ŚW, BPSW, Badacze, Wolni badacze, badaczy, Zrzeszenie Wolnych Badaczy Pisma Świętego, Świecki Ruch Misyjny Epifania, Zrzeszenie, Kraków, Warszawa, Białogard, Biłgoraj, nastrazy.org, Na Straży, Wędrówka, Wędrowniczek, Zbawienie.pl, 52Prawdy, śpiewniki, śpiewnik, śpiewnik młodzieżowy, Brzask, brzasku, Śpiewnik Brzasku Tysiąclecia, Cegiełki, Uwielbiajmy Pana, Nowe Pieśni, Koziańskie, Kozy, Poznańskie, Poznań, Śpiewajmy Panu Pieśń Nową, tekst, teksty, słowa, wszystkie pieśni, piosenki, obóz, obozowe, piosenki obozowe, kursy biblijne, kursy, kolonie, kolonia religijna, konwencja, konwencje, Jakub Kłało, Krzysztof Olszewski"
        />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>
            Get started by editing&nbsp;
            <code className={styles.code}>pages/index.tsx</code>
          </p>
          <div>
            <a
              href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{" "}
              <Image
                src="/vercel.svg"
                alt="Vercel Logo"
                className={styles.vercelLogo}
                width={100}
                height={24}
                priority
              />
            </a>
          </div>
        </div>

        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            />
          </div>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Find in-depth information about Next.js features and&nbsp;API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Templates <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Discover and deploy boilerplate example Next.js&nbsp;projects.
            </p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>
              Instantly deploy your Next.js site to a shareable URL
              with&nbsp;Vercel.
            </p>
          </a>
        </div>
      </main>
    </>
  );
}
