import { IVideoProvider } from './IContentProvider';
import { IMediaMetadata, IVideoStream } from '@/types/media';

export class ConsumetProvider implements IVideoProvider {
    name = 'Consumet';
    private apiBase = process.env.CONSUMET_API_URL || 'https://api.consumet.org';

    async fetchMetadata(id: string): Promise<IMediaMetadata> {
        // Using AniList provider for rich metadata
        const res = await fetch(`${this.apiBase}/meta/anilist/info/${id}`);
        if (!res.ok) throw new Error('Consumet Metadata Fetch Failed');

        const data = await res.json();

        return {
            id: data.id,
            title: data.title.english || data.title.romaji || data.title.native,
            description: data.description,
            posterPath: data.image,
            type: 'anime',
            rating: data.rating / 10,
            releaseDate: data.releaseDate,
            episodes: data.episodes?.map((ep: any) => ({
                id: ep.id,
                number: ep.number,
                title: ep.title,
            })),
        };
    }

    async fetchStream(id: string, episodeId?: string): Promise<IVideoStream[]> {
        if (!episodeId) throw new Error('Episode ID is required for Anime stream');

        // Using AniList watch endpoint which orchestrates extraction
        const res = await fetch(`${this.apiBase}/meta/anilist/watch/${episodeId}`);
        if (!res.ok) throw new Error('Consumet Stream Fetch Failed');

        const { sources, subtitles } = await res.json();

        return sources.map((source: any) => ({
            url: source.url,
            quality: source.quality,
            subtitles: subtitles?.map((sub: any) => ({
                url: sub.url,
                lang: sub.lang,
                label: sub.lang,
            })),
        }));
    }

    async fetchTrending(type?: string): Promise<IMediaMetadata[]> {
        const res = await fetch(`${this.apiBase}/meta/anilist/trending`);
        if (!res.ok) throw new Error('Consumet Trending Fetch Failed');

        const { results } = await res.json();

        return results.map((item: any) => ({
            id: item.id,
            title: item.title.english || item.title.romaji || item.title.native,
            posterPath: item.image,
            type: 'anime' as const,
            rating: (item.rating || 80) / 10,
            releaseDate: item.releaseDate
        }));
    }
}
