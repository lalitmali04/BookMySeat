import React from 'react';
import { X } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  if (!isOpen) return null;

  // Extract YouTube ID
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const id = videoUrl.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  } else if (videoUrl.includes('youtu.be/')) {
    const id = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            {title} - Official Trailer
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
