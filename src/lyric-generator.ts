interface LyricLine {
    time: number; // time in milliseconds
    text: string;
  }

 export function parseLRC(lrcContent: string): LyricLine[] {
    const lines = lrcContent.split('\n');
    const lyrics: LyricLine[] = [];
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (match) {
        const [, min, sec, millisec, text] = match;
        const time = parseInt(min) * 60000 + parseInt(sec) * 1000 + parseInt(millisec) * 10;
        lyrics.push({ time, text });
      }
    });
    return lyrics;
  }