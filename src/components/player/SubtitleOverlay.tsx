'use client';

import { useVideoPlaybackStore } from '@/store/useVideoPlaybackStore';
import { useSubtitleStore } from '@/store/useSubtitleStore';

export const SubtitleOverlay = () => {
    // Subscribe specifically to subtitleSettings - only re-renders when settings change
    const subtitleSettings = useSubtitleStore((state) => state.subtitleSettings);

    // Subscribe specifically to currentTime - re-renders every time update
    const currentTime = useVideoPlaybackStore((state) => state.currentTime);

    // In a real app, you would filter subtitles based on currentTime here
    const currentSubtitle = "Sample subtitle at " + Math.floor(currentTime) + "s";

    return (
        <div className="pointer-events-none absolute bottom-[15%] left-0 right-0 flex justify-center px-10 text-center">
            <span
                style={{
                    fontSize: `${subtitleSettings.fontSize}px`,
                    color: subtitleSettings.color,
                    backgroundColor: subtitleSettings.backgroundColor,
                    fontFamily: subtitleSettings.fontFamily,
                    padding: '2px 8px',
                    borderRadius: '4px',
                }}
            >
                {currentSubtitle}
            </span>
        </div>
    );
};
