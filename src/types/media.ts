export type MediaType = 'movie' | 'tv' | 'anime' | 'manga';

export interface IMediaMetadata {
  id: string;
  title: string;
  description?: string;
  posterPath?: string;
  backdropPath?: string;
  rating?: number;
  releaseDate?: string;
  genres?: string[];
  type: MediaType;
  episodes?: IEpisode[];
  chapters?: IChapter[];
}

export interface IChapter {
  id: string;
  number: string;
  title?: string;
  volume?: string;
}

export interface IEpisode {
  id: string;
  number: number;
  title?: string;
  description?: string;
  thumbnailPath?: string;
}

export interface IVideoStream {
  url: string;
  quality: string;
  headers?: Record<string, string>;
  subtitles?: ISubtitle[];
}

export interface ISubtitle {
  url: string;
  lang: string;
  label: string;
}

export interface IMangaPage {
  url: string;
  pageNumber: number;
}
