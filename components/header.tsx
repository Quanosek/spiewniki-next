import Link from "next/link";
import Image from "next/image";

import { useState, useEffect } from "react";

export default function Header() {
    return (
        <header>
          <div className="container">
            <Link
              href="/"
              title="Zebrane w jednym miejscu śpiewniki i pieśni religijne."
            >
              <Image
                className="icon"
                alt="logotype"
                src="./logo/bpsw.svg"
                width={40}
                height={40}
                draggable={false}
              />

              <h1>Śpiewniki</h1>
            </Link>

            <Link
              className="externalLink"
              href="https://nastrazy.org/"
              target="_blank"
            >
                <p>Na straży.org</p>

              <Image
                className="icon"
                alt="link"
                src="/icons/external_link.svg"
                width={16}
                height={16}
                draggable={false}
              />
            </Link>
          </div>
        </header>
    )
}