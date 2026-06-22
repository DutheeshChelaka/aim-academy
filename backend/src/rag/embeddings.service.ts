import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  private model = 'text-embedding-3-small'; // 1536 dims, matches your vector(1536) column

  /** Embed many texts in one call. Returns vectors in the same order. */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const res = await this.openai.embeddings.create({
      model: this.model,
      input: texts,
    });
    return res.data.map((d) => d.embedding);
  }

  /** Embed a single query string. */
  async embedOne(text: string): Promise<number[]> {
    const [vec] = await this.embedBatch([text]);
    return vec;
  }

  /** Format a JS number[] as a pgvector literal: [0.1,0.2,...] */
  toVectorLiteral(vec: number[]): string {
    return `[${vec.join(',')}]`;
  }
}