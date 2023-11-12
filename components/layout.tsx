import { ReactNode } from "react";

import { Header, Footer } from "@/components/assets";
import Menu from "@/components/menu";

import { GoogleAnalytics } from "nextjs-google-analytics";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {process.env.NODE_ENV !== "development" && (
        <GoogleAnalytics trackPageViews />
      )}

      <Menu />

      <header>
        <Header />
      </header>

      {children}

      <footer>
        <Footer />
      </footer>
    </>
  );
}
