import { useRouter } from "next/router";

import styles from "@/styles/pages/document.module.scss";

import { Header } from "@/components/elements";

import textFormat from "@/scripts/textFormat";

export default function DocumentPage() {
  const router = useRouter();
  let document = router.query.d as string;
  if (!document) return null;

  document = textFormat(document).replaceAll(" ", "_");

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
          <iframe className={styles.document} src={`/pdf/${document}.pdf`} />
        </div>
      </div>
    </>
  );
}
