'use client';

import React from 'react';
import { MovieCard } from '../ui/MovieCard';
import { MediaType } from '@/types/media';

interface DashboardGridProps {
    type: MediaType;
    items: any[]; // In a real scenario, this would be IMediaMetadata[]
}

export const DashboardGrid = ({ type, items }: DashboardGridProps) => {
    // Defensive Data Parsing: Đảm bảo items luôn luôn là một mảng
    const safeItems = Array.isArray(items) ? items : [];

    if (safeItems.length === 0) {
        return <div className="text-zinc-500 py-10 text-center w-full">Không có dữ liệu hiển thị.</div>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {safeItems.map((item) => (
                <MovieCard
                    key={item.id}
                    media={item}
                />
            ))}
        </div>
    );
};
