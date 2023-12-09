import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/document.module.scss";

import SimpleText from "@/scripts/simpleText";

export default function DocumentPage() {
  const router = useRouter();

  const libraryPath = "/libraries/pdfjs-4.0.269-legacy-dist/web/viewer.html";
  const [documentPath, setDocumentPath] = useState<string>("");

  const [pageTitle, setPageTitle] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return;

    const { d, book, id } = router.query as {
      [key: string]: string; // all params are strings
    };

    if (d) {
      // book pdf file
      setPageTitle(d.toString() + " [PDF]");
      const file = new SimpleText(d).modify();
      setDocumentPath(`/pdf/${file}.pdf`);
    } else if (book && id) {
      // hymn pdf file
      setPageTitle("Dokument PDF");
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
        <title>{`${pageTitle || "Ładowanie..."} / Śpiewniki`}</title>
      </Head>

      <div className="container">
        <div className={styles.document}>
          <iframe
            id="pdf-js-viewer"
            src={`${libraryPath}?file=${documentPath}`}
            title="webviewer"
          />
        </div>
      </div>
    </>
  );
}
