import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/components/menu.module.scss";

import { openMenu } from "@/scripts/buttons";

import Favorites from "./menu/favorites";
import Settings from "./menu/settings";
import Shortcuts from "./menu/shortcuts";

export default function Menu() {
  const router = useRouter();
  const { menu, ...params } = router.query;

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    // prevent scrolling
    if (menu) {
      const TopScroll = document.documentElement.scrollTop;
      const LeftScroll = document.documentElement.scrollLeft;

      window.onscroll = () => window.scrollTo(LeftScroll, TopScroll);
      setShowMenu(true);
    } else {
      window.onscroll = () => {};
      setShowMenu(false);
    }

    // keyboard shortcuts
    const KeyupEvent = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
        return;
      }

      if (event.key === "Escape") {
        if (menu) openMenu(undefined);
      }
    };

    document.addEventListener("keyup", KeyupEvent);
    return () => document.removeEventListener("keyup", KeyupEvent);
  }, [router, menu, params]);

  return (
    <div
      className={styles.component}
      style={{
        visibility: showMenu ? "visible" : "hidden",
        opacity: showMenu ? 1 : 0,
        transition: " 0.1s ease-in-out",
      }}
    >
      <div className={styles.background} onClick={() => openMenu(undefined)} />

      {menu && (
        <div className={styles.menu}>
          <div className={styles.content}>
            {/* select menu window */}
            {menu === "favorites" && <Favorites />}
            {menu === "settings" && <Settings />}
            {menu === "shortcuts" && <Shortcuts />}
          </div>
        </div>
      )}
    </div>
  );
}
