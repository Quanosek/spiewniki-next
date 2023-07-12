import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let rawData = fs.readFileSync("./hymns.json");
let hymns = JSON.parse(rawData);
hymns = hymns[0].concat(hymns[1], hymns[2]);

async function main() {
  hymns.forEach((hymn) => {
    prisma.hymn.create(hymn);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
