import { NextPage, NextPageContext } from "next";

interface Props {
  statusCode?: number;
}

const Error: NextPage<Props> = ({ statusCode }) => {
  return (
    <main>
      <p>
        {statusCode
          ? `Błąd ${statusCode}. Strona nie istnieje.`
          : "Strona napotkała problem."}
      </p>
    </main>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
