'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { IMediaMetadata, MediaType, IMangaPage } from '@/types/media';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { MangaReader } from '@/components/player/MangaReader';
import { ChevronLeft, Star, Calendar, Play, List, Book, Loader2 } from 'lucide-react';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MediaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type as MediaType;
    const id = params.id as string;

    const [selectedEpisode, setSelectedEpisode] = useState<string | undefined>(undefined);
    const [selectedChapter, setSelectedChapter] = useState<string | undefined>(undefined);
    const [selectedSeason, setSelectedSeason] = useState<string | undefined>('1');

    // 1. Fetch Basic Metadata (Common)
    const { data: media, error: metaError, isLoading: isMetaLoading } = useSWR<IMediaMetadata>(
        `/api/proxy?type=${type}&id=${id}&action=metadata`,
        fetcher,
        { revalidateOnFocus: false }
    );

    // 2. Fetch Manga Pages (Manga Only)
    const { data: mangaPages, error: pagesError, isLoading: isPagesLoading } = useSWR<IMangaPage[]>(
        type === 'manga' && selectedChapter
            ? `/api/proxy?type=manga&id=${id}&action=pages&chapterId=${selectedChapter}`
            : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    // Auto-select first episode/chapter
    useEffect(() => {
        if (media) {
            if (type === 'manga' && media.chapters && media.chapters.length > 0 && !selectedChapter) {
                setSelectedChapter(media.chapters[0].id);
            } else if (type !== 'manga' && media.episodes && media.episodes.length > 0 && !selectedEpisode) {
                setSelectedEpisode(media.episodes[0].id);
            }
        }
    }, [media, type, selectedChapter, selectedEpisode]);

    if (isMetaLoading) {
        return (
            <div className="h-screen w-full bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
        );
    }

    if (metaError || !media) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Không tìm thấy nội dung</h2>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const isVideo = type !== 'manga';
    const pageUrls = mangaPages?.map(p => p.url) || [];

    return (
        <main className="min-h-screen bg-black text-white pb-20">
            {/* Hero Backdrop */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={media.backdropPath || media.posterPath || `https://picsum.photos/seed/${id}/1920/1080`}
                        className="w-full h-full object-cover opacity-30 blur-sm scale-110"
                        alt="Backdrop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                </div>

                <div className="absolute top-8 left-8 z-50">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-8 -mt-60 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Side: Poster & Stats */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-accent/20 border border-white/10">
                            <Image
                                src={media.posterPath || `https://picsum.photos/seed/${id}poster/600/900`}
                                alt={media.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Đánh giá</span>
                                <div className="flex items-center gap-1.5 text-accent font-black text-lg">
                                    <Star className="w-5 h-5 fill-current" />
                                    {media.rating?.toFixed(1) || 'N/A'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Năm</span>
                                <div className="flex items-center gap-1.5 text-white font-bold">
                                    <Calendar className="w-5 h-5" />
                                    {media.releaseDate?.split('-')[0] || 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Info & Player */}
                    <div className="flex-grow space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                {media.genres?.map(genre => (
                                    <span key={genre} className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-[10px] font-bold tracking-widest uppercase">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase italic">
                                {media.title}
                            </h1>
                            <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl">
                                {media.description || 'Chưa có mô tả cho nội dung này. Xóm Chiếu sẽ cập nhật sớm nhất có thể.'}
                            </p>
                        </div>

                        {/* Player Area */}
                        <div className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-md min-h-[500px] flex flex-col">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {isVideo ? <Play className="w-5 h-5 text-accent fill-current" /> : <Book className="w-5 h-5 text-accent" />}
                                    <span className="font-bold tracking-tight uppercase italic underline decoration-accent/30 decoration-2 underline-offset-4">
                                        ĐANG {isVideo ? 'PHÁT' : 'ĐỌC'}: {media.title}
                                        {isVideo && selectedEpisode && ` - Tập ${media.episodes?.find(e => e.id === selectedEpisode)?.number || ''}`}
                                        {!isVideo && selectedChapter && ` - Chương ${media.chapters?.find(c => c.id === selectedChapter)?.number || ''}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">LIVE CONTENT</span>
                                </div>
                            </div>

                            <div className="flex-grow relative">
                                {isVideo ? (
                                    <VideoPlayer
                                        mediaId={id}
                                        type={type}
                                        season={selectedSeason}
                                        episode={selectedEpisode}
                                        metadata={media}
                                    />
                                ) : (
                                    isPagesLoading ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-accent animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="h-[80vh]">
                                            <MangaReader
                                                pages={pageUrls}
                                                mediaId={id}
                                                mediaType="manga"
                                                metadata={media}
                                                chapter={selectedChapter}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Episode/Chapter Selector */}
                        {(isVideo ? media.episodes : media.chapters) && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <List className="w-6 h-6 text-accent" />
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                                        {isVideo ? 'Danh Sách Tập' : 'Danh Sách Chương'}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                    {isVideo ? (
                                        media.episodes?.map((ep) => (
                                            <button
                                                key={ep.id}
                                                onClick={() => setSelectedEpisode(ep.id)}
                                                className={`py-3 px-4 rounded-xl border font-bold transition-all text-sm ${selectedEpisode === ep.id
                                                    ? 'bg-accent text-black border-accent'
                                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                Tập {ep.number}
                                            </button>
                                        ))
                                    ) : (
                                        media.chapters?.map((ch) => (
                                            <button
                                                key={ch.id}
                                                onClick={() => setSelectedChapter(ch.id)}
                                                className={`py-3 px-4 rounded-xl border font-bold transition-all text-sm ${selectedChapter === ch.id
                                                    ? 'bg-accent text-black border-accent'
                                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                Ch. {ch.number}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
