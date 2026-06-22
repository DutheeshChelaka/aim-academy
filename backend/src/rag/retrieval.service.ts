import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { EmbeddingsService } from './embeddings.service';

export interface RetrievedChunk {
  text: string;
  startTime: number;
  endTime: number;
  distance: number;
}

@Injectable()
export class RetrievalService {
  private prisma = new PrismaClient();

  constructor(private embeddings: EmbeddingsService) {}

  /** Search a video's chunks by semantic similarity to the query. */
  async search(
    videoId: string,
    query: string,
    topK = 5,
  ): Promise<RetrievedChunk[]> {
    const queryVec = await this.embeddings.embedOne(query);
    const vecLiteral = this.embeddings.toVectorLiteral(queryVec);
    return this.searchByVector(videoId, vecLiteral, topK);
  }

  /** Lower-level: search using an already-computed vector literal.
   *  Lets us test with fake vectors without calling OpenAI. */
  async searchByVector(
    videoId: string,
    vecLiteral: string,
    topK = 5,
  ): Promise<RetrievedChunk[]> {
    const rows = await this.prisma.$queryRaw<RetrievedChunk[]>`
      SELECT
        text,
        "startTime",
        "endTime",
        embedding <=> ${vecLiteral}::vector AS distance
      FROM "VideoChunk"
      WHERE "videoId" = ${videoId}
      ORDER BY embedding <=> ${vecLiteral}::vector
      LIMIT ${topK}
    `;
    return rows;
  }
}