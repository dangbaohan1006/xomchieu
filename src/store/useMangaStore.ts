import { create } from 'zustand';

interface MangaState {
    currentPage: number;
    totalPages: number;
    chapterId: string;

    setCurrentPage: (page: number) => void;
    setTotalPages: (total: number) => void;
    setChapterId: (id: string) => void;
}

export const useMangaStore = create<MangaState>((set) => ({
    currentPage: 1,
    totalPages: 0,
    chapterId: '',

    setCurrentPage: (currentPage) => set({ currentPage }),
    setTotalPages: (totalPages) => set({ totalPages }),
    setChapterId: (chapterId) => set({ chapterId }),
}));
