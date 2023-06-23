import os
import xml.etree.ElementTree as ET
import xmltodict
import json
import re

folderPaths = ['C:/Users/kbols/Documents/piesni.klalo.pl-next/public/database/PBT/xml',
               'C:/Users/kbols/Documents/piesni.klalo.pl-next/public/database/UP/xml', 'C:/Users/kbols/Documents/piesni.klalo.pl-next/public/database/N/xml']

bookNames = ['PBT', "UP", "N"]


class Hymn:
    def __init__(self, title, book, lyrics, presentation, verse, author):
        self.id = 0
        self.title = title
        self.book = book
        self.lyrics = lyrics
        self.presentation = presentation
        self.verse = verse
        self.author = author


hymns = [[], [], []]

for i, folderPath in enumerate(folderPaths):
    with os.scandir(folderPath) as entries:
        for j, entry in enumerate(entries):
            if entry.is_file():
                tree = ET.parse(entry.path)
                xmlData = tree.getroot()
                xmlStr = ET.tostring(xmlData, encoding="utf-8", method="xml")
                data = dict(xmltodict.parse(xmlStr, encoding='utf-8'))
                data = data['song']
                book = bookNames[i]
                hymn = Hymn(data['title'], book, data['lyrics'],
                            data['presentation'], data['copyright'], data['author'])
                hymns[i].append(hymn)

for hymnBook in hymns:
    hymnBook.sort(key=lambda hymn: int(re.split("\D", hymn.title)[0]))
    for i, hymn in enumerate(hymnBook):
        hymn.id = i + 1

jsonString = json.dumps([[hymn.__dict__ for hymn in hymnBook]
                        for hymnBook in hymns], ensure_ascii=False)

with open('hymns.json', 'w', encoding="utf-8") as outfile:
    outfile.write(jsonString)
