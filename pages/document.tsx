import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/document.module.scss";

import textFormat from "@/scripts/textFormat";

export default function DocumentPage() {
  const router = useRouter();

  const libraryPath = "/libraries/pdfjs-3.11.174-legacy-dist/web/viewer.html";
  const [documentPath, setDocumentPath] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;
    const { d, book, id } = router.query;

    if (d) {
      // all hymns in book pdf
      let document = router.query.d as string;
      document = textFormat(document).replaceAll(" ", "_");
      setDocumentPath(`/pdf/${document}.pdf`);
    } else if (book && id) {
      // specific hymn pdf
      setDocumentPath(`/pdf/${book}/${id}.pdf`);
    } else {
      // back to previous page on invalid query
      router.back();
    }
  }, [router]);

  // keyboard shortcuts
  useEffect(() => {
    const KeyupEvent = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
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
        <title>Podgląd PDF / Śpiewniki</title>
      </Head>

      <div className="container">
        <div className={styles.document}>
          {documentPath && (
            <iframe
              id="pdf-js-viewer"
              src={`${libraryPath}?file=${documentPath}`}
              title="webviewer"
            />
          )}
        </div>
      </div>
    </>
  );
}
