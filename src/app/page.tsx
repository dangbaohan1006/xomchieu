'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { MediaType, IMediaMetadata } from '@/types/media';
import { Film, Tv, Book, Play, LogOut, Search, Bell, Loader2, Sparkles } from 'lucide-react';
import { MovieCard } from '@/components/ui/MovieCard';

// Nâng cấp fetcher để bắt các HTTP Error Response
const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  // Nếu status không phải 2xx, ép văng lỗi để SWR chuyển vào biến 'error'
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch data');
  }

  return data;
};

const RecommendationSection = () => {
  const { data, isLoading } = useSWR('/api/recommend', fetcher);
  const items = data?.recommendations || [];

  if (isLoading || items.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          Dành Riêng Cho Bạn
        </h3>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {items.map((item: any) => (
          <div key={item.media_id} className="w-48 flex-shrink-0">
            <MovieCard media={{
              id: item.media_id,
              title: item.title,
              posterPath: item.metadata?.posterPath || `https://image.tmdb.org/t/p/w500/${item.poster_path}`, // Fallback
              type: 'movie',
              releaseDate: item.metadata?.releaseDate
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<MediaType>('movie');

  const { data: mediaItems, error, isLoading } = useSWR<IMediaMetadata[]>(
    user ? `/api/proxy?type=${activeTab}&action=trending` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        <AuthForm />
      </main>
    );
  }

  const heroItem = mediaItems?.[0];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-accent selection:text-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-black/60 backdrop-blur-md border-b border-white/5 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-black text-accent tracking-tighter uppercase italic">
            Xóm Chiếu
          </h1>
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setActiveTab('movie')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'movie' ? 'text-accent' : 'text-zinc-500 hover:text-white'}`}
            >
              <Film className="w-4 h-4" /> PHIM
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'tv' ? 'text-accent' : 'text-zinc-500 hover:text-white'}`}
            >
              <Tv className="w-4 h-4" /> TV SHOW
            </button>
            <button
              onClick={() => setActiveTab('anime')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'anime' ? 'text-accent' : 'text-zinc-500 hover:text-white'}`}
            >
              <Play className="w-4 h-4" /> ANIME
            </button>
            <button
              onClick={() => setActiveTab('manga')}
              className={`flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'manga' ? 'text-accent' : 'text-zinc-500 hover:text-white'}`}
            >
              <Book className="w-4 h-4" /> MANGA
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors group"
          >
            <span className="text-xs font-bold hidden sm:inline">RỜI XÓM</span>
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Featured Hero Section */}
      <section className="relative h-[80vh] w-full pt-20">
        <div className="absolute inset-0">
          <img
            src={heroItem?.posterPath || `https://picsum.photos/seed/${activeTab}hero/1920/1080`}
            className="w-full h-full object-cover opacity-40"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative h-full container mx-auto px-8 flex flex-col justify-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/20 rounded-full text-accent text-[10px] font-bold tracking-widest uppercase mb-6 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Đang Thịnh Hành
          </div>
          <h2 className="text-6xl md:text-8xl font-black mb-6 leading-tight tracking-tighter">
            {heroItem?.title || 'Đang Tải...'} <br /> <span className="text-accent italic">Xóm Chiếu</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl leading-relaxed">
            {heroItem?.description || 'Khám phá những trải nghiệm điện ảnh đỉnh cao, bộ manga kinh điển và những thước phim anime rực rỡ sắc màu ngay trong lòng Xóm Chiếu.'}
          </p>
          <div className="flex items-center gap-4">
            <button className="px-8 py-4 bg-accent text-black font-black rounded-lg hover:scale-105 transition-transform flex items-center gap-3">
              <Play className="w-5 h-5 fill-current" /> XEM NGAY
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-lg border border-white/10 hover:bg-white/20 transition-all">
              THÔNG TIN
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container mx-auto px-8 pb-20 -mt-20 relative z-10 space-y-20">
        {user && activeTab === 'movie' && (
          <RecommendationSection />
        )}

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full"></div>
              {activeTab === 'movie' ? 'Phim Mới Cập Nhật' :
                activeTab === 'tv' ? 'TV Show Nổi Bật' :
                  activeTab === 'anime' ? 'Anime Mùa Mới' : 'Manga Đang Hot'}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
              <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs">Đang tải dữ liệu thực...</p>
            </div>
          ) : (
            <DashboardGrid type={activeTab} items={mediaItems || []} />
          )}
        </div>
      </section>
    </main>
  );
}
