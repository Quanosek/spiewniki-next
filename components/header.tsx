import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Header(params: any) {
  const router = useRouter();

  return (
    <header>
      <div className="container maxWidth">
        <div className="backArrow">
          {params.displayBackBtn && (
            <button onClick={() => router.back()}>
              <Image
                className="icon"
                alt="arrow"
                src="/icons/arrow.svg"
                width={20}
                height={20}
              />
              <p>Powrót {params.backTo && `do ${params.backTo}`}</p>
            </button>
          )}
        </div>

        <Link
          href="/"
          title="Zebrane w jednym miejscu śpiewniki i pieśni religijne."
          className="title"
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

        <div className="externalLink" id="nastrazy">
          <Link href="https://nastrazy.org/" target="_blank">
            <p>Na straży.org</p>

            <Image
              className="icon"
              alt="link"
              src="/icons/external_link.svg"
              width={20}
              height={20}
              draggable={false}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
