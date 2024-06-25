import fs from 'fs';
import path from 'path';
import { exportVideo } from './src/video-exporter'
import { generateFrames } from './src/canvas'
import { getPath } from './src/utils'
import { registerFont } from 'canvas';

function main(){
  // Create frames directory if it doesn't exist
  if (!fs.existsSync('frames')) {
    fs.mkdirSync('frames');
  }

  const lrcPath = getPath(path.join(__dirname, './public/lyrics'));
  const customFontPath = getPath(path.join(__dirname, './public/fonts'));
  const framesOutputPath = path.join(__dirname, './frames');
  const audioDuration = 200000;
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

  if (absoluteAudioPath == null) {
    console.log("No audio file found");
    return
  }

  if (backgroundImagePath == null) {
    console.log("No background image file found");
    return
  }

  generateFrames(lrcPath, audioDuration, customFontPath, backgroundImagePath, framesOutputPath, absoluteAudioPath, exportVideo);
  }

main()