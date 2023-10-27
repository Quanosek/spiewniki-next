import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/pages/document.module.scss";

import { Header } from "@/components/elements";

import textFormat from "@/scripts/textFormat";

export default function DocumentPage() {
  const router = useRouter();

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

  return (
    <>
      <Header
        buttons={{
          leftSide: {
            title: "Powrót",
            icon: "arrow",
            onclick: () => router.back(),
          },
        }}
      />

      <div className="container">
        <div className={styles.document}>
          {documentPath && (
            <iframe className={styles.document} src={documentPath} />
          )}
        </div>
      </div>
    </>
  );
}
