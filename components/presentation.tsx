import Image from "next/image";
import { useCallback, useState, useEffect } from "react";

import styles from "@/styles/components/presentation.module.scss";

export default function Presentation(params: { data: any }) {
  const hymn = params.data; // hymn API data

  // presentation slides order
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

  // slide numbers parameters
  const [slide, setSlide] = useState({
    current: -1,
    order: presentationOrder(),
  });

  // navigation main functions
  const prevSlide = useCallback(() => {
    if (slide.current >= 0) {
      setSlide({ ...slide, current: slide.current - 1 }); // change param
    }
  }, [slide]);

  const nextSlide = useCallback(() => {
    if (slide.current <= slide.order.length) {
      setSlide({ ...slide, current: slide.current + 1 }); // change param
    }
    if (slide.current == slide.order.length) {
      document.exitFullscreen(); // exit fullscreen/end presentation/hide component
    }
  }, [slide]);

  // mouse behavior parameters
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    // hide mouse cursor on idle
    let idleTimer: NodeJS.Timeout;
    const mouseMoveEvent = (e: MouseEvent) => {
      if ((e.movementX && e.movementY) == 0) return;

      clearTimeout(idleTimer);
      setShowCursor(true);

      const navigation = document.getElementById(
        "navigation"
      ) as HTMLDivElement;

      if (!navigation.contains(e.target as Node)) {
        idleTimer = setTimeout(() => setShowCursor(false), 1500);
      }
    };

    // handle fullscreen navigation
    let startPosition: number, endPosition: number;
    function handleEvent(e: Event) {
      // custom event types
      const KeyboardEvent = e as KeyboardEvent;
      const WheelEvent = e as WheelEvent;
      const TouchEvent = e as TouchEvent;

      // touch screen navigation
      if (e.type == "touchstart") {
        startPosition = TouchEvent.touches[0].clientX;
      }
      if (e.type == "touchend") {
        endPosition = TouchEvent.changedTouches[0].clientX - startPosition;
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
    }

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
  }, [prevSlide, nextSlide]);

  return (
    <div
      id="presentation"
      className={styles.component}
      style={{ cursor: showCursor ? "default" : "none" }}
    >
      <div
        // dynamic class names
        className={`${styles.presentation}
          ${slide.current < 0 ? styles.first : ""}
          ${slide.current >= slide.order.length ? styles.last : ""}`}
      >
        {/* title section */}
        <div className={styles.title}>
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
        <div className={styles.progress}>
          <div
            className={styles.fulfill}
            style={{
              width: `${(100 / slide.order.length) * (slide.current + 1)}%`,
            }}
          />
        </div>

        <div
          id="navigation"
          className={`${styles.navigation} ${showCursor ? styles.show : ""}`}
        >
          <button
            title="Poprzedni slajd. Użyj [←], [↑] lub kółka myszy."
            onClick={prevSlide}
          >
            <Image
              className="icon"
              alt="poprzedni"
              src="/icons/arrow.svg"
              width={30}
              height={30}
            />
          </button>

          <button
            title="Następny slajd. Użyj [→], [↓] lub kółka myszy."
            onClick={nextSlide}
          >
            <Image
              className="icon"
              alt="następny"
              src="/icons/arrow.svg"
              width={30}
              height={30}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
