import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';
import { TranscriptionService } from './transcription.service';
import { EmbeddingsService } from './embeddings.service';
import { chunkSegments } from './chunking';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private prisma = new PrismaClient();

  constructor(
    private transcription: TranscriptionService,
    private embeddings: EmbeddingsService,
  ) {}

  /**
   * Full pipeline for one video:
   * file -> transcribe -> chunk -> embed -> store in pgvector.
   * Deletes any existing chunks for this video first (so re-running is safe).
   */
  async ingestVideo(videoId: string, videoPath: string): Promise<number> {
    this.logger.log(`Ingesting video ${videoId} from ${videoPath}`);

    // 1. Transcribe (OpenAI Whisper — costs ~$0.006/min)
    const segments = await this.transcription.transcribe(videoPath);

    // 2. Chunk (free)
    const chunks = chunkSegments(segments, 45);
    this.logger.log(`${segments.length} segments -> ${chunks.length} chunks`);

    // 3. Embed all chunks in one batch (OpenAI — fractions of a cent)
    const vectors = await this.embeddings.embedBatch(chunks.map((c) => c.text));

    // 4. Clear old chunks for this video, then insert new ones
    await this.prisma.$executeRaw`
      DELETE FROM "VideoChunk" WHERE "videoId" = ${videoId}
    `;

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const vec = this.embeddings.toVectorLiteral(vectors[i]);
      await this.prisma.$executeRaw`
        INSERT INTO "VideoChunk" (id, "videoId", text, "startTime", "endTime", embedding)
        VALUES (${createId()}, ${videoId}, ${c.text}, ${c.startTime}, ${c.endTime}, ${vec}::vector)
      `;
    }

    this.logger.log(`Stored ${chunks.length} chunks for video ${videoId}`);
    return chunks.length;
  }
}