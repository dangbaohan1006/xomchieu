import { supabase } from '../supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class VectorSearchService {
    private static GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    /**
     * Converts text (tags/genres) into a 768-dimensional vector using Gemini
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        if (!this.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        try {
            // Khởi tạo Gemini Client
            const genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);

            // Sử dụng model embedding mới nhất của Google
            const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

            const result = await model.embedContent(text);
            const embedding = result.embedding;

            return embedding.values;
        } catch (error: any) {
            throw new Error(`Gemini Embedding Error: ${error.message}`);
        }
    }

    /**
     * Executes a KNN similarity search using the cosine distance operator (<=>)
     */
    static async findSimilar(embedding: number[], limit: number = 10) {
        // RPC name: match_media
        const { data, error } = await supabase.rpc('match_media', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: limit,
        });

        if (error) {
            console.error('[VectorSearch Error]', error);
            throw error;
        }

        return data;
    }

    /**
     * Stores or updates the embedding for a specific media item
     */
    static async upsertEmbedding(mediaId: string, text: string) {
        const embedding = await this.generateEmbedding(text);

        const { error } = await supabase
            .from('media_embeddings')
            .upsert({
                media_id: mediaId,
                embedding: embedding,
                content_snapshot: text,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'media_id' });

        if (error) {
            console.error('[Upsert Embedding Error]', error);
            throw error;
        }
    }
}