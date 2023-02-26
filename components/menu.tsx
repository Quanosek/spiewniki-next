import { useRouter } from "next/router";

import styles from "@/styles/components/menu.module.scss";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

export default function Menu() {
  const router = useRouter();
  const menu = router.query.menu as string;

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
