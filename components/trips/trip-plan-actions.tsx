"use client";

import React from "react";
import { Heart, Share2, Mail, Download } from "lucide-react";

interface TripPlanActionsProps {
  tripTitle: string;
  destination: string;
}

export function TripPlanActions({ tripTitle, destination }: TripPlanActionsProps) {
  const handleDownload = () => window.print();
  
  const handleMail = () => {
    const subject = encodeURIComponent(`My Trip to ${destination}`);
    const body = encodeURIComponent(`Check out my trip plan for ${destination}: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tripTitle,
          text: `Check out my trip plan for ${destination}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(`${tripTitle} - ${window.location.href}`)}`, "_blank");
    }
  };

  return (
    <div className="absolute top-8 right-8 flex items-center gap-3 print:hidden">
      <button 
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95 group"
        title="Like trip"
      >
        <Heart className="w-4 h-4 group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
      </button>
      <button 
        onClick={handleShare}
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95"
        title="Share trip"
      >
        <Share2 className="w-4 h-4" />
      </button>
      <button 
        onClick={handleMail}
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95"
        title="Email trip"
      >
        <Mail className="w-4 h-4" />
      </button>
      <button 
        onClick={handleDownload}
        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95"
        title="Export PDF"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}
