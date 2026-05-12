"use client";

import React, { useState } from "react";
import { ChevronRight, Pencil, MessageSquare, Save, Check } from "lucide-react";

interface TripAiSidebarProps {
  tripId: string;
  destination: string;
}

export function TripAiSidebar({ tripId, destination }: TripAiSidebarProps) {
  const [input, setInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleTweak = () => {
    // Logic for AI tweaking existing trip
    alert("AI Tweak: " + input);
    setInput("");
  };

  return (
    <div className="w-full lg:w-[380px] lg:sticky lg:top-10 space-y-6 print:hidden">
      <div className="bg-[#0B1F33]/80 backdrop-blur-md border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
        {/* Panel Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A59] to-[#FFB36B] flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <div className="text-sm font-bold text-white">Memento</div>
              <div className="text-[10px] text-white/50">Your travel companion</div>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#FF7A59]">
            AI Editor
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[400px]">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">M</div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed text-white/90">
              Welcome back! I&apos;ve got your {destination} plan right here. What would you like to refine?
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">M</div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed text-white/90 italic">
              Try: &quot;Add more local food spots&quot; or &quot;Make Day 2 more adventurous&quot;.
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTweak()}
              placeholder="Ask Memento to tweak this trip..."
              className="w-full bg-[#0B1F33] border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/30 transition-all"
            />
            <button 
              onClick={handleTweak}
              className="absolute right-2 top-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-[#0B1F33]/80 backdrop-blur-md border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-5">
        <div className="inline-block px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">Actions</div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my trip to ${destination}`)}`, "_blank")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold bg-[#25D366] text-white rounded-2xl hover:bg-[#20bd5a] transition-all shadow-lg active:scale-95"
          >
            <MessageSquare className="w-5 h-5" /> WhatsApp
          </button>
        </div>
        
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
        >
          <Pencil className="w-4 h-4" /> Edit Details
        </button>
      </div>
    </div>
  );
}
