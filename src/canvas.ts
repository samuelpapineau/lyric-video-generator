import { createCanvas, registerFont, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

interface LyricLine {
    time: number; // time in milliseconds
    text: string;
}

function parseLRC(lrcContent: string): LyricLine[] {
    const lines = lrcContent.split('\n');
    const lyrics: LyricLine[] = [];

    lines.forEach(line => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const [, min, sec, millisec, text] = match;
            const time = parseInt(min) * 60000 + parseInt(sec) * 1000 + parseInt(millisec.padEnd(3, '0'));
            lyrics.push({ time, text });
        }
    });

    return lyrics;
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function renderLyricFrame(context: any, lyric: string, customFont: string, backgroundImage: any, opacity: number) {
    const canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const maxWidth = canvas.width * 0.9; // 90% of the canvas width
    const lineHeight = 100; // Adjust the line height as needed
    const lines = wrapText(context, lyric, maxWidth);

    context.font = `100px "${customFont}"`;
    context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    context.textAlign = 'center';

    const totalTextHeight = lines.length * lineHeight;
    const startY = ((canvas.height - totalTextHeight) / 2 + lineHeight / 2) + 48; // Adjust startY to center the text blob

    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], canvas.width / 2, startY + i * lineHeight);
    }
}

export async function generateFrames(lrcPath: string, audioDuration: number, customFontPath: string, backgroundImagePath: string, outputPath: string, absoluteAudioPath: string, callback: any) {
    const lrcContent = fs.readFileSync(lrcPath, 'utf-8');
    const lyrics = parseLRC(lrcContent);

    const frameRate = 15; // 24 frames per second
    const fadeDuration = 500; // Fade duration in milliseconds

    registerFont(customFontPath, { family: 'Edo SZ' });

    const canvas = createCanvas(1280, 720);
    const context = canvas.getContext('2d');
    const customFont = 'Edo SZ';
    const backgroundImage = await loadImage(backgroundImagePath);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    let currentFrame = 1;
    let nextLyricIndex = 0;

    for (let time = 0; time < audioDuration; time += 1000 / frameRate) {
        if (nextLyricIndex < lyrics.length && time >= lyrics[nextLyricIndex].time) {
            nextLyricIndex++;
        }

        const currentLyric = lyrics[nextLyricIndex - 1] ? lyrics[nextLyricIndex - 1].text : '';

        // Calculate opacity for fade-in and fade-out effects
        let opacity = 1;
        if (nextLyricIndex > 0) {
            const lyricStartTime = lyrics[nextLyricIndex - 1].time;
            if (time - lyricStartTime < fadeDuration) {
                opacity = (time - lyricStartTime) / fadeDuration; // Fade in
            } else if (lyrics[nextLyricIndex] && lyrics[nextLyricIndex].time - time < fadeDuration) {
                opacity = (lyrics[nextLyricIndex].time - time) / fadeDuration; // Fade out
            }
        }

        renderLyricFrame(context, currentLyric, customFont, backgroundImage, opacity);
        const framePath = path.join(outputPath, `frame${currentFrame.toString().padStart(5, '0')}.png`);
        fs.writeFileSync(framePath, canvas.toBuffer('image/png'));
        currentFrame++;
    }

    // List generated frames
    const generatedFrames = fs.readdirSync(outputPath);
    console.log('Generated Frames:', generatedFrames.length);
    callback('./frames', './output', absoluteAudioPath)
}
