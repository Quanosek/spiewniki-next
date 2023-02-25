import { useRouter } from "next/router";

import styles from "@/styles/components/menu.module.scss";

import Favorite from "./menu/favorite";
import Info from "./menu/info";
import Settings from "./menu/settings";

export default function Menu() {
  const router = useRouter();
  const { query } = router;

  return (
    <div id="menu" className={styles.holder}>
      <div className={styles.background} onClick={() => router.back()}></div>

      <div className={styles.menu}>
        <div className={styles.content}>
          {/* select menu */}

          {query.menu === "favorite" && <Favorite />}
          {query.menu === "info" && <Info />}
          {query.menu === "settings" && <Settings />}
        </div>
      </div>
    </div>
  );
}
