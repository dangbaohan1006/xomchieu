import { supabase } from '../supabase';

export class VectorSearchService {
    private static OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    /**
     * Converts text (tags/genres) into a 1536-dimensional vector using OpenAI
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        if (!this.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not configured');
        }

        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI Embedding Error: ${error.error.message}`);
        }

        const result = await response.json();
        return result.data[0].embedding;
    }

    /**
     * Executes a KNN similarity search using the cosine distance operator (<=>)
     */
    static async findSimilar(embedding: number[], limit: number = 10) {
        // We use a Supabase RPC call which corresponds to our migration logic
        // RPC name: match_media
        const { data, error } = await supabase.rpc('match_media', {
            query_embedding: embedding,
            match_threshold: 0.5, // Adjust based on precision needs
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
