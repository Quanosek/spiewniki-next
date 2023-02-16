import fs from "fs";
import path from "path";

import { parseString } from "xml2js";

export default function Database(req: any, res: any) {
  if (!req.query.book) ListAll(res);
  else {
    if (!req.query.title) {
      const results = HymnList(req.query.book);
      res.status(200).json({ results });
    } else {
      HymnData(req.query, res);
    }
  }
}

function ListAll(res: any) {
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
              lyrics: result.song.lyrics[0],
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
            lyrics: result.song.lyrics[0],
          });
        }
      );
    });

  return results;
}

function HymnData(query: any, res: any) {
  const { book, title } = query;

  const data = fs.readFileSync(
    path.join(process.cwd(), `/database/${book}/xml/${title}/`)
  );

  parseString(data, (err, result) => {
    const hymn = result.song;
    res.status(200).json({ hymn });
  });
}
