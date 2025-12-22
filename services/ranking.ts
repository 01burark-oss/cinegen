import { CandidateShow, MemoryItem } from "../types";

const cosine = (a: number[], b: number[]) => {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB + 1e-6);
};

export function rankShows(
  candidates: CandidateShow[],
  memory: MemoryItem[],
  seedEmbedding: number[]
) {
  return candidates
    .map(c => {
      let score = 0;

      for (const m of memory) {
        const sim = cosine(c.features.embedding, m.features.embedding);
        const boost = m.source === "LONG_TERM" ? 1.0 : 1.3;
        score += sim * m.weight * boost;
      }

      const seedSim = cosine(c.features.embedding, seedEmbedding);
      score = score * 0.35 + seedSim * 0.65;

      return { ...c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
