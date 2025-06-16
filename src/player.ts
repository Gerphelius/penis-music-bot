import { spawn, type ChildProcessByStdio, type ChildProcessWithoutNullStreams } from "child_process";
import { Stream } from "stream";

import { AudioPlayer, createAudioPlayer, createAudioResource, StreamType, VoiceConnection } from "@discordjs/voice";

type FfmpegRef = ChildProcessByStdio<Stream.Writable, Stream.Readable, null>;
type YtdlpRef = ChildProcessWithoutNullStreams;

export function createPlayer(url: string, connection: VoiceConnection): AudioPlayer {
  currentPlayer && stopCurrent();
  currentPlayer = new Player(url);
  currentConnection = connection;

  return currentPlayer.playerRef;
}

export function stopCurrent(): void {
  currentConnection?.subscribe(createAudioPlayer());
  currentPlayer?.destroy();

  currentPlayer = null;
  currentConnection = null;
}

let currentPlayer: Player | null;
let currentConnection: VoiceConnection | null;

class Player {
  private readonly _audioPlayer: AudioPlayer = createAudioPlayer();
  private _ffmpeg: FfmpegRef;
  private _ytdlp: YtdlpRef;

  constructor(url: string) {
    this._ytdlp = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-o', '-',
      '--no-playlist',
      url,
    ]);

    this._ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-f', 'ogg',
      '-ar', '48000',
      '-ac', '2',
      '-loglevel', 'quiet',
      '-acodec', 'libopus',
      'pipe:1'
    ], { stdio: ['pipe', 'pipe', 'ignore'] });

    this._ytdlp.stdout.pipe(this._ffmpeg.stdin);

    const resource = createAudioResource(this._ffmpeg.stdout, {
      inputType: StreamType.OggOpus,
    });

    this._audioPlayer.play(resource);
  }

  get playerRef(): AudioPlayer {
    return this._audioPlayer;
  }

  public destroy(): void {
    this._ffmpeg.stdin.on("close", () => {
      this._ffmpeg.kill();
      this._ytdlp.kill();
      this._audioPlayer.stop();
    });

    this._ffmpeg.stdin.end();
    this._ytdlp.stdin.end();
  }
}
