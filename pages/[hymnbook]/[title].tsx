import Head from "next/head";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
  const contacts = await prisma.contact.findMany();

  const { hymnbook, title } = context.params;

  return {
    props: {
      initialContacts: contacts,
      hymnbook,
      title,
    },
  };
}
