import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export abstract class BaseRepository {
    protected client: SupabaseClient;

    constructor() {
        this.client = supabase;
    }
}
