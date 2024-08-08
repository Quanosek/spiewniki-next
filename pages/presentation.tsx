import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Presentation from "@/components/presentation";
import { bookShortcut } from "@/lib/availableBooks";
import HymnTypes from "@/lib/hymnTypes";

import styles from "@/styles/components/presentation.module.scss";

export default function PresentationPage() {
  const router = useRouter();

  const [hymn, setHymn] = useState<HymnTypes | undefined>();

  useEffect(() => {
    if (!router.isReady) return;
    const { book, title } = router.query as { [key: string]: string };

    // fetch data
    axios
      .get(`database/${bookShortcut(book)}.json`)
      .then(({ data }) => {
        const hymn = data.find((elem: { name: string }) => elem.name === title);
        setHymn(hymn);
      })
      .catch((err) => console.error(err));

    // exit on fullscreen escape
    document.onfullscreenchange = () => {
      if (!document.fullscreenElement) return router.back();
    };

    // remove saved window mode
    window.onbeforeunload = () => {
      return localStorage.removeItem("presWindow");
    };
  }, [router]);

  // keyboard shortcuts
  useEffect(() => {
    const KeyupEvent = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;

      if (e.key === "Escape") router.back();
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [router]);

  return (
    <>
      <Head>
        <title>Pokaz slajdów / Śpiewniki</title>
      </Head>

      <div className={styles.fullscreen}>
        {hymn && <Presentation hymn={hymn} />}
      </div>
    </>
  );
}
