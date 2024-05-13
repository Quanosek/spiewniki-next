import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/document.module.scss";

import SimpleText from "@/scripts/simpleText";

interface RouterQuery {
  [key: string]: string;
}

export default function DocumentPage() {
  const router = useRouter();

  const libraryPath = "/libraries/pdfjs-4.2.67-dist/web/viewer.html";
  const [documentPath, setDocumentPath] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const { d, book, id } = router.query as RouterQuery;

    // get document
    if (d) {
      setDocumentPath(`/pdf/${new SimpleText(d).modify()}.pdf`);
    } else if (book && id) {
      setDocumentPath(`/pdf/${book}/${id}.pdf`);
    } else {
      router.back();
    }
  }, [router]);

  // keyboard shortcuts
  useEffect(() => {
    const KeyupEvent = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        router.query.menu
      ) {
        return;
      }

      if (event.key === "Escape") router.back();
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [router]);

  return (
    <>
      <Head>
        <title>Dokument PDF / Śpiewniki</title>
      </Head>

      <div className="container">
        <div className={styles.document}>
          <iframe src={`${libraryPath}?file=${documentPath}`} />
        </div>
      </div>
    </>
  );
}
