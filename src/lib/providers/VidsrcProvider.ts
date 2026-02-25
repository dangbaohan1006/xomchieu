import { IVideoProvider } from './IContentProvider';
import { IMediaMetadata, IVideoStream } from '@/types/media';
import { TMDBService } from '../services/TMDBService';

export class VidsrcProvider implements IVideoProvider {
    name = 'Vidsrc';

    async fetchMetadata(id: string): Promise<IMediaMetadata> {
        // Try movie first, then tv if it fails or returns suboptimal results
        try {
            return await TMDBService.fetchMetadata(id, 'movie');
        } catch {
            try {
                return await TMDBService.fetchMetadata(id, 'tv');
            } catch {
                return {
                    id,
                    title: `Media ${id}`,
                    type: 'movie',
                };
            }
        }
    }

    async fetchStream(id: string, episode?: string, season?: string): Promise<IVideoStream[]> {
        try {
            // Sử dụng link nhúng (embed) mặc định của Vidsrc
            const embedUrl = season && episode
                ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
                : `https://vidsrc.to/embed/movie/${id}`;

            return [
                {
                    url: embedUrl,
                    quality: 'iframe', // Đánh dấu đây là iframe thay vì m3u8
                }
            ];
        } catch (error) {
            console.error('[Vidsrc Error]', error);
            throw error;
        }
    }

    async fetchTrending(type?: string): Promise<IMediaMetadata[]> {
        return await TMDBService.fetchTrending(type === 'tv' ? 'tv' : 'movie');
    }
}
