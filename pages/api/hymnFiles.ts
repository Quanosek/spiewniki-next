import { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import path from "path";

import bookShortcut from "@/scripts/bookShortcut";
import textFormat from "@/scripts/textFormat";

export default function hymnFiles(req: NextApiRequest, res: NextApiResponse) {
  try {
    const book = bookShortcut(req.query.book as string);
    const title = req.query.title as string;

    let id = "";
    const match = title.match(/^\d+[a-zA-Z]?/);

    if (match) id = match[0];
    else id = textFormat(title).replaceAll(" ", "_");

    const locateFile = (type: string) => {
      try {
        const file = fs
          .readdirSync(path.join(process.cwd(), "public", type, book))
          .find((a) => a.startsWith(id));

        if (file) return { book, id };
        else return null;
      } catch (err) {
        return null;
      }
    };

    const result = {
      pdf: locateFile("pdf"),
      //   mp3: locateFile("mp3"),
    };

    return res.status(200).json(result);

    // handle error
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
