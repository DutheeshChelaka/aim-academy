import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RetrievalService } from './retrieval.service';
import { IngestionService } from './ingestion.service';
import { TranscriptionService } from './transcription.service';
import { EmbeddingsService } from './embeddings.service';

@Module({
  controllers: [RagController],
  providers: [
    RetrievalService,
    IngestionService,
    TranscriptionService,
    EmbeddingsService,
  ],
})
export class RagModule {}