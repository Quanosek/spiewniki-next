import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/components/menu.module.scss";

import { replaceLink } from "@/scripts/buttons";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

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

    // handle keyboard shortcuts
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toUpperCase()) {
        case "F":
          if (!menu) replaceLink("favorite");
          break;
        case "S":
          if (!menu) replaceLink("settings");
          break;
        case "ESCAPE":
          if (menu) replaceLink(undefined);
          break;
      }
    };

    // keyboard events
    document.addEventListener("keyup", handleKeyPress);
    return () => document.removeEventListener("keyup", handleKeyPress);
  }, [router, menu, params]);

  return (
    <div
      className={styles.component}
      style={{ display: showMenu ? "flex" : "none" }}
    >
      <div
        className={styles.background}
        onClick={() => replaceLink(undefined)}
      />

      <div className={styles.menu}>
        <div className={styles.content}>
          {/* select menu window */}
          {menu === "favorite" && <Favorite />}
          {menu === "info" && <Info />}
          {menu === "settings" && <Settings />}
        </div>
      </div>
    </div>
  );
}
