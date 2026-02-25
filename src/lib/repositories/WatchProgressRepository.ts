import { BaseRepository } from './BaseRepository';

export interface IWatchProgress {
    user_id: string;
    media_id: string;
    progress: number; // in seconds or percentage
    last_watched_at: string;
    media_type: string;
    metadata?: Record<string, any>;
}

export class WatchProgressRepository extends BaseRepository {
    async upsertProgress(progress: IWatchProgress) {
        const { data, error } = await this.client
            .from('watch_progress')
            .upsert(progress, { onConflict: 'user_id, media_id' });

        if (error) throw error;
        return data;
    }

    async getProgress(userId: string, mediaId: string) {
        const { data, error } = await this.client
            .from('watch_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('media_id', mediaId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
        return data;
    }

    async getUserProgress(userId: string) {
        const { data, error } = await this.client
            .from('watch_progress')
            .select('*')
            .eq('user_id', userId)
            .order('last_watched_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
