'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface SyncMetadata {
    title?: string;
    posterPath?: string;
    season?: string;
    episode?: string;
    chapter?: string;
    genres?: string[];
}

export const useWatchSync = (
    mediaId: string,
    mediaType: 'movie' | 'tv' | 'anime' | 'manga',
    progress: number, // currentTime (giây) hoặc pageNumber
    metadataSnapshot: SyncMetadata = {}
) => {
    const { user } = useAuth();
    const lastSyncTime = useRef<number>(0);
    const SYNC_INTERVAL = 10000; // Throttling: 10 giây mới sync 1 lần

    useEffect(() => {
        if (!user || !mediaId || progress <= 0) return;

        const now = Date.now();

        // Thuật toán Throttling: Bỏ qua các lần render nếu chưa đủ 10 giây
        if (now - lastSyncTime.current >= SYNC_INTERVAL) {
            const syncProgress = async () => {
                try {
                    // Fire-and-Forget: Gọi Upsert xuống CSDL bằng Supabase Client (RLS được bảo vệ)
                    const { error } = await supabase
                        .from('watch_progress')
                        .upsert({
                            user_id: user.id,
                            media_id: mediaId,
                            media_type: mediaType,
                            progress: progress,
                            metadata: metadataSnapshot,
                            last_watched_at: new Date().toISOString(),
                        }, { onConflict: 'user_id, media_id' });

                    if (error) throw error;

                    // Cập nhật timestamp lần sync cuối
                    lastSyncTime.current = now;
                } catch (error) {
                    console.error('[Progress Sync Error]', error);
                }
            };

            syncProgress();
        }
    }, [progress, mediaId, mediaType, user, metadataSnapshot]);
};