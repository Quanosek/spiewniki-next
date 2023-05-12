import styles from "@/styles/components/presentation.module.scss";

export default function Presentation(param: { hymn: any }) {
  const hymn = param.hymn;
  if (!hymn) return null;

  return (
    <div id="presentation" className={styles.presentation}>
      <div className={styles.title}>
        <h1>{hymn.title}</h1>
        <h2>{hymn.book}</h2>
      </div>

      <div className={styles.verse}>
        {hymn.lyrics[0].map((verse: string, index: number) => {
          return !verse.startsWith(".") && <p key={index}>{verse}</p>;
        })}
      </div>

      <div className={styles.progressBar}>
        <div className={styles.fulfill} />
      </div>
    </div>
  );
}
