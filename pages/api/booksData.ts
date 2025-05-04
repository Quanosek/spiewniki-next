import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import { bookShortcut, booksList } from "@/lib/availableBooks";
import simplifyText from "@/lib/simplifyText";

// API to find connected files with list of defined books
export default function booksData(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const results = booksList().map((book) => {
      const name = new simplifyText(bookShortcut(book)).modify();

      const locateFile = (category: string) => {
        try {
          const file = fs
            .readdirSync(path.join(process.cwd(), "public", category))
            .find((a) => a.startsWith(name));

          if (file) return { book, name };
          else return null;
        } catch (err) {
          console.error(err);
          return null;
        }
      };

      return {
        name: book,
        pdf: locateFile("pdf"),
      };
    });

    return res.status(200).json(results);

    // handle error
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
