import { NextApiRequest, NextApiResponse } from "next";

import fs from "fs";
import path from "path";
import { parseString } from "xml2js";

import bookNames from "@/scripts/bookNames";

export default function Database(req: NextApiRequest, res: NextApiResponse) {
  const { book, title } = req.query;
  let results;

  // main functions holder
  if (!book) results = ListAll();
  else {
    if (!title) results = HymnList(book);
    else results = HymnData(book, title);
  }

  return res.status(200).json(results);
}

// return all hymns in all defined hymnbooks in database
function ListAll() {
  let results = new Array();

  ["PBT", "UP", "N"].map((book) => hymnBook(results, book));

  return results;
}

// return all hymn within hymnbook
function HymnList(book: string | string[]) {
  let results = new Array();
  hymnBook(results, book);
  return results;
}

// read and save result of defined hymnbook
function hymnBook(results: any[], book: string | string[]) {
  const dirname = path.join(process.cwd(), `/public/database/${book}/xml/`);

  fs.readdirSync(dirname)
    .sort((a, b) => {
      return a.localeCompare(b, "pl", { numeric: true });
    })

    .map((filename: string) => {
      // read every hymn
      parseString(
        fs.readFileSync(dirname + filename, "utf-8"),
        (err, result) => {
          if (!result) return;

          let lyrics = LyricsFormat(result.song.lyrics[0]);

          lyrics = lyrics.map((verses: any) => {
            return (verses = verses.filter(
              (verse: string) => !verse.startsWith(".")
            ));
          });

          results.push({
            book: book,
            title: filename,
            lyrics: lyrics,
          });
        }
      );
    });

  return results;
}

// return hymn params json
function HymnData(book: string | string[], title: string | string[]) {
  let results = new Array();

  // read hymn file
  const data = fs.readFileSync(
    path.join(process.cwd(), `/public/database/${book}/xml/${title}`)
  );

  // define result
  parseString(data, (err, result) => {
    const song = result.song;

    song.lyrics = LyricsFormat(result.song.lyrics[0]);
    song.id = [HymnList(book).findIndex((hymn) => hymn.title === title)];
    song.book = [bookNames(book)];

    results.push(song);
  });

  return results;
}

// reformat xml verses
function LyricsFormat(lyrics: string) {
  const regex = /\s*\[\w*\]\s*/;
  const verses = lyrics.split(regex).slice(1);

  const array = new Array();

  verses.map((verse: string, index: number) => {
    const formattedVerse = verse.split(/\n/g).slice(0);
    formattedVerse.forEach((line: string, index: number) => {
      if (line.startsWith(" ")) formattedVerse[index] = line.slice(1);
    });

    array[index] = formattedVerse;
  });

  return array;
}
