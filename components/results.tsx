import Link from "next/link";

import styles from "@styles/components/results.module.scss";

export default function Results(param: { results: any }) {
  const results = param.results;

  return (
    <div className={styles.results}>
      {(!results[0] && (
        <p className={styles.noResults}>Brak wyników wyszukiwania</p>
      )) ||
        results.map(
          (
            hymn: { book: string; title: string; lyrics: string[] },
            index: number
          ) => {
            return (
              <div key={index}>
                <Link
                  href={`/hymn?book=${hymn.book}&title=${hymn.title}`}
                  key={index}
                >
                  <>
                    <h2>{hymn.title}</h2>
                    {hymn.lyrics && <p>{hymn.lyrics}</p>}
                  </>
                </Link>
                <hr />
              </div>
            );
          }
        )}
    </div>
  );
}
