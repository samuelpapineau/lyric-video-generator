import fs from 'fs';
import path from 'path';
import { exportVideo } from './src/video-exporter'
import { generateFrames } from './src/canvas'
import { getPath } from './src/utils'


async function main(){
  // Create frames directory if it doesn't exist
  if (!fs.existsSync('frames')) {
    fs.mkdirSync('frames');
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }

  const lrcPath = getPath(path.join(__dirname, './public/lyrics'));
  const customFontPath = getPath(path.join(__dirname, './public/fonts'));
  const framesOutputPath = path.join(__dirname, './frames');
  const absoluteAudioPath = getPath(path.join(__dirname, './public/audio'));
  const backgroundImagePath = getPath(path.join(__dirname, './public/images'));

  //input validation

  if (lrcPath == null) {
    console.log("No lyric file found");
    return
  }

  if (customFontPath == null) {
    console.log("No font file found");
    return
  }

  if (backgroundImagePath == null) {
    console.log("No background image file found");
    return
  }

  if (absoluteAudioPath == null) {
    console.log("No audio file found");
    return
  }

  generateFrames(lrcPath, customFontPath, backgroundImagePath, framesOutputPath, absoluteAudioPath, exportVideo);
  }

main()