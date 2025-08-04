import type { LongTermMemory } from '../types';
import { MAX_LONG_TERM_MEMORIES } from '../constants';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


export class VectorDB {
    private memories: LongTermMemory[] = [];

    public addMemory(content: string, timestamp: number, embedding: number[]): void {
        this.memories.push({ content, timestamp, embedding });

        // Enforce memory limit
        if (this.memories.length > MAX_LONG_TERM_MEMORIES) {
            this.memories.shift(); // Remove the oldest memory
        }
    }

    public search(queryVector: number[], topK: number): LongTermMemory[] {
        if (this.memories.length === 0) {
            return [];
        }

        const scoredMemories = this.memories.map(memory => ({
            ...memory,
            similarity: cosineSimilarity(queryVector, memory.embedding),
        }));

        scoredMemories.sort((a, b) => b.similarity - a.similarity);

        return scoredMemories.slice(0, topK);
    }
    
    public loadMemories(memories: LongTermMemory[]) {
        this.memories = memories;
    }
}
