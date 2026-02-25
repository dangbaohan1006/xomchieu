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
        // ... (Extraction logic remains same)
        /**
         * PREVENT AD-IFRAMES: Direct HLS Extraction Logic
         * Instead of returning the embed URL, we crawl and resolve the source.
         */

        try {
            const embedUrl = season && episode
                ? `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
                : `https://vidsrc.to/embed/movie/${id}`;

            // Step 1: Fetch the embed page
            const response = await fetch(embedUrl, {
                headers: { 'Referer': 'https://vidsrc.to/' }
            });
            const html = await response.text();

            /**
             * Step 2: Extract encrypted source
             * Typically found in data-id or script tags
             * Example logic (simulated for architectural clarity):
             */
            const sourceMatch = html.match(/data-id="([^"]+)"/);
            if (!sourceMatch) throw new Error('Could not extract source ID from Vidsrc');

            // Step 3: Decrypt and fetch direct m3u8 (Reverse-engineering required here)
            // In a real implementation, we would call a internal resolver or use a known cipher
            const directHlsUrl = `https://vidsrc.to/api/source/resolve/${sourceMatch[1]}`;

            return [
                {
                    url: directHlsUrl, // This should be a .m3u8 ideally
                    quality: 'auto',
                }
            ];
        } catch (error) {
            console.error('[Vidsrc Extraction Failed]', error);
            throw error;
        }
    }

    async fetchTrending(type?: string): Promise<IMediaMetadata[]> {
        return await TMDBService.fetchTrending(type === 'tv' ? 'tv' : 'movie');
    }
}
