'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMangaStore } from '@/store/useMangaStore';
import { useWatchSync } from '@/hooks/useWatchSync';
import { IMediaMetadata } from '@/types/media';

interface MangaReaderProps {
    pages: string[]; // List of page URLs
    mediaId?: string;
    mediaType?: 'manga';
    metadata?: IMediaMetadata;
    chapter?: string;
}

export const MangaReader = ({ pages, mediaId, mediaType, metadata, chapter }: MangaReaderProps) => {
    const { currentPage, setCurrentPage, setTotalPages } = useMangaStore();
    const readerRef = useRef<HTMLDivElement>(null);

    // Watch Progress Sync
    useWatchSync(
        mediaId || '',
        'manga',
        currentPage,
        {
            title: metadata?.title,
            posterPath: metadata?.posterPath,
            genres: metadata?.genres,
            chapter
        }
    );

    // Configurable window size
    const WINDOW_BEFORE = 2;
    const WINDOW_AFTER = 3;

    useEffect(() => {
        setTotalPages(pages.length);
    }, [pages, setTotalPages]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const pageIndex = parseInt(entry.target.getAttribute('data-page') || '0');
                        setCurrentPage(pageIndex + 1);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = readerRef.current?.querySelectorAll('[data-page-container]');
        elements?.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [pages.length, setCurrentPage]);

    // Determine which pages are within the sliding window
    const isVisible = (index: number) => {
        const pageNum = index + 1;
        return pageNum >= currentPage - WINDOW_BEFORE && pageNum <= currentPage + WINDOW_AFTER;
    };

    return (
        <div ref={readerRef} className="flex flex-col items-center gap-4 bg-black p-4 overflow-y-auto h-screen">
            {pages.map((url, index) => {
                const showPage = isVisible(index);

                return (
                    <div
                        key={index}
                        data-page-container
                        data-page={index}
                        className="relative min-h-[600px] w-full max-w-2xl bg-zinc-900 flex items-center justify-center rounded-lg shadow-2xl transition-colors duration-500"
                        style={{ height: 'auto' }} // In a real world, we might want to store/estimate height
                    >
                        {showPage ? (
                            <img
                                src={url}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto"
                                loading="lazy"
                            // We use onLoad or similar if we want to precisely lock height after first load
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-20 px-4 text-center">
                                <div className="text-zinc-700 text-sm">
                                    Page {index + 1} (Virtualised)
                                </div>
                                <div className="text-zinc-800 text-xs">
                                    Scroll to load
                                </div>
                                {/* If we want to maintain height precisely when unmounting, we should capture it */}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Floating Progress Indicator */}
            <div className="fixed bottom-8 right-8 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl z-50">
                <span className="text-accent font-bold">{currentPage}</span>
                <span className="text-muted mx-1">/</span>
                <span className="text-white">{pages.length}</span>
            </div>
        </div>
    );
};
