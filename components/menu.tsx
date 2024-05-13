import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";
import { useEffect, useState } from "react";

import styles from "@/styles/components/menu.module.scss";

// menu boxes smart navigation
export function hiddenMenuQuery(name: string | undefined) {
  const { menu, ...params } = Router.query;

  Router.push(
    // url
    { query: name ? { ...params, menu: name } : { ...params } },
    // as
    { query: { ...params } },
    // options
    { scroll: false, shallow: true }
  );
}

export default function MenuComponent() {
  const router = useRouter();
  const { menu, ...params } = router.query;

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    // menu render
    setShowMenu(Boolean(menu));

    // prevent scrolling
    const { scrollLeft, scrollTop } = document.documentElement;
    const ScrollEvent = () => menu && window.scrollTo(scrollLeft, scrollTop);

    // keyboard shortcuts
    const KeyupEvent = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        !menu
      ) {
        return;
      }

      if (event.key === "Escape") hiddenMenuQuery(undefined);
    };

    document.addEventListener("scroll", ScrollEvent);
    document.addEventListener("keyup", KeyupEvent);
    return () => {
      document.removeEventListener("scroll", ScrollEvent);
      document.removeEventListener("keyup", KeyupEvent);
    };
  }, [router, menu, params]);

  // dynamic import menu
  const DynamicComponent = dynamic(() => import(`./menu/${menu}`), {
    ssr: false,
  });

  return (
    <div
      className={styles.menuComponent}
      style={{
        visibility: showMenu ? "visible" : "hidden",
        opacity: showMenu ? 1 : 0,
        transition: "100ms ease-out",
      }}
    >
      <div
        className={styles.menuBackground}
        onClick={() => hiddenMenuQuery(undefined)}
      />

      {menu && (
        <div className={styles.menuHandler}>
          <div className={styles.menuBox}>
            <DynamicComponent />
          </div>
        </div>
      )}
    </div>
  );
}
