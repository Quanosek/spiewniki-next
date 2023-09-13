import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/error.module.scss";
import { Header } from "@/components/elements";

export default function ErrorPage() {
  const unlocked = process.env.NEXT_PUBLIC_UNLOCKED == "true";
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

      <Header buttons={undefined} />

      <div className="container">
        <main>
          <div className="mobileHeader">
            <div className="logo">
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

          <div className={styles.container}>
            <h1>Strona napotkała problem</h1>

            <p>
              {unlocked ? (
                <>
                  Przejdź do <Link href="/">strony głównej</Link>.
                </>
              ) : (
                <>
                  <Link href="/">Kliknij tutaj</Link>, aby powrócić.
                </>
              )}{" "}
              <span className={styles.counter}>[{seconds}]</span>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
