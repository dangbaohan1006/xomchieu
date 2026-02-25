import { IMediaMetadata } from '@/types/media';

export class TMDBService {
    private static apiBase = 'https://api.themoviedb.org/3';
    private static apiKey = process.env.TMDB_API_KEY;
    private static token = process.env.TMDB_READ_ACCESS_TOKEN;

    private static getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json;charset=utf-8'
        };
    }

    static async fetchTrending(type: 'movie' | 'tv'): Promise<IMediaMetadata[]> {
        if (!this.token) {
            console.warn('[TMDB] Missing Read Access Token, falling back to empty list');
            return [];
        }

        const res = await fetch(`${this.apiBase}/trending/${type}/day?language=vi-VN`, {
            headers: this.getHeaders()
        });

        if (!res.ok) throw new Error(`TMDB Trending Fetch Failed: ${res.statusText}`);

        const { results } = await res.json();

        return results.map((item: any) => ({
            id: item.id.toString(),
            title: item.title || item.name,
            description: item.overview,
            posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
            backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
            rating: item.vote_average,
            releaseDate: item.release_date || item.first_air_date,
            type: type
        }));
    }

    static async fetchMetadata(id: string, type: 'movie' | 'tv'): Promise<IMediaMetadata> {
        const res = await fetch(`${this.apiBase}/${type}/${id}?language=vi-VN`, {
            headers: this.getHeaders()
        });

        if (!res.ok) throw new Error(`TMDB Metadata Fetch Failed: ${res.statusText}`);

        const data = await res.json();

        return {
            id: data.id.toString(),
            title: data.title || data.name,
            description: data.overview,
            posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : undefined,
            backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : undefined,
            rating: data.vote_average,
            releaseDate: data.release_date || data.first_air_date,
            type: type,
            genres: data.genres?.map((g: any) => g.name)
        };
    }
}
