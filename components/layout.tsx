import { ReactNode } from "react";

import { GoogleAnalytics } from "nextjs-google-analytics";

import { Header, Footer } from "@/components/assets";
import Menu from "@/components/menu";

export default function Layout({ children }: { children: ReactNode }) {
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
        <Header />
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
