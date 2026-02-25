import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { VectorSearchService } from '@/lib/services/VectorSearchService';

export const runtime = 'edge';

/**
 * AI Recommendation Engine API
 * 1. Fetches user's watch history
 * 2. Extracts interests (genres)
 * 3. Builds a User Interest Vector
 * 4. Queries Vector DB for similar content
 */
export async function GET(req: NextRequest) {
    try {
        // In a real scenario, we'd get the user from auth session
        // For this API, we can either pass user_id or use the active session
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch recent watch progress (limit to last 20 items for profile building)
        const { data: history, error: historyError } = await supabase
            .from('watch_progress')
            .select('metadata')
            .eq('user_id', user.id)
            .order('last_watched_at', { ascending: false })
            .limit(20);

        if (historyError) throw historyError;

        if (!history || history.length === 0) {
            return NextResponse.json({
                recommendations: [],
                message: 'Chưa có lịch sử xem để đề xuất.'
            });
        }

        // 2. Extract Genres & Titles for Interest Snapshot
        const genres = new Set<string>();
        const titles: string[] = [];

        history.forEach((item: any) => {
            const meta = item.metadata;
            if (meta.genres) {
                meta.genres.forEach((g: string) => genres.add(g));
            }
            if (meta.title) titles.push(meta.title);
        });

        // 3. Construct Interest Probe
        const interestProfile = `Người dùng thích các thể loại: ${Array.from(genres).join(', ')}. 
        Đã xem gần đây: ${titles.slice(0, 5).join(', ')}. 
        Hãy tìm nội dung tương tự về phong cách và chủ đề.`;

        // 4. Generate User Vector
        const userVector = await VectorSearchService.generateEmbedding(interestProfile);

        // 5. Query Vector DB (Supabase HNSW)
        const recommendations = await VectorSearchService.findSimilar(userVector, 12);

        return NextResponse.json({
            recommendations: recommendations || [],
            profileUsed: interestProfile
        });

    } catch (error: any) {
        console.error('[Recommendation API Error]', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
