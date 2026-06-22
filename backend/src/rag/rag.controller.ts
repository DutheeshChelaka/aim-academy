import { Controller, Post, Body, Param } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';

@Controller('rag')
export class RagController {
  constructor(private retrieval: RetrievalService) {}

  /** Student asks a question about a specific video.
   *  Returns the matching transcript chunks with timestamps to seek to. */
  @Post('videos/:videoId/ask')
  async ask(
    @Param('videoId') videoId: string,
    @Body() body: { question: string },
  ) {
    const results = await this.retrieval.search(videoId, body.question, 5);
    return {
      question: body.question,
      results: results.map((r) => ({
        text: r.text,
        startTime: r.startTime,
        endTime: r.endTime,
      })),
    };
  }
}