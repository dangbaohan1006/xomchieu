import { IContentProvider, IVideoProvider, IMangaProvider } from './IContentProvider';
import { VidsrcProvider } from './VidsrcProvider';
import { MangaDexProvider } from './MangaDexProvider';
import { ConsumetProvider } from './ConsumetProvider';
import { MediaType } from '@/types/media';

export class MediaFactory {
    private static providers = {
        vidsrc: new VidsrcProvider(),
        mangadex: new MangaDexProvider(),
        consumet: new ConsumetProvider(),
    };

    static getProvider(type: MediaType): IContentProvider {
        switch (type) {
            case 'manga':
                return this.providers.mangadex;
            case 'anime':
                return this.providers.consumet;
            case 'movie':
            case 'tv':
                return this.providers.vidsrc;
            default:
                throw new Error(`No provider configured for media type: ${type}`);
        }
    }

    static getVideoProvider(type: 'movie' | 'tv' | 'anime'): IVideoProvider {
        const provider = this.getProvider(type);
        if ('fetchStream' in provider) {
            return provider as IVideoProvider;
        }
        throw new Error(`Provider for ${type} does not support video streaming`);
    }

    static getMangaProvider(): IMangaProvider {
        return this.providers.mangadex;
    }
}
