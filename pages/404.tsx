import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/error.module.scss";

export default function ErrorPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
  const router = useRouter();

  const [seconds, setSeconds] = useState(10); // 10 seconds

  // auto-redirect counter
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

      <div className="container">
        <div className="mobileHeader home">
          <div className="center">
            <Image
              className="icon"
              alt="bpsw"
              src="/logo/bpsw.svg"
              width={50}
              height={50}
              priority={true}
              draggable={false}
            />

            <h1>Śpiewniki</h1>
          </div>
        </div>

        <main>
          <div className={styles.container}>
            <h1>Strona napotkała problem</h1>

            <p>
              <Link href="/">Kliknij tutaj</Link>, aby powrócić do{" "}
              {unlocked ? "strony głównej" : "śpiewników"}{" "}
              <span className={styles.counter}>[{seconds}]</span>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
