import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseSingleton {
    private static instance: SupabaseClient;

    private constructor() { }

    public static getInstance(): SupabaseClient {
        if (!SupabaseSingleton.instance) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase URL and Anon Key are required in environment variables.');
            }

            SupabaseSingleton.instance = createClient(supabaseUrl, supabaseKey);
        }

        return SupabaseSingleton.instance;
    }
}

export const supabase = SupabaseSingleton.getInstance();
