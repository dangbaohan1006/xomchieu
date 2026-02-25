import { create } from 'zustand';

interface SubtitleSettings {
    fontSize: number;
    color: string;
    backgroundColor: string;
    fontFamily: string;
}

interface SubtitleState {
    subtitleSettings: SubtitleSettings;
    setSubtitleSettings: (settings: Partial<SubtitleSettings>) => void;
}

export const useSubtitleStore = create<SubtitleState>((set) => ({
    subtitleSettings: {
        fontSize: 24,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: 'Inter',
    },

    setSubtitleSettings: (settings) => set((state) => ({
        subtitleSettings: { ...state.subtitleSettings, ...settings },
    })),
}));
