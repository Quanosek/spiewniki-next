import fs from "fs";
import path from "path";
import { parseString } from "xml2js";

import { NextApiRequest, NextApiResponse } from "next";

export default function Database(req: NextApiRequest, res: NextApiResponse) {
  const { book, title } = req.query;
  if (!book) ListAll(res);
  else {
    if (!title) {
      const results = HymnList(book as string);
      res.status(200).json({ results });
    } else {
      HymnData(req, res);
    }
  }
}

function ListAll(res: NextApiResponse) {
  let results = new Array();
  const books = ["PBT", "UP", "N", "E", "I"];

  books.forEach((book) => {
    const dirname = path.join(process.cwd(), `/database/${book}/xml/`);

    fs.readdirSync(dirname)
      .sort((a, b) => {
        return a.localeCompare(b, "pl", { numeric: true });
      })

      .forEach((filename: string) => {
        parseString(
          fs.readFileSync(dirname + filename, "utf-8"),
          (err, result) => {
            results.push({
              book: book,
              title: filename,
              lyrics: LyricsFormat(result.song.lyrics[0]),
            });
          }
        );
      });
  });

  res.status(200).json({ results });
}

function HymnList(book: string) {
  let results = new Array();
  const dirname = path.join(process.cwd(), `/database/${book}/xml/`);

  fs.readdirSync(dirname)
    .sort((a, b) => {
      return a.localeCompare(b, "pl", { numeric: true });
    })

    .forEach((filename: string) => {
      parseString(
        fs.readFileSync(dirname + filename, "utf-8"),
        (err, result) => {
          results.push({
            book: book,
            title: filename,
            lyrics: LyricsFormat(result.song.lyrics[0]),
          });
        }
      );
    });

  return results;
}

function HymnData(req: NextApiRequest, res: NextApiResponse) {
  const { book, title } = req.query;

  const data = fs.readFileSync(
    path.join(process.cwd(), `/database/${book}/xml/${title}/`)
  );

  parseString(data, (err, result) => {
    result.song.lyrics[0] = LyricsFormat(result.song.lyrics[0]);

    const hymn = result.song;
    res.status(200).json({ hymn });
  });
}

function LyricsFormat(lyrics: any) {
  const separator = /\s*\[\w*\]\s*/;
  const verses = lyrics.split(separator).slice(1);

  verses.forEach((element: any, index: number) => {
    verses[index] = element.split(/\n/g).slice(0);
  });

  return verses;
}
