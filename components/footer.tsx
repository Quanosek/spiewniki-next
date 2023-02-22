import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <p>
        Stworzone przez{" "}
        <Link href="https://github.com/Krist0f0l0s">
          Krzysztofa Olszewskiego
        </Link>{" "}
        i <Link href="https://github.com/Quanosek">Jakuba Kłało</Link>.
      </p>
      <p>
        Wszelkie prawa zastrzeżone &#169; 2023 │ domena{" "}
        <Link href="https://www.klalo.pl">klalo.pl</Link>
      </p>
    </footer>
  );
}
