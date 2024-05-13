import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/error.module.scss";

import { shareButton } from "@/scripts/buttons";

export default function ErrorPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
  const router = useRouter();

  const [seconds, setSeconds] = useState(10); // 10 seconds

  // auto-redirect counter
  useEffect(() => {
    const counter = setInterval(() => {
      setSeconds((prevSeconds: number) => prevSeconds - 1);
      if (seconds <= 1) router.push("/");
    }, 1000);

    return () => clearInterval(counter);
  }, [router, seconds]);

  // prevent scrolling on active hamburger menu
  const [hamburgerMenu, showHamburgerMenu] = useState(false);

  useEffect(() => {
    const TopScroll = document.documentElement.scrollTop;
    const LeftScroll = document.documentElement.scrollLeft;

    const ScrollEvent = () => {
      if (!hamburgerMenu) return;
      window.scrollTo(LeftScroll, TopScroll);
    };

    document.addEventListener("scroll", ScrollEvent);
    return () => document.removeEventListener("scroll", ScrollEvent);
  }, [hamburgerMenu]);

  return (
    <>
      <Head>
        <title>Nie znaleziono strony / Śpiewniki</title>
      </Head>

      <div className="container">
        <div
          className={`
          ${unlocked ? styles.title : "mobileHeader"}
          ${styles.mobileHeader}
          ${hamburgerMenu && styles.active}
          `}
        >
          <Link className={styles.logotype} href="/">
            <Image
              className="icon"
              alt="bpsw"
              src="/logo/bpsw.svg"
              width={45}
              height={45}
              priority={true}
              draggable={false}
            />
            <p>Śpiewniki</p>
          </Link>

          {!unlocked && (
            // Hamburger Menu
            // https://wykladybiblijne.org/

            <button
              className="icon"
              onClick={() => showHamburgerMenu(!hamburgerMenu)}
            >
              <svg
                className={`${hamburgerMenu && styles.active}`}
                viewBox="0 0 64 48"
              >
                <path d="M19,15 L45,15 C70,15 58,-2 49.0177126,7 L19,37"></path>
                <path d="M19,24 L45,24 C61.2371586,24 57,49 41,33 L32,24"></path>
                <path d="M45,33 L19,33 C-8,33 6,-2 22,14 L45,37"></path>
              </svg>
            </button>
          )}
        </div>

        {hamburgerMenu && (
          <div className={styles.hamburgerMenu}>
            <Link href="https://nastrazy.org/">Nastrazy.org</Link>
            <button onClick={shareButton}>Udostępnij</button>
          </div>
        )}

        <main>
          <div className={styles.content}>
            <h1>Strona napotkała problem</h1>

            <p>
              <Link href="/">Kliknij tutaj</Link>, aby powrócić do{" "}
              {unlocked ? "strony głównej" : "śpiewników"}{" "}
              <span>[{seconds}]</span>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
