import Head from "next/head";

import styles from "@/styles/pages/error.module.scss";

import MobileHeader from "@/components/mobileHeader";

export default function ErrorPage() {
  return (
    <>
      <Head>
        <title>Brak dostępu do internetu / Śpiewniki</title>
      </Head>

      <main>
        <MobileHeader />

        <div className={styles.container}>
          <h1>Brak dostępu do internetu</h1>
          <p>
            Sprawdź swoje połączenie z internetem i spróbuj odświeżyć stronę.
          </p>
        </div>
      </main>
    </>
  );
}
