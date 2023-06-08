import styles from "@/styles/components/presentation.module.scss";
import { useCallback, useEffect, useState } from "react";

export default function Presentation(params: { data: any }) {
  const hymn = params.data;

  // define presentation slides order
  const presentationOrder = useCallback(() => {
    const presentation = hymn.presentation[0];
    const seenParams: { [param: string]: number } = {};
    const uniqueNumbers: number[] = [];

    if (presentation) {
      // respecting the presentation default order
      presentation.split(" ").forEach((param: string) => {
        if (!(param in seenParams)) {
          const uniqueNumber = Object.keys(seenParams).length;
          seenParams[param] = uniqueNumber;
          uniqueNumbers.push(uniqueNumber);
        } else uniqueNumbers.push(seenParams[param]);
      });
    } else {
      // all slides in sequence
      for (let i = 0; i < hymn.lyrics.length; i++) uniqueNumbers.push(i);
    }

    return uniqueNumbers;
  }, [hymn]);

  const [slide, setSlide] = useState({
    current: -1,
    order: presentationOrder(),
  });

  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    // handle fullscreen navigation
    let startPosition: number, endPosition: number;

    function handleEvent(e: Event) {
      const KeyboardEvent = e as KeyboardEvent;
      const WheelEvent = e as WheelEvent;
      const TouchEvent = e as TouchEvent;

      if (e.type == "touchstart") {
        startPosition = TouchEvent.touches[0].clientX;
      }
      if (e.type == "touchend") {
        endPosition = TouchEvent.changedTouches[0].clientX - startPosition;
      }

      if (
        ["ArrowLeft", "ArrowUp"].includes(KeyboardEvent.key) ||
        WheelEvent.deltaY < -100 ||
        endPosition < 0
      ) {
        if (slide.current >= 0) {
          setSlide({ ...slide, current: slide.current - 1 });
        }
      }
      if (
        ["ArrowRight", "ArrowDown"].includes(KeyboardEvent.key) ||
        WheelEvent.deltaY > 100 ||
        endPosition >= 0
      ) {
        if (slide.current <= slide.order.length) {
          setSlide({ ...slide, current: slide.current + 1 });
        }
        if (slide.current == slide.order.length) {
          document.exitFullscreen();
        }
      }
    }

    // hide mouse cursor on idle
    let idleTimer: NodeJS.Timeout;
    const mouseMoveEvent = () => {
      clearTimeout(idleTimer);
      setShowCursor(true);

      idleTimer = setTimeout(() => setShowCursor(false), 2000);
    };

    // events handlers
    const eventTypes: Array<string> = [
      "keyup",
      "wheel",
      "touchstart",
      "touchend",
    ];

    eventTypes.forEach((eventType) => {
      document.addEventListener(eventType, handleEvent);
    });
    document.addEventListener("mousemove", mouseMoveEvent);

    return () => {
      eventTypes.forEach((eventType) => {
        document.removeEventListener(eventType, handleEvent);
      });
      document.removeEventListener("mousemove", mouseMoveEvent);
    };
  }, [hymn, slide]);

  return (
    <div
      id="presentation"
      className={styles.component}
      style={{ cursor: showCursor ? "default" : "none" }}
    >
      <div
        className={`${styles.presentation} ${
          slide.current < 0 ? styles.first : ""
        }`}
      >
        {/* title section */}
        <div
          className={styles.title}
          style={{
            display: slide.current >= slide.order.length ? "none" : "flex",
          }}
        >
          <h1>{hymn.title}</h1>
          <h2>{hymn.book}</h2>
        </div>

        {/* lyrics section */}
        <div className={styles.verse}>
          {slide.current >= 0 &&
            slide.current < slide.order.length &&
            hymn.lyrics[slide.order[slide.current]].map(
              (verse: string, index: number) => {
                return !verse.startsWith(".") && <p key={index}>{verse}</p>;
              }
            )}
        </div>

        {/* progress bar section */}
        <div
          className={styles.progressBar}
          style={{
            display: slide.current >= slide.order.length ? "none" : "flex",
          }}
        >
          <div
            className={styles.fulfill}
            style={{
              width: `${(100 / slide.order.length) * (slide.current + 1)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
