import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

import styles from "@styles/pages/hymn.module.scss";

import axios from "axios";

export default function HymnPage() {
  const router = useRouter();

  const [state, setState] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { query } = router;

    axios
      .get(`/api/xml?book=${query.book}&title=${query.title}/`)
      .then(({ data }) => {
        return setState(data);
      });
  }, [router]);
  if (!state) return;

  return (
    <>
      <Head>
        <title>{state.hymn.title} | Śpiewniki</title>
      </Head>

      <main>
        <h1>{state.hymn.title}</h1>
        <div>{state.hymn.lyrics}</div>
      </main>
    </>
  );
}
