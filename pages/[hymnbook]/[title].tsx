import Head from "next/head";

import styles from "@styles/pages/hymn.module.scss";

export default function HymnPage({ hymnbook, title }: any) {
  return (
    <>
      <Head>
        <title>{title} | Śpiewniki</title>
      </Head>
      <main>
        <h1>
          {hymnbook} - {title}
        </h1>
      </main>
    </>
  );
}

export async function getServerSideProps(context: {
  params: { hymnbook: any; title: any };
}) {
  const { hymnbook, title } = context.params;

  return {
    props: {
      hymnbook,
      title,
    },
  };
}
