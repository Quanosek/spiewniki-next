import Image from "next/image";
import { useCallback, useState, useEffect, useRef } from "react";

import styles from "@/styles/components/presentation.module.scss";

export default function Presentation(params: { data: any }) {
  const hymn = params.data; // all data from "/hymn" page

  const count = useRef(-1);
  const [slide, setSlide] = useState<any>();

  // define order and type of presentation
  let order: string[] | number[];
  let presentation: boolean;

  if (hymn.song.presentation) {
    presentation = true;
    order = hymn.song.presentation
      .split(" ")
      .filter((item: string) => item !== "");
  } else {
    presentation = false;
    order = hymn.lyrics.map((verse: string, index: number) => index);
  }

  // format lyrics to display
  const lyricsFormat = useCallback(
    (data: any) => {
      let content;

      if (presentation) {
        content = data.song.lyrics[order[count.current]];
      } else {
        content = data.lyrics[order[count.current]];
      }

      if (content) {
        content = content
          .filter((line: string) => line.startsWith(" "))
          .map((line: string) => line.slice(1));
      }

      return content;
    },
    [presentation, order]
  );

  // slideshow navigation
  const prevSlide = useCallback(() => {
    if (count.current >= 0) {
      count.current--;
      setSlide(lyricsFormat(hymn));
    }
  }, [lyricsFormat, hymn]);

  const nextSlide = useCallback(() => {
    if (count.current <= order.length) {
      count.current++;
      setSlide(lyricsFormat(hymn));
    }
    if (count.current > order.length) {
      document.exitFullscreen();
    }
  }, [order, lyricsFormat, hymn]);

  // mouse behavior parameters
  const [alwaysShowCursor, setAlwaysShowCursor] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  const cursorHideTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // hide mouse cursor on idle
    const mouseMoveEvent = (e: MouseEvent) => {
      if ((e.movementX && e.movementY) == 0) return;

      setShowCursor(true);
      clearTimeout(cursorHideTimeout.current);

      if (!alwaysShowCursor) {
        cursorHideTimeout.current = setTimeout(
          () => setShowCursor(false),
          1500
        );
      }
    };

    // handle fullscreen navigation
    let startPosition: number, endPosition: number;
    const handleEvent = (e: Event) => {
      // custom event types
      const TouchEvent = e as TouchEvent;
      const KeyboardEvent = e as KeyboardEvent;
      const WheelEvent = e as WheelEvent;

      // touch screen navigation
      if (e.type == "touchstart") {
        startPosition = TouchEvent.touches[0].clientX;
      }
      if (e.type == "touchend") {
        endPosition = TouchEvent.changedTouches[0].clientX - startPosition;
      }

      if (
        KeyboardEvent.ctrlKey ||
        KeyboardEvent.shiftKey ||
        KeyboardEvent.altKey ||
        KeyboardEvent.metaKey
      ) {
        return;
      }

      // navigation handlers
      if (
        ["ArrowLeft", "ArrowUp"].includes(KeyboardEvent.key) ||
        WheelEvent.deltaY < -100 ||
        endPosition < 0
      ) {
        prevSlide();
      }
      if (
        ["ArrowRight", "ArrowDown"].includes(KeyboardEvent.key) ||
        WheelEvent.deltaY > 100 ||
        endPosition >= 0
      ) {
        nextSlide();
      }
    };

    // events handlers
    const eventTypes: Array<string> = [
      "keyup",
      "wheel",
      "touchstart",
      "touchend",
    ];

    document.addEventListener("mousemove", mouseMoveEvent);
    eventTypes.forEach((eventType) => {
      document.addEventListener(eventType, handleEvent);
    });

    return () => {
      document.removeEventListener("mousemove", mouseMoveEvent);
      eventTypes.forEach((eventType) => {
        document.removeEventListener(eventType, handleEvent);
      });
    };
  }, [alwaysShowCursor, prevSlide, nextSlide]);

  return (
    <div
      className={styles.component}
      style={{ cursor: showCursor ? "default" : "none" }}
    >
      <div
        // dynamic classes
        className={`${styles.presentation}
          ${count.current < 0 ? styles.first : ""}
          ${count.current >= order.length ? styles.last : ""}`}
      >
        {/* title section */}
        <div className={styles.title}>
          <h1>{hymn.name}</h1>
          <h2>{hymn.book}</h2>
        </div>

        {/* lyrics section */}
        <div className={styles.verse}>
          {slide &&
            slide.map((line: string, index: number) => {
              return <p key={index}>{line}</p>;
            })}
        </div>

        {/* progress bar section */}
        <div className={styles.progress}>
          <div
            className={styles.fulfill}
            style={{
              width: `${(100 / order.length) * (count.current + 1)}%`,
            }}
          />
        </div>

        <div
          id="navigation"
          className={`${styles.navigation} ${showCursor ? styles.show : ""}`}
          onMouseEnter={() => setAlwaysShowCursor(true)}
          onMouseLeave={() => setAlwaysShowCursor(false)}
        >
          <button
            title="Poprzedni slajd. Użyj [←], [↑] lub kółka myszy w górę."
            onClick={prevSlide}
          >
            <Image
              className="icon"
              alt="arrow left"
              src="/icons/arrow.svg"
              width={20}
              height={20}
              draggable={false}
            />
          </button>

          <button
            title="Następny slajd. Użyj [→], [↓] lub kółka myszy w dół."
            onClick={nextSlide}
          >
            <Image
              className="icon"
              alt="arrow next"
              src="/icons/arrow.svg"
              width={20}
              height={20}
              draggable={false}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
