export default function LyricsFormat(lyrics: any) {
  const separator = /\s*\[\w*\]\s*/;
  const verses = lyrics.split(separator).slice(1);

  verses.forEach((element: any, index: number) => {
    verses[index] = element.split(/\n/g).slice(0);
  });

  return verses;
}
