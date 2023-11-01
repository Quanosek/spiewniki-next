// @ts-check

import fs from "fs";
import path from "path";

import colors from "colors";
import xml2js from "xml2js";

import axios from "axios";

const repositoryOwner = "Quanosek";
const repositoryName = "Piesni-OpenSong";

axios
  .get(
    `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents`
  )
  .then(({ data }) => {
    console.log(data);
    const map = new Map();

    data
      .filter((item) => item.type === "dir")
      .forEach((folder) => {
        const array = new Array();

        // axios.get(folder.git_url).then(({ data }) => {
        //   data.forEach((file) => file.push(data.git_url));
        // });
      });
  })
  .catch((err) => console.error(err));

// const input = "./public/database/Songs"; //! path to folder with xml files
// const output = "./public/database"; //! path to folder where database will be saved

// //? create map of all files in directory grouped by subfolders names
// const map = new Map();

// fs.readdirSync(input).forEach((folder) => {
//   console.log("Founded folder: " + folder); // log
//   const data = new Array();

//   const files = fs
//     .readdirSync(path.join(input, folder))
//     .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })); //? properly sorted files

//   console.log(colors.gray(files.length + " files")); // log
//   files.forEach((file) => data.push(file));
//   map.set(folder, data);
// });

// // log
// console.log(
//   colors.green(
//     `Successfully created list of all files in ` +
//       colors.bold(map.size) +
//       " folders."
//   )
// );

// //? read all files and create database object
// for (let i = 0; i < map.size; i++) {
//   const folder = [...map][i][0];
//   const files = [...map][i][1];

//   const database = new Array();

//   files.forEach((file, index) => {
//     const pathName = path.join(input, folder, file);

//     // xml2js custom options
//     const parser = new xml2js.Parser({
//       emptyTag: undefined,
//       explicitArray: false,
//     });

//     parser.parseString(fs.readFileSync(pathName, "utf-8"), (err, result) => {
//       if (err) return console.error(err);

//       const Constructor = {
//         id: index,
//         book: folder,
//         name: file,
//         song: { ...result.song },
//       };

//       const lyrics = result.song.lyrics.split(/\n(?=\[\w+\])/);
//       const songObject = new Object();

//       for (const lines of lyrics) {
//         const match = lines.match(/^\[(\w+)\]/);
//         if (!match) return;

//         const section = match[1];
//         const content = lines
//           .replace(/^\[\w+\](?:\s)/, "") // section in first line
//           .replace(/\s+\n/g, "\n") // additional spaces before new line
//           .replace(/^\n/, "") // first empty line
//           .replace(/\s*\n\s*$/, "") // last empty line
//           .split(/\n/g); // all to separate lines

//         songObject[section] = content;
//       }

//       Constructor.song.lyrics = songObject;
//       database.push(Constructor);
//     });
//   });

//   try {
//     if (!fs.existsSync(output)) fs.mkdirSync(output);
//   } catch (err) {
//     console.error(err);
//   }

//   fs.writeFileSync(
//     `./public/database/${folder}.json`,
//     JSON.stringify(database),
//     // JSON.stringify(database, null, 2),
//     "utf-8"
//   );

//   console.log(colors.yellow(`Database created and saved to "${folder}.json"`)); // log
// }

// console.log(colors.green("Done!")); // log
