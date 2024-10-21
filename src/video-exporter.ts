import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath.path);

export function exportVideo(framesPath: string, outputPath: string, absoluteAudioPath: string) {
  // Convert paths to absolute paths
  const absoluteFramesPath = path.resolve(framesPath);
  const absoluteOutputPath = path.resolve(outputPath);

  // Get all frame files in the frames directory and ensure they are sorted by creation time
  const frameFiles = fs.readdirSync(absoluteFramesPath)
    .filter(file => file.endsWith('.png')) // Only include PNG files (frames)
    .map(file => ({
      filePath: path.join(absoluteFramesPath, file),
      creationTime: fs.statSync(path.join(absoluteFramesPath, file)).birthtimeMs
    }))
    // Sort by creation time (birthtime)
    .sort((a, b) => a.creationTime - b.creationTime)
    .map(({ filePath }) => filePath); // Extract sorted file paths

  // Verify that there are frames to process
  if (frameFiles.length === 0) {
    console.error('No frames found to process');
    return;
  }

  console.log(`Using frames path: ${absoluteFramesPath}`);
  console.log(`Output path: ${absoluteOutputPath}`);
  console.log(`Number of frames: ${frameFiles.length}`);
  console.log(`Audio path: ${absoluteAudioPath}`);

  // Use the first file name pattern to detect the sequence
  const firstFrameFile = path.basename(frameFiles[0]);
  const framePattern = firstFrameFile.replace(/\d+\.png/, '%05d.png');
  console.log(`Frame pattern detected: ${framePattern}`);

  // Initialize ffmpeg process with frame sequence and audio
  const ffmpegProcess = ffmpeg()
    .addInput(path.join(absoluteFramesPath, framePattern)) // Add frame sequence (e.g., frame%05d.png)
    .inputFPS(15) // Set the input frame rate after adding frames
    .addInput(absoluteAudioPath) // Add the audio file
    .videoCodec('libx264') // Use standard H.264 codec
    .audioCodec('aac') // Specify AAC codec for audio
    .outputOptions('-pix_fmt yuv420p') // Ensures video plays on all devices
    .outputOptions('-c:a aac') // Use AAC for audio encoding
    .outputOptions('-b:a 192k') // Set audio bitrate
    .outputOptions('-shortest') // Ensures the video is not longer than the audio
    .outputOptions('-preset', 'fast') // Fast preset for faster encoding
    .outputOptions('-threads', '4') // Use 4 threads (adjust based on CPU cores)
    .save(path.join(absoluteOutputPath, 'video.mp4'))
    
    // Event to log when the video has been successfully created
    .on('end', () => {
      console.log('Video created successfully!');
    })

    // Event to handle errors
    .on('error', (err) => {
      console.error('Error creating video:', err);
    })

    // Event to track progress
    .on('progress', (progress) => {
      if (progress.percent !== undefined) {
        console.log(`Processing: ${progress.percent.toFixed(2)}% done`);
      }
      if (progress.timemark) {
        console.log(`Current timestamp: ${progress.timemark}`);
      }
      if (progress.frames) {
        console.log(`Processed ${progress.frames} frames`);
      }
    });

  console.log('Starting video export...');
  
  // Run ffmpeg to create the video
  ffmpegProcess.run();
}
