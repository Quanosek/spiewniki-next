import { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import path from "path";

import bookShortcut, { booksList } from "@/scripts/bookShortcut";
import textFormat from "@/scripts/textFormat";

export default function booksData(req: NextApiRequest, res: NextApiResponse) {
  try {
    // const covers = fs.readdirSync(path.join(process.cwd(), "public", "covers"));
    const pdfFiles = fs.readdirSync(path.join(process.cwd(), "public", "pdf"));

    const booksWithPdf = booksList().map((book) => {
      const pdfName = textFormat(bookShortcut(book)).replaceAll(" ", "_");

      return {
        shortcut: book,
        name: bookShortcut(book),
        // cover: covers.includes(`${book}.webp`),
        pdf: pdfFiles.includes(`${pdfName}.pdf`),
      };
    });

    return res.status(200).json(booksWithPdf);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
