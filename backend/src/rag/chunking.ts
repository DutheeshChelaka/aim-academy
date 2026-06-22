import { TranscriptSegment } from './transcription.service';

export interface Chunk {
  text: string;
  startTime: number;
  endTime: number;
}

/**
 * Group Whisper segments into ~windowSec-long chunks, preserving timestamp ranges.
 * Whisper segments are a few seconds each — too small to embed well — so we merge
 * them into larger windows for better retrieval.
 */
export function chunkSegments(
  segments: TranscriptSegment[],
  windowSec = 45,
): Chunk[] {
  const chunks: Chunk[] = [];
  let cur: Chunk | null = null;

  for (const s of segments) {
    if (!cur) {
      cur = { text: s.text, startTime: s.start, endTime: s.end };
      continue;
    }
    cur.text += ' ' + s.text;
    cur.endTime = s.end;

    if (cur.endTime - cur.startTime >= windowSec) {
      chunks.push({ ...cur, text: cur.text.trim() });
      cur = null;
    }
  }
  if (cur) chunks.push({ ...cur, text: cur.text.trim() });
  return chunks;
}