import { IMediaMetadata, IVideoStream, IMangaPage } from '@/types/media';

export interface IBaseProvider {
    name: string;
    fetchMetadata(id: string): Promise<IMediaMetadata>;
    fetchTrending(type?: string): Promise<IMediaMetadata[]>;
}

export interface IVideoProvider extends IBaseProvider {
    fetchStream(id: string, episode?: string, season?: string): Promise<IVideoStream[]>;
}

export interface IMangaProvider extends IBaseProvider {
    fetchPages(id: string, chapterId: string): Promise<IMangaPage[]>;
}

export type IContentProvider = IVideoProvider | IMangaProvider;
