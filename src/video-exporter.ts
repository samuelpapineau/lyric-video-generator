import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export function exportVideo(framesPath: string, outputPath: string, absoluteAudioPath: string) {
  // Convert paths to absolute paths
  const absoluteFramesPath = path.resolve(framesPath);
  const absoluteOutputPath = path.resolve(outputPath);

  // Test with a single frame
  const testFramePath = path.join(absoluteFramesPath, 'frame00001.png');

  // Verify the single frame file existence
  if (!fs.existsSync(testFramePath)) {
    console.error(`Test frame file does not exist: ${testFramePath}`);
    return;
  }

  console.log(`Test frame file exists: ${testFramePath}`);
  console.log(`Using frames path: ${absoluteFramesPath}`);
  console.log(`Output path: ${absoluteOutputPath}`);

  ffmpeg()
    .addInput(path.join(absoluteFramesPath, 'frame%05d.png')) // Single frame input for testing
    .inputFPS(15)
    .addInput(absoluteAudioPath)
    .videoCodec('libx264')
    .outputOptions('-pix_fmt yuv420p')
    .save(path.join(absoluteOutputPath, 'video.mp4'))
    .on('end', () => {
      console.log('Video created successfully!');
    })
    .on('error', (err) => {
      console.error('Error creating video:', err);
    });
}