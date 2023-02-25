import Image from "next/image";
import router from "next/router";

import styles from "@/styles/components/navbar.module.scss";

export default function topNavbar() {
  return (
    <div className={styles.top}>
      <button onClick={() => router.back()}>
        <Image
          className={`${styles.back} icon`}
          alt="wstecz"
          src="/icons/arrow.svg"
          width={30}
          height={30}
        />
      </button>

      <div>
        <button onClick={() => {}}>
          <Image
            className="icon"
            alt="mp3"
            src="/icons/music.svg"
            width={30}
            height={30}
          />
        </button>

        <button onClick={() => {}}>
          <Image
            className="icon"
            alt="pdf"
            src="/icons/document.svg"
            width={30}
            height={30}
          />
        </button>

        <button onClick={() => {}}>
          <Image
            className="icon"
            alt="ulubione"
            src="/icons/star_empty.svg"
            width={30}
            height={30}
          />
        </button>
      </div>
    </div>
  );
}
