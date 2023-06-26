import Image from "next/image";

import styles from "@/styles/components/mobileHeader.module.scss";

export default function MobileHeader() {
  return (
    <div className={styles.container}>
      <Image
        className={`${styles.logotype} icon`}
        alt="bpsw"
        src="/logo/bpsw.svg"
        width={50}
        height={50}
        draggable={false}
        priority={true}
      />

      <h1 className={styles.name}>Śpiewniki</h1>
    </div>
  );
}
