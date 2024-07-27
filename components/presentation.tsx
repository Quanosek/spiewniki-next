import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef } from "react";
import HymnTypes from "@/lib/hymnTypes";

import styles from "@/styles/components/presentation.module.scss";

export default function PresentationComponent(params: { data: HymnTypes }) {
  const hymn = params.data;
  const router = useRouter();

  let order: any;
  if (hymn.song.presentation) {
    // presentation order
    order = hymn.song.presentation
      .split(" ")
      .filter((item: string) => item !== "");
  } else {
    // counter order
    order = Object.keys(hymn.song.lyrics);
  }

  const slide = useRef(-1);

  // format lyrics to display
  const lyricsFormat = useCallback(
    (data: HymnTypes) => {
      if (!order) return;

      const content = data.song.lyrics[order[slide.current]];
      if (!content) return;

      return content
        .filter((line: string) => line.startsWith(" ")) // show only text lines
        .map((line: string) => line.slice(1)) // remove first space
        .map((line: string) => line.replace(/\(.*?\)/g, "")) // remove text in brackets
        .filter((line: string) => line !== "" && line !== " "); // remove empty lines
    },
    [order]
  );

  // slideshow navigation
  const [verse, setVerse] = useState<string[]>();

  const prevSlide = useCallback(() => {
    if (!hymn) return;

    if (slide.current >= 0) {
      slide.current--;
      setVerse(lyricsFormat(hymn));
    }
  }, [hymn, lyricsFormat]);

  const nextSlide = useCallback(() => {
    if (!(hymn && order)) return;

    if (slide.current <= order.length) {
      slide.current++;
      setVerse(lyricsFormat(hymn));
    }

    if (slide.current > order.length) {
      if (document.fullscreenElement) document.exitFullscreen();
      else slide.current--;
    }
  }, [hymn, lyricsFormat, order]);

  // mouse behavior params
  const [showCursor, setShowCursor] = useState(false);
  const [alwaysShowCursor, setAlwaysShowCursor] = useState(false);
  const cursorHideTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // hide mouse cursor on idle
    const mouseMoveEvent = (event: MouseEvent) => {
      if ((event.movementX && event.movementY) === 0) return;

      setShowCursor(true);
      clearTimeout(cursorHideTimeout.current);

      if (!alwaysShowCursor) {
        cursorHideTimeout.current = setTimeout(() => {
          return setShowCursor(false);
        }, 1500);
      }
    };

    // handle fullscreen navigation controls
    let startPosition: number;
    let endPosition: number;

    const handleEvent = (event: Event) => {
      const TouchEvent = event as TouchEvent;
      const KeyboardEvent = event as KeyboardEvent;

      // touch controls
      if (event.type === "touchstart") {
        startPosition = TouchEvent.touches[0].clientX;
      }
      if (event.type === "touchend") {
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
        endPosition < 0
      ) {
        prevSlide();
      }
      if (
        [" ", "ArrowRight", "ArrowDown"].includes(KeyboardEvent.key) ||
        endPosition >= 0
      ) {
        nextSlide();
      }
    };

    // events handlers
    const eventTypes: Array<string> = ["keyup", "touchstart", "touchend"];

    document.addEventListener("mousemove", mouseMoveEvent);
    eventTypes.forEach((eventType) => {
      return document.addEventListener(eventType, handleEvent);
    });

    return () => {
      document.removeEventListener("mousemove", mouseMoveEvent);
      eventTypes.forEach((eventType) => {
        return document.removeEventListener(eventType, handleEvent);
      });
    };
  }, [alwaysShowCursor, prevSlide, nextSlide, router]);

  return (
    <div
      className={styles.component}
      style={{ cursor: showCursor ? "default" : "none" }}
    >
      <div
        className={`
            ${styles.content}
            ${slide.current < 0 && styles.first}
            ${slide.current >= order.length && styles.last}
          `}
      >
        {/* title name */}
        <div className={styles.title}>
          <h1>{hymn.name}</h1>
          <h2>{hymn.book}</h2>
        </div>

        {/* lyrics */}
        <div className={styles.verse}>
          {verse &&
            verse.map((line, i) => {
              const formattedLine = line
                .replace(/\b(\w)\b\s/g, "$1\u00A0") // spaces after single letter words
                .replace(/(?<=\[:) | (?=:\])/g, "\u00A0"); // spaces between brackets

              return <p key={i}>{formattedLine}</p>;
            })}
        </div>

        {/* action buttons */}
        <div
          className={`${styles.navigation} ${showCursor && styles.show}`}
          onMouseEnter={() => setAlwaysShowCursor(true)}
          onMouseLeave={() => setAlwaysShowCursor(false)}
        >
          <button
            title="Poprzedni slajd. Użyj klawiszy [←] [↑] lub kółka myszy w górę."
            onClick={prevSlide}
          >
            <Image
              className={`${styles.prev} icon`}
              alt="previous"
              src="/icons/arrow.svg"
              width={50}
              height={50}
              draggable={false}
            />
          </button>

          <button
            title="Następny slajd. Użyj spacji, klawiszy [→] [↓] lub kółka myszy w dół."
            onClick={nextSlide}
          >
            <Image
              className={`${styles.next} icon`}
              alt="next"
              src="/icons/arrow.svg"
              width={50}
              height={50}
              draggable={false}
            />
          </button>
        </div>

        {/* progress bar */}
        <div className={styles.progressBar}>
          <div
            style={{
              width: `${(100 / order.length) * (slide.current + 1)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
