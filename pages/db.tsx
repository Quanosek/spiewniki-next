import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default function DatabasePage({ data }: any) {
  const [formData, setFormData] = useState({});
  const [movies, setMovies] = useState(data);

  async function saveMovie(e: any) {
    e.preventDefault();
    setMovies([...movies, formData]);

    const response = await fetch("/api/movies", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    return await response.json();
  }

  return (
    <>
      <Head>
        <title>TEST Bazy danych | Śpiewniki</title>
      </Head>

      <main>
        <ul>
          {movies.map(
            (item: {
              slug: string;
              title: string;
              year: number;
              description: string;
            }) => (
              <li key={item.slug}>
                <h1>{item.title}</h1>
                <h2>{item.year}</h2>
                <p>{item.description}</p>
                <Link href={`/movies/${item.slug}`}>More about this movie</Link>
              </li>
            )
          )}
        </ul>

        <form onSubmit={saveMovie}>
          <input
            type="text"
            placeholder="Title"
            name="title"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Year"
            name="year"
            onChange={(e) =>
              setFormData({ ...formData, year: +e.target.value })
            }
          />
          <input
            type="description"
            placeholder="Description"
            name="title"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Slug"
            name="slug"
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <button type="submit">Add movie</button>
        </form>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const movies = await prisma.movie.findMany();

  return {
    props: {
      data: movies,
    },
  };
}
