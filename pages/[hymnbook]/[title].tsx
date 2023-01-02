import { useState, useEffect } from "react";

// @ts-ignore
export async function getServerSideProps(context) {
  let { hymnbook, title } = context.params;

  hymnbook = hymnbook.replaceAll("-", " ");
  title = title.replaceAll("-", " ");

  return {
    props: {
      hymnbook,
      title,
    },
  };
}
// @ts-ignore
export default function Profile({ hymnbook, title }) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/${hymnbook}/${title}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No profile data</p>;
  // @ts-ignore
  const hymn = data.hymn;

  return (
    <>
      <h1>{hymn.title[0]}</h1>
      <p>{hymn.lyrics[0]}</p>
    </>
  );
}
