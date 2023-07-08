const fs = require('fs');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

let rawdata = fs.readFileSync('./hymns.json');
let hymns = JSON.parse(rawdata);
hymns = hymns[0].concat(hymns[1], hymns[2])

async function main() {
    hymns.forEach(hymn => {
        prisma.hymn.create(hymn);
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })