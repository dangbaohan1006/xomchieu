import { IMangaProvider } from './IContentProvider';
import { IMediaMetadata, IMangaPage } from '@/types/media';

export class MangaDexProvider implements IMangaProvider {
    name = 'MangaDex';
    private apiBase = 'https://api.mangadex.org';

    private getProxyUrl(url: string) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(url)}`;
    }

    async fetchMetadata(id: string): Promise<IMediaMetadata> {
        const [mangaRes, chaptersRes] = await Promise.all([
            fetch(`${this.apiBase}/manga/${id}?includes[]=cover_art`),
            fetch(`${this.apiBase}/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=100`)
        ]);

        if (!mangaRes.ok || !chaptersRes.ok) throw new Error('MangaDex Fetch Failed');

        const { data: mangaData } = await mangaRes.json();
        const { data: chaptersData } = await chaptersRes.json();

        const attributes = mangaData.attributes;
        const fileName = mangaData.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
        const rawCoverUrl = fileName ? `https://uploads.mangadex.org/covers/${id}/${fileName}` : undefined;

        return {
            id,
            title: attributes.title.en || attributes.title.ja || Object.values(attributes.title)[0],
            description: attributes.description.en,
            posterPath: rawCoverUrl ? this.getProxyUrl(rawCoverUrl) : undefined,
            type: 'manga',
            chapters: chaptersData.map((ch: any) => ({
                id: ch.id,
                number: ch.attributes.chapter,
                title: ch.attributes.title,
                volume: ch.attributes.volume
            }))
        };
    }

    async fetchPages(id: string, chapterId: string): Promise<IMangaPage[]> {
        const res = await fetch(`${this.apiBase}/at-home/server/${chapterId}`);
        if (!res.ok) throw new Error('MangaDex Pages Fetch Failed');

        const { baseUrl, chapter } = await res.json();
        const hash = chapter.hash;

        return chapter.data.map((file: string, index: number) => ({
            url: this.getProxyUrl(`${baseUrl}/data/${hash}/${file}`),
            pageNumber: index + 1,
        }));
    }

    async fetchTrending(type?: string): Promise<IMediaMetadata[]> {
        const res = await fetch(`${this.apiBase}/manga?limit=20&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe`);
        if (!res.ok) throw new Error('MangaDex Trending Fetch Failed');

        const { data } = await res.json();

        return data.map((item: any) => {
            const attributes = item.attributes;
            const fileName = item.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
            const rawCoverUrl = fileName ? `https://uploads.mangadex.org/covers/${item.id}/${fileName}.256.jpg` : undefined;

            return {
                id: item.id,
                title: attributes.title.en || attributes.title.ja || Object.values(attributes.title)[0],
                posterPath: rawCoverUrl ? this.getProxyUrl(rawCoverUrl) : undefined,
                type: 'manga' as const,
                rating: 8.0,
                releaseDate: attributes.year?.toString()
            };
        });
    }
}
