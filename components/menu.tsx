import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import styles from "@/styles/components/menu.module.scss";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

export default function Menu() {
  const router = useRouter();
  const { menu } = router.query as { menu: string };

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    if (menu) {
      const TopScroll =
        window.pageYOffset || document.documentElement.scrollTop;
      const LeftScroll =
        window.pageXOffset || document.documentElement.scrollLeft;

      window.onscroll = () => window.scrollTo(LeftScroll, TopScroll);
      setShowMenu(true);
    } else {
      window.onscroll = () => {};
      setShowMenu(false);
    }
  }, [router, menu]);

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
