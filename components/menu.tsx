import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/components/menu.module.scss";

import { menuLink } from "@/scripts/buttons";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

export default function Menu() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { menu, ...params } = router.query;

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
    };

    // keyboard events
    document.addEventListener("keyup", handleKeyPress);
    return () => document.removeEventListener("keyup", handleKeyPress);
  }, [router]);

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
          {router.query.menu === "favorite" && <Favorite />}
          {router.query.menu === "info" && <Info />}
          {router.query.menu === "settings" && <Settings />}
        </div>
      </div>
    </div>
  );
}
