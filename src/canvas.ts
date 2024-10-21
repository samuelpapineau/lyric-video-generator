import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont, loadImage } from 'canvas';
import { getDurationFromPath } from './utils';

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

function renderLyricFrame(
  context: any,
  lyric: string,
  customFont: string,
  backgroundImage: any,
  opacity: number
) {
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

export async function generateFrames(
  lrcPath: string,
  customFontPath: string,
  backgroundImagePath: string,
  outputPath: string,
  absoluteAudioPath: string,
  callback: any
) {
  const audioDurationSeconds = Number(await getDurationFromPath(absoluteAudioPath));
  const audioDuration = Math.ceil(1000 * audioDurationSeconds); // Total duration of audio in milliseconds
  const lrcContent = fs.readFileSync(lrcPath, 'utf-8');
  const lyrics = parseLRC(lrcContent); // Parse the lyrics from LRC file

  const frameRate = 15; // 15 frames per second
  const fadeDuration = 500; // Fade duration in milliseconds
  const msPerFrame = 1000 / frameRate; // Duration of a single frame in milliseconds

  // Calculate total number of frames to be generated
  const totalFrames = Math.ceil(audioDuration / msPerFrame);
  console.log(`Total frames to be generated: ${totalFrames}`);

  registerFont(customFontPath, { family: 'Edo SZ' });

  const canvas = createCanvas(1280, 720); // Create a canvas
  const context = canvas.getContext('2d');
  const customFont = 'Edo SZ';
  const backgroundImage = await loadImage(backgroundImagePath);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  let currentFrame = 1;
  let nextLyricIndex = 0;

  // Helper function to render and save a frame
  const saveFrame = (framePath: string, renderFunction: () => void) => {
    renderFunction();
    fs.writeFileSync(framePath, canvas.toBuffer('image/png'));

    // Display live percentage progress in the terminal
    const progress = ((currentFrame / totalFrames) * 100).toFixed(2);
    process.stdout.clearLine(0); // Clear current line in the terminal
    process.stdout.cursorTo(0);  // Move cursor to the start of the line
    process.stdout.write(`Generating frames: ${progress}% (${currentFrame}/${totalFrames})`);
  };

  // Render a blank frame (background only)
  const renderBlankFrame = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  };

  // Render a lyric frame with a specific opacity
  const renderLyricFrame = (lyric: string, opacity: number) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    const maxWidth = canvas.width * 0.9; // 90% of the canvas width
    const lineHeight = 100; // Adjust the line height as needed
    const lines = wrapText(context as unknown as CanvasRenderingContext2D, lyric, maxWidth);

    context.font = `100px "${customFont}"`;
    context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    context.textAlign = 'center';

    const totalTextHeight = lines.length * lineHeight;
    const startY = ((canvas.height - totalTextHeight) / 2 + lineHeight / 2) + 48; // Center the text

    for (let i = 0; i < lines.length; i++) {
      context.fillText(lines[i], canvas.width / 2, startY + i * lineHeight);
    }
  };

  for (let time = 0; time < audioDuration; ) {
    // Move to the next lyric when current time passes the next lyric's time
    if (nextLyricIndex < lyrics.length && time >= lyrics[nextLyricIndex].time) {
      nextLyricIndex++;
    }

    const currentLyric = lyrics[nextLyricIndex - 1] ? lyrics[nextLyricIndex - 1].text : '';

    // Handle blank sections when no lyrics are present
    if (!currentLyric) {
      const nextLyricTime = lyrics[nextLyricIndex] ? lyrics[nextLyricIndex].time : audioDuration;
      const blankDuration = nextLyricTime - time;
      const blankFrameCount = Math.floor(blankDuration / msPerFrame);

      // Render one blank frame and duplicate it
      const blankFramePath = path.join(outputPath, `frame${currentFrame.toString().padStart(5, '0')}.png`);
      saveFrame(blankFramePath, renderBlankFrame);

      // Copy the blank frame for the rest of the blank duration
      for (let i = 1; i < blankFrameCount + 1; i++) {  // +1 adjustment
        const copyFramePath = path.join(outputPath, `frame${(currentFrame + i).toString().padStart(5, '0')}.png`);
        fs.copyFileSync(blankFramePath, copyFramePath);
      }

      // Update the time and frame count after the blank frames
      time += (blankFrameCount + 1) * msPerFrame;  // +1 adjustment
      currentFrame += blankFrameCount + 1;  // +1 adjustment
      continue;
    }

    // Handle lyric sections with fade-in, static, and fade-out
    const nextLyricTime = lyrics[nextLyricIndex] ? lyrics[nextLyricIndex].time : audioDuration;
    const lyricDuration = nextLyricTime - time;
    const lyricFrameCount = Math.floor(lyricDuration / msPerFrame);
    const fadeFrameCount = Math.floor(fadeDuration / msPerFrame);

    // 1. Fade-in frames
    for (let i = 0; i < fadeFrameCount && time < nextLyricTime; i++) {
      const opacity = (i + 1) / fadeFrameCount;
      const lyricFramePath = path.join(outputPath, `frame${currentFrame.toString().padStart(5, '0')}.png`);
      saveFrame(lyricFramePath, () => renderLyricFrame(currentLyric, opacity));
      time += msPerFrame;
      currentFrame++;
    }

    // 2. Static frames (full opacity)
    const staticFrameCount = lyricFrameCount - 2 * fadeFrameCount;
    if (staticFrameCount > 0) {
      const staticFramePath = path.join(outputPath, `frame${currentFrame.toString().padStart(5, '0')}.png`);
      saveFrame(staticFramePath, () => renderLyricFrame(currentLyric, 1));

      // Copy the static frame for the rest of the static duration
      for (let i = 1; i < staticFrameCount + 1; i++) {  // +1 adjustment
        const copyFramePath = path.join(outputPath, `frame${(currentFrame + i).toString().padStart(5, '0')}.png`);
        fs.copyFileSync(staticFramePath, copyFramePath);
      }

      // Update the time and frame count after the static frames
      time += (staticFrameCount + 1) * msPerFrame;  // +1 adjustment
      currentFrame += staticFrameCount + 1;  // +1 adjustment
    }

    // 3. Fade-out frames
    for (let i = 0; i < fadeFrameCount && time < nextLyricTime; i++) {
      const opacity = 1 - (i + 1) / fadeFrameCount;
      const lyricFramePath = path.join(outputPath, `frame${currentFrame.toString().padStart(5, '0')}.png`);
      saveFrame(lyricFramePath, () => renderLyricFrame(currentLyric, opacity));
      time += msPerFrame;
      currentFrame++;
    }
  }

  // Clear progress line at the end
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log('Frame generation completed.');

  // List generated frames
  const generatedFrames = fs.readdirSync(outputPath);
  console.log('Generated Frames:', generatedFrames.length);
  callback('./frames', './output', absoluteAudioPath);
}
