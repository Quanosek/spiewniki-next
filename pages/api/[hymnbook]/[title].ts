const parseString = require("xml2js").parseString;
import fs from "fs";
import path from "path";

export default function holder(req: any, res: any) {
  let { hymnbook, title } = req.query;
  hymnbook = hymnbook.replaceAll("-", " ");
  title = title.replaceAll("-", " ");

  switch (hymnbook) {
    case "PBT":
      hymnbook = "Pieśni Brzasku Tysiąclecia";
      break;
    case "C":
      hymnbook = "Uwielbiajmy Pana (Cegiełki)";
      break;
    case "N":
      hymnbook = "Śpiewajcie Panu Pieśń Nową (Nowe Pieśni)";
      break;
    case "E":
      hymnbook = "Śpiewniczek Młodzieżowy Epifanii";
      break;
    case "Inne":
      hymnbook = "Inne pieśni";
      break;
  }

  let data;

  try {
    data = fs.readFileSync(
      path.join(process.cwd(), "Piesni-OpenSong", hymnbook, title)
    );
  } catch (err) {
    return res.status(200).json("none");
  }

  parseString(data, (err: any, result: any) => {
    let hymn;
    if (err) hymn = "none";
    else hymn = result.song;

    res.status(200).json({ hymn });
  });
}
