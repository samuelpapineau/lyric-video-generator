import fs from 'fs';
import path from 'path';
import { exportVideo } from './src/video-exporter'
import { generateFrames } from './src/canvas'
import { registerFont } from 'canvas';

registerFont(path.join(__dirname, './public/fonts/edosz.ttf'), { family: 'EdoSZ' });

// Create frames directory if it doesn't exist
if (!fs.existsSync('frames')) {
  fs.mkdirSync('frames');
}

const lrcPath = path.join(__dirname, './public/lyrics/faded.lrc');
const customFontPath = path.join(__dirname, './public/fonts/edosz.ttf');
const framesOutputPath = path.join(__dirname, './frames');
const audioDuration = 200000;
const absoluteAudioPath = path.join(__dirname, './public/audio/faded.mp3');
const backgroundImagePath = path.join(__dirname, './public/images/image.jpg');

generateFrames(lrcPath, audioDuration, customFontPath, backgroundImagePath, framesOutputPath, absoluteAudioPath, exportVideo);