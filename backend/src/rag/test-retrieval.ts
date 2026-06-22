import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

// Make a fake 1536-dim vector. We craft a few that point in different
// "directions" so we can see ranking actually work.
function fakeVector(seed: number): number[] {
  const v = new Array(1536).fill(0);
  // put weight on a few dimensions based on seed, so vectors differ
  for (let i = 0; i < 1536; i++) {
    v[i] = Math.sin((i + 1) * seed * 0.001);
  }
  return v;
}
const toLit = (v: number[]) => `[${v.join(',')}]`;

async function main() {
  // Use a real videoId from your DB (Part 1)
  const videoId = 'cmpxj7hax0006i2spxqbbkwbq';

  // Clear and insert 3 fake chunks with distinct vectors
  await prisma.$executeRaw`DELETE FROM "VideoChunk" WHERE "videoId" = ${videoId}`;

  const fakes = [
    { text: 'පයිතගරස් ප්‍රමේයය හැඳින්වීම', start: 0, end: 45, seed: 1 },
    { text: 'උදාහරණ ගණනය කිරීම', start: 45, end: 90, seed: 5 },
    { text: 'සාරාංශය සහ අවසානය', start: 90, end: 135, seed: 9 },
  ];

  for (const f of fakes) {
    const vec = toLit(fakeVector(f.seed));
    await prisma.$executeRaw`
      INSERT INTO "VideoChunk" (id, "videoId", text, "startTime", "endTime", embedding)
      VALUES (${createId()}, ${videoId}, ${f.text}, ${f.start}, ${f.end}, ${vec}::vector)
    `;
  }
  console.log('Inserted 3 fake chunks.\n');

  // Search using a vector close to seed=1 (should rank chunk 1 first)
  const queryVec = toLit(fakeVector(1.1));
  const rows = await prisma.$queryRaw<any[]>`
    SELECT text, "startTime", "endTime",
           embedding <=> ${queryVec}::vector AS distance
    FROM "VideoChunk"
    WHERE "videoId" = ${videoId}
    ORDER BY embedding <=> ${queryVec}::vector
    LIMIT 5
  `;

  console.log('Search results (closest first):');
  for (const r of rows) {
    console.log(
      `  dist=${Number(r.distance).toFixed(4)}  [${r.startTime}-${r.endTime}s]  ${r.text}`,
    );
  }
}

main()
  .catch((e) => { console.error('FAILED:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());