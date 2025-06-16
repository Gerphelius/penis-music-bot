# penis-music-bot
Discord bot for playing sound from youtube videos

## Windows installation

1. Clone the repo
   
   ```sh
   git@github.com:Gerphelius/penis-music-bot.git
   ```
3. Install NPM packages
   
   ```sh
   npm install
   ```
4. Rename `.env.example` to `.env` and enter Discord application info from https://discord.com/developers/applications/

   ```js
   APP_ID=<YOUR_APP_ID>
   DISCORD_TOKEN=<YOUR_BOT_TOKEN>
   PUBLIC_KEY=<YOUR_PUBLIC_KEY>
   ```
5. Download `yt-dlp.exe` from https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#release-files and `ffmpeg-master-latest-win64-gpl-shared.zip`from https://github.com/BtbN/FFmpeg-Builds/releases
6. Add environment variables for yt-dlp.exe and ffmpeg.exe
7. Register bot commands

   ```sh
   npm run register
   ```
8. Start bot
   
   ```
   npm run deploy
   ```
