'use client';

import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { useVideoPlaybackStore } from '@/store/useVideoPlaybackStore';
import { SubtitleOverlay } from './SubtitleOverlay';
import { MediaType, IMediaMetadata } from '@/types/media';
import { Loader2 } from 'lucide-react';
import { useWatchSync } from '@/hooks/useWatchSync';

const ProgressSyncer = ({ mediaId, type, metadata, season, episode }: any) => {
    const currentTime = useVideoPlaybackStore((state) => state.currentTime);

    useWatchSync(
        mediaId || '',
        type,
        currentTime,
        {
            title: metadata?.title,
            posterPath: metadata?.posterPath,
            genres: metadata?.genres,
            season,
            episode
        }
    );

    return null;
};

interface VideoPlayerProps {
    src?: string;
    mediaId?: string;
    type?: MediaType;
    season?: string;
    episode?: string;
    metadata?: IMediaMetadata;
}

export const VideoPlayer = ({ src: initialSrc, mediaId, type, season, episode, metadata }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [streamUrl, setStreamUrl] = useState<string | null>(initialSrc || null);
    const [loading, setLoading] = useState(!initialSrc && !!mediaId);
    const [isIframe, setIsIframe] = useState(false); // Thêm state này

    // Atomic Selectors
    const isPlaying = useVideoPlaybackStore((state) => state.isPlaying);
    const volume = useVideoPlaybackStore((state) => state.volume);
    const isMuted = useVideoPlaybackStore((state) => state.isMuted);
    // currentTime removed from here to prevent re-renders

    // Actions
    const setPlaying = useVideoPlaybackStore((state) => state.setPlaying);
    const setCurrentTime = useVideoPlaybackStore((state) => state.setCurrentTime);
    const setDuration = useVideoPlaybackStore((state) => state.setDuration);

    // Fetch Stream from Proxy if needed
    useEffect(() => {
        if (!initialSrc && mediaId && type) {
            const fetchStream = async () => {
                setLoading(true);
                try {
                    const params = new URLSearchParams({
                        id: mediaId,
                        type: type,
                        action: 'stream',
                        ...(season && { season }),
                        ...(episode && { episode }),
                    });
                    const res = await fetch(`/api/proxy?${params.toString()}`);
                    const data = await res.json();

                    if (data && data[0]?.url) {
                        setStreamUrl(data[0].url);
                        // Nhận diện nếu Provider trả về dạng iframe
                        setIsIframe(data[0].quality === 'iframe');
                    }
                } catch (error) {
                    console.error('[Player Fetch Error]', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStream();
        }
    }, [initialSrc, mediaId, type, season, episode]);

    // HLS Logic
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (isPlaying) video.play().catch(() => setPlaying(false));
            });

            return () => {
                hls.destroy();
                hlsRef.current = null;
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS (Safari)
            video.src = streamUrl;
        } else {
            // Fallback for standard MP4 or direct streams
            video.src = streamUrl;
        }
    }, [streamUrl]);

    // Play/Pause Sync
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(() => setPlaying(false));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, setPlaying]);

    // Volume Sync
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    if (isIframe && streamUrl) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <ProgressSyncer
                    mediaId={mediaId}
                    type={type}
                    metadata={metadata}
                    season={season}
                    episode={episode}
                />
                <iframe
                    src={streamUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    // Sức mạnh nằm ở đây: Chặn toàn bộ popup quảng cáo nhảy tab mới
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black group">
            <ProgressSyncer
                mediaId={mediaId}
                type={type}
                metadata={metadata}
                season={season}
                episode={episode}
            />

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" />
                </div>
            )}

            <video
                ref={videoRef}
                className="h-full w-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onClick={() => setPlaying(!isPlaying)}
                playsInline
            />

            <SubtitleOverlay />

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => setPlaying(!isPlaying)}
                    className="w-12 h-12 flex items-center justify-center bg-accent text-black rounded-full hover:scale-110 transition-transform active:scale-95 shadow-lg shadow-accent/20"
                >
                    {isPlaying ? (
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    ) : (
                        <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
};
