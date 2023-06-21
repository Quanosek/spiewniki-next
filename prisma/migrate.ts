const fs = require("fs");
const parseString = require("xml2js").parseString;

const folderPaths = ['../public/database/PBT/xml', '../public/database/UP/xml', '../public/database/N/xml'];
const hymnbooks = ['PBT', 'UP', 'N']
const data:any[][] = [[], [], []];

for (let index = 0; index < folderPaths.length; index++) {
    const path = folderPaths[index];
    data[index] = fs.readdirSync(path).map((fileName: string) => {
        return path.concat('/', fileName);
    });
}

for (let i = 0; i < data.length; i++) {
    const hymnbook = data[i];
    for (let k = 0; k < hymnbook.length; k++) {
        const filePath = hymnbook[k];
        const xml = fs.readFileSync(filePath, 'utf-8');
        const json = parseString(xml);
        parseString(xml, (err: any, result: any) => {
            data[i][k] = result.song;
        });
    }
}

for (let index = 0; index < data.length; index++) {
    data[index].sort((a: any, b: any) => {
        a = parseInt(String(a.title[0]).substring(0,a.title[0].indexOf(".")));
        b = parseInt(String(b.title[0]).substring(0,b.title[0].indexOf(".")));
        return a - b;
    });
}

for (let i = 0; i < data.length; i++) {
    for (let k = 0; k < data[i].length; k++) {
        const element = data[i][k];
        const hymnbook = hymnbooks[i];
        const title = String(element.title);
        const number = title.substring(0,title.indexOf("."));
        const order = element.presentation[0];
        const verse = element.copyright[0];
        console.log(hymnbook, number, title, order, verse);

        if(order) console.log(order);
    }
}

//console.log(LyricsFormat(data[1][7].lyrics));

function LyricsFormat(lyrics: any) {
    lyrics = String(lyrics);
    const separator = /\s*\[\w*\]\s*/;
    const verses = lyrics.split(separator).slice(1);

    verses.map((verse: any, index: any) => {
        verses[index] = verse.split(/\n/g).slice(0);
    });

    return verses;
}

class Piesn {
    hymnbook: string;
    number: string;
    title: string;
    lyrics: string;
    order: string;
    verse: string;

    constructor(hymnbook: string, number: string, title: string, lyrics: string, order: string, verse: string) {
        this.hymnbook = hymnbook;
        this.number = number;
        this.title = title;
        this.lyrics = lyrics;
        this.order = order;
        this.verse = verse;
    }
}