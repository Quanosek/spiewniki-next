import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/error.module.scss";

import MobileHeader from "@/components/mobileHeader";

export default function ErrorPage() {
  const router = useRouter();

  const [seconds, setSeconds] = useState(10); // 10 seconds

  useEffect(() => {
    const counter = setInterval(() => {
      setSeconds((prevSeconds: number) => prevSeconds - 1);
      if (seconds === 1) router.push("/");
    }, 1000);

    return () => clearInterval(counter);
  }, [router, seconds]);

  return (
    <>
      <Head>
        <title>Nie znaleziono strony / Śpiewniki</title>
      </Head>

      <main>
        <MobileHeader />

        <div className={styles.container}>
          <h1>Strona napotkała problem</h1>
          <p>
            Przejdź do <Link href={"/"}>strony głównej</Link>.{" "}
            <span className={styles.counter}>[{seconds}]</span>
          </p>
        </div>
      </main>
    </>
  );
}
