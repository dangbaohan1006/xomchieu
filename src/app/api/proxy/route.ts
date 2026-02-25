export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { MediaFactory } from '@/lib/providers/MediaFactory';
import { MediaType } from '@/types/media';

/**
 * BFF Proxy API for Xóm Chiếu
 * Handles Metadata, Video Streams, and Manga Pages
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as MediaType;
    const id = searchParams.get('id');
    const action = searchParams.get('action') || 'metadata';

    if (!type || !id) {
        return NextResponse.json({ error: 'Missing type or id' }, { status: 400 });
    }

    try {
        const provider = MediaFactory.getProvider(type);

        // Metadata handling (Shared across all providers via IBaseProvider)
        if (action === 'metadata') {
            const data = await provider.fetchMetadata(id);
            return NextResponse.json(data, {
                headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
            });
        }

        // specialized handling based on ISP-compliant interfaces
        if (action === 'stream') {
            const season = searchParams.get('season') || undefined;
            const episode = searchParams.get('episode') || undefined;

            if (type === 'manga') {
                return NextResponse.json({ error: 'Manga does not support streaming' }, { status: 400 });
            }

            const videoProvider = MediaFactory.getVideoProvider(type as any);
            const data = await videoProvider.fetchStream(id, episode, season);
            return NextResponse.json(data);
        }

        if (action === 'pages') {
            const chapterId = searchParams.get('chapterId');
            if (!chapterId) {
                return NextResponse.json({ error: 'Missing chapterId' }, { status: 400 });
            }

            if (type !== 'manga') {
                return NextResponse.json({ error: 'Only manga supports pages' }, { status: 400 });
            }

            const mangaProvider = MediaFactory.getMangaProvider();
            const data = await mangaProvider.fetchPages(id, chapterId);
            return NextResponse.json(data);
        }

        if (action === 'trending') {
            const data = await provider.fetchTrending(type);
            return NextResponse.json(data, {
                headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error(`[Proxy Error] ${error.message}`);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error', fallback: true },
            { status: 500 }
        );
    }
}
