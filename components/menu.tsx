import { useRouter } from "next/router";
import { useState, useCallback, useEffect } from "react";

import styles from "@/styles/components/menu.module.scss";

import { menuLink, randomButton } from "@/scripts/buttons";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

export default function Menu() {
  const router = useRouter();
  const { menu, ...params } = router.query;

  const [showMenu, setShowMenu] = useState(false);

  const handleKeyPress = useCallback(
    (e: { key: string }) => {
      const key = e.key.toUpperCase();

      // shortcuts
      switch (key) {
        case "R":
          !menu && randomButton();
          break;
        case "F":
          !menu && menuLink("favorite");
          break;
        case "S":
          !menu && menuLink("settings");
          break;
        case "ESCAPE":
          menu &&
            router.replace({
              query: { ...params },
            });
          break;
      }
    },
    [router, menu, params]
  );

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

    // keyboard shortcuts handler
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [router, menu, handleKeyPress]);

  return (
    <div
      id="menu"
      className={styles.holder}
      style={{ display: showMenu ? "flex" : "none" }}
    >
      <div className={styles.background} onClick={() => router.back()}></div>

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
