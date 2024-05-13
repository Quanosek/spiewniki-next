import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { GoogleAnalytics } from "nextjs-google-analytics";

import Menu from "@/components/menu";
import { hiddenMenuQuery } from "./menu";

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

export function Footer({ children }: any) {
  return (
    <div className="container">
      <div>
        <p>
          Stworzone z {unlocked ? "💙" : "❤️"} przez{" "}
          <Link href="https://github.com/Quanosek/">Jakuba Kłało</Link>
          {" i "}
          <Link href="https://github.com/Krist0f0l0s/">
            Krzysztofa Olszewskiego
          </Link>
        </p>

        <p>
          Wszelkie prawa zastrzeżone &#169; 2022-{new Date().getFullYear()}
          {unlocked ? (
            <>
              {" │ "}
              domena&nbsp;<Link href="https://www.klalo.pl/">klalo.pl</Link>
            </>
          ) : (
            ""
          )}
        </p>
      </div>

      {children}
    </div>
  );
}

export default function LayoutComponent({ children }: { children: ReactNode }) {
  return (
    <>
      {process.env.NODE_ENV !== "development" && (
        <GoogleAnalytics
          trackPageViews
          gaMeasurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string}
        />
      )}

      <Menu />

      <header>
        <div className="container">
          <Link
            href="/"
            title={
              unlocked
                ? "Zebrane w jednym miejscu śpiewniki i pieśni religijne."
                : ""
            }
            className="title"
          >
            <Image
              className="icon"
              alt="logotype"
              src="/logo/bpsw.svg"
              width={45}
              height={45}
              priority={true}
              draggable={false}
            />

            <h2>Śpiewniki</h2>
          </Link>

          <div className="buttons">
            <button onClick={() => hiddenMenuQuery("favorites")}>
              <p>Lista ulubionych</p>
            </button>

            <button onClick={() => hiddenMenuQuery("settings")}>
              <p>Ustawienia</p>
            </button>

            <button
              className="desktopOnly"
              onClick={() => hiddenMenuQuery("shortcuts")}
            >
              <p>Skróty klawiszowe</p>
            </button>

            {!unlocked && (
              <Link href="https://nastrazy.org/">
                <p>Nastrazy.org</p>
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer>
        <Footer>
          <p className="bibleVerse">
            {`„Śpiewajcie Mu i grajcie, opowiadajcie o wszystkich cudach Jego!”`}
            <br />1 Kronik 16:9
          </p>
        </Footer>
      </footer>
    </>
  );
}
