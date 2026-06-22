import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import OpenAI from 'openai';

const execAsync = promisify(exec);

export interface TranscriptSegment {
  text: string;
  start: number; // seconds
  end: number;
}

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  /** Extract mono 16kHz mp3 audio from a video file. Returns the audio path. */
  private async extractAudio(videoPath: string): Promise<string> {
    const audioPath = videoPath.replace(/\.[^.]+$/, '.mp3');
    this.logger.log(`Extracting audio: ${videoPath} -> ${audioPath}`);
    await execAsync(
      `ffmpeg -y -i "${videoPath}" -vn -ar 16000 -ac 1 -b:a 64k "${audioPath}"`,
    );
    const { size } = fs.statSync(audioPath);
    this.logger.log(`Audio ready: ${(size / 1e6).toFixed(1)}MB`);
    if (size > 25 * 1024 * 1024) {
      throw new Error(
        `Audio is ${(size / 1e6).toFixed(1)}MB, over Whisper's 25MB limit. This video needs splitting.`,
      );
    }
    return audioPath;
  }

  /** Transcribe a video file into timestamped segments using Whisper. */
  async transcribe(videoPath: string): Promise<TranscriptSegment[]> {
    const audioPath = await this.extractAudio(videoPath);
    this.logger.log('Sending to Whisper...');

    const res = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'si', // Sinhala hint
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    fs.unlinkSync(audioPath); // clean up the temp mp3

    const segments = (res as any).segments as TranscriptSegment[];
    this.logger.log(`Got ${segments.length} segments`);
    return segments.map((s) => ({
      text: s.text.trim(),
      start: s.start,
      end: s.end,
    }));
  }
}