"use client"

import { UserProfile } from "@clerk/nextjs"

export default function ProfilePage() {
  return (
    <div className="flex w-full items-center justify-center py-8">
      {/* We wrap the profile in a glowing, elevated container to make the light theme look intentional and premium */}
      <div className="rounded-[2rem] bg-white p-1 shadow-[0_0_40px_-10px_rgba(56,189,248,0.3)] ring-1 ring-white/50">
        <UserProfile 
          appearance={{
            variables: {
              colorPrimary: "#38BDF8", // Brand Sky Blue
              colorBackground: "#ffffff",
              colorText: "#0B1F33", // Brand Midnight Navy for text
              colorInputBackground: "#f8fafc",
              colorInputText: "#0B1F33",
            },
            elements: {
              card: "shadow-none border-0",
              navbar: "border-r border-gray-100 bg-gray-50/50 rounded-l-[1.75rem]",
              formButtonPrimary: "bg-[#38BDF8] text-white hover:bg-[#38BDF8]/90 shadow-sm",
              profileSectionPrimaryButton: "text-[#38BDF8] hover:bg-[#38BDF8]/10",
              avatarImageActionsUpload: "text-[#38BDF8]",
            }
          }}
        />
      </div>
    </div>
  )
}
