import styles from "@/styles/components/presentation.module.scss";
import { useEffect } from "react";

export default function Presentation(params: { data: any }) {
  const hymn = params.data;

  useEffect(() => {
    // handle fullscreen navigation
    function handleEvent(e: any) {
      if (["ArrowLeft", "ArrowUp"].includes(e.key) || e.deltaY < 0) {
        // console.log("prev");
      }
      if (["ArrowRight", "ArrowDown"].includes(e.key) || e.deltaY > 0) {
        // console.log("next");
      }
    }

    // shortcuts events handlers
    const eventTypes: Array<string> = ["wheel", "keydown"];
    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, handleEvent);
    });
    return () => {
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, handleEvent);
      });
    };
  }, [hymn]);

  return (
    <div className={styles.presentation}>
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
