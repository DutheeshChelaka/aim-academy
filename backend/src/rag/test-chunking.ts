import { chunkSegments } from './chunking';

// Fake Sinhala-ish segments mimicking Whisper output
const fakeSegments = [
  { text: 'අද අපි පයිතගරස් ප්‍රමේයය ගැන කතා කරමු', start: 0, end: 8 },
  { text: 'මේක ත්‍රිකෝණයක පාද තුනක් අතර සම්බන්ධයක්', start: 8, end: 18 },
  { text: 'a වර්ග එකතු b වර්ග සමාන c වර්ග', start: 18, end: 30 },
  { text: 'දැන් අපි උදාහරණයක් බලමු', start: 30, end: 40 },
  { text: 'මෙතන පාද දෙකක් දී තිබෙනවා', start: 40, end: 52 },
  { text: 'තුන සහ හතර නම් කර්ණය පහයි', start: 52, end: 64 },
];

const chunks = chunkSegments(fakeSegments, 45);
console.log(`${fakeSegments.length} segments -> ${chunks.length} chunks\n`);
for (const c of chunks) {
  console.log(`[${c.startTime}s - ${c.endTime}s]`);
  console.log(c.text, '\n');
}