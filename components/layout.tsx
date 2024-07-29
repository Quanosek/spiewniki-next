import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { hiddenMenuQuery } from "./menu";
import Menu from "@/components/menu";

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";

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
              alt="bpsw"
              src="/logo/bpsw.svg"
              width={45}
              height={45}
              draggable={false}
              priority
            />
            <h1>Śpiewniki</h1>
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
        <div className="container">
          <p>
            „Śpiewajcie Mu i grajcie, opowiadajcie o wszystkich cudach Jego!” 1
            Krn 16:9
          </p>

          <hr />

          <p className="credits">
            Wszelkie prawa zastrzeżone &#169; 2022-{new Date().getFullYear()}
            {unlocked && (
              <>
                {" │ domena "}
                <Link href="https://www.klalo.pl/">klalo.pl</Link>
              </>
            )}
          </p>
        </div>
      </footer>
    </>
  );
}
