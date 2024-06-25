import * as fs from 'fs';
import * as path from 'path';
import ffprobePath from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfprobePath(ffprobePath.path);

function getFirstFile(directory: string): string | null {
    try {
        // Read all files in the directory
        const files = fs.readdirSync(directory);

        // Filter out directories and keep only files
        const onlyFiles = files.filter(file => {
            const filePath = path.join(directory, file);
            return fs.statSync(filePath).isFile();
        });

        // Return the full path of the first file or null if no files are found
        return onlyFiles.length > 0 ? path.join(directory, onlyFiles[0]) : null;
    } catch (err) {
        console.error('Error reading directory:', err);
        return null;
    }
}

export function getPath(directory: string): string | null {
    const firstFile = getFirstFile(directory);
    return firstFile ? firstFile : null;
}

export function getDurationFromPath(path:string) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(path, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(metadata.format.duration);
        });
    });
}