import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

import { bookShortcut } from "@/lib/availableBooks";
import simplifyText from "@/lib/simplifyText";

// API to find connected files with specific hymn
export default function hymnFiles(req: NextApiRequest, res: NextApiResponse) {
  const { title } = req.query as { [key: string]: string };

  let { book } = req.query as { [key: string]: string };
  book = bookShortcut(book);

  try {
    let id = "";
    const match = title.match(/^\d+[a-zA-Z]?/);

    if (match) id = match[0];
    else id = new simplifyText(title).modify();

    const locateFile = (category: string) => {
      try {
        const file = fs
          .readdirSync(path.join(process.cwd(), "public", category, book))
          .find((a) => a.startsWith(id));

        if (file) return { book, id };
        else return null;
      } catch (err) {
        console.error(err);
        return null;
      }
    };

    const results = {
      pdf: locateFile("pdf"),
      // ...files
    };

    return res.status(200).json(results);

    // handle error
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
