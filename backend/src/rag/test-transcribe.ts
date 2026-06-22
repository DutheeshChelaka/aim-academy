import { TranscriptionService } from './transcription.service';

async function main() {
  const service = new TranscriptionService();
  const videoPath = 'test-assets/part1.mp4';

  console.log('Starting transcription of', videoPath);
  const segments = await service.transcribe(videoPath);

  console.log(`\n=== ${segments.length} SEGMENTS ===\n`);
  for (const s of segments.slice(0, 15)) {
    console.log(`[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`);
  }
  console.log(`\n...showing first 15 of ${segments.length} total`);

  // Save full output so we can inspect it
  const fs = require('fs');
  fs.writeFileSync(
    'test-assets/part1-segments.json',
    JSON.stringify(segments, null, 2),
  );
  console.log('\nFull transcript saved to test-assets/part1-segments.json');
}

main().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});