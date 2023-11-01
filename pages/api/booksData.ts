import { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import path from "path";

import { bookShortcut, booksList } from "@/scripts/bookShortcut";
import textFormat from "@/scripts/textFormat";

export default function booksData(req: NextApiRequest, res: NextApiResponse) {
  try {
    // const covers = fs.readdirSync(path.join(process.cwd(), "public", "covers"));
    const pdfFiles = fs.readdirSync(path.join(process.cwd(), "public", "pdf"));

    const result = booksList().map((book) => {
      const pdfName = textFormat(bookShortcut(book)).replaceAll(" ", "_");

      return {
        name: book,
        // cover: covers.includes(`${book}.webp`) ? book : null,
        pdf: pdfFiles.includes(`${pdfName}.pdf`) ? pdfName : null,
      };
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
