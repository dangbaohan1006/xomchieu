'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { IMediaMetadata } from '@/types/media';

interface MovieCardProps {
    media: IMediaMetadata;
}

export const MovieCard = ({ media }: MovieCardProps) => {
    return (
        <Link
            href={`/media/${media.type}/${media.id}`}
            className="group relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-accent cursor-pointer block"
        >
            <div className="aspect-[2/3] relative">
                {media.posterPath ? (
                    <Image
                        src={media.posterPath}
                        alt={media.title}
                        fill
                        className="object-cover transition-opacity duration-300 group-hover:opacity-60"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 20vw, 15vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                        No Image
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-accent p-3 text-black">
                        <Play fill="currentColor" size={24} />
                    </div>
                </div>
            </div>

            <div className="p-3">
                <h3 className="truncate font-semibold text-sm">{media.title}</h3>
                <p className="text-xs text-muted mt-1">{media.releaseDate?.split('-')[0] || 'Unknown'}</p>
            </div>
        </Link>
    );
};
