import { useRouter } from "next/router";
import React, { useEffect } from "react";

import styles from "@/styles/components/menu.module.scss";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

export default function Menu() {
  const router = useRouter();
  const menu = router.query.menu as string;

  useEffect(() => {
    if (!router.isReady) return;

    const menu = document.getElementById("menu") as HTMLElement;

    if (router.query.menu) {
      const TopScroll =
        window.pageYOffset || document.documentElement.scrollTop;
      const LeftScroll =
        window.pageXOffset || document.documentElement.scrollLeft;

      window.onscroll = () => window.scrollTo(LeftScroll, TopScroll);
      menu.style.visibility = "visible";
      menu.style.opacity = "1";
    } else {
      window.onscroll = () => {};
      menu.style.visibility = "";
      menu.style.opacity = "";
    }
  }, [router]);

  return (
    <div id="menu" className={styles.holder}>
      <div
        className={styles.background}
        onClick={() => {
          const { menu, ...params } = router.query;
          return router.replace(
            {
              query: { ...params },
            },
            undefined,
            { shallow: true, scroll: false }
          );
        }}
      ></div>

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
