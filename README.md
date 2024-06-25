# Lyric Video Generator

This project allows you to generate a lyric video using nothing but a lyric (.lrc) file, an image, and an audio file.


https://github.com/samuelpapineau/lyric-video-generator/assets/71904015/47a49e34-7646-40f8-85cc-5910c869a091


# Usage

Start by generating the media folders:
```
npm run setup
```
</br>

You will find four media folders in the public folder. The fonts folder has already been created and contains the default [Edo SZ](https://www.dafont.com/edo-sz.font) font, though this can be changed to anything by simply deleting the font file and pasting in a new one of your choice. Note that any custom fonts must be installed on your system for them to be compatible.

The audio folder is where you will place the song you will use for your lyric video and should be in .mp3 of .wav format.

The images folder is for your background image. You can find copyright-free images online such as the one used in the example folder. Images should be in .png or .jpg format. It is not possible to use .webp formatted images with this video generator.

The lyrics folder is where you will place your lyrics file. These can either be made using tools like [lrcgenerator](https://www.lrcgenerator.com/) or you can find pre-made ones on sites like [lyricsify](https://www.lyricsify.com/).

Once you have everything ready, run
```
npm run start
```

This will start generating the frames as individual pictures in the frames folder. This may take quite some time depending on how powerful your computer is. The video generation time seems to be somewhat in line with other video rendering programs though, but that can vary quite a bit.

When complete, a video.mp4 file will be created in the output folder.

## Media Sources

- [ONLAP - The Awakening](https://www.youtube.com/watch?v=VY7Gfpf29nA&ab_channel=ONLAPOfficial
)
- [Onlap Lyrics](https://www.lyricsify.com/lyrics/onlap/the-awakening)
- [Sunset over Snow Covered Mountains (image)
](https://www.pexels.com/photo/sunset-over-snow-covered-mountains-66997/)
- [Edo SZ by Vic Fieger](https://www.dafont.com/edo-sz.font)

<br>

## Disclaimer
It is not permitted to use this code to generate videos that may violate copyright law. Any use of this code where the creator of the songs, images, fonts, lyrics, or others, has not explicitly given permission for the reuse and readaptation of their mateirals, is strictly prohibited.
