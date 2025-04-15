
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Mic, MicOff, Camera, CameraOff, PhoneOff, 
  MessageSquare, Users, RefreshCw, Smile
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileVideoCallUIProps {
  callerName: string;
  callerAvatar?: string;
  onEndCall: () => void;
}

export const MobileVideoCallUI: React.FC<MobileVideoCallUIProps> = ({
  callerName,
  callerAvatar,
  onEndCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showMemoji, setShowMemoji] = useState(false);
  const [selectedMemoji, setSelectedMemoji] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const memojiOptions = [
    "😀", "😎", "🤩", "🦄", "🐶", "🦊", "🐱", "🤖", "👽", "👾"
  ];

  // This is a UI mockup, in a real app this would be replaced with actual video streaming
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Main video area */}
      <div className="flex-1 relative">
        {/* Background - would be a real video stream */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
          {showMemoji && selectedMemoji && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl animate-pulse">{selectedMemoji}</div>
            </div>
          )}
        </div>
        
        {/* Small self-view */}
        <div className="absolute bottom-24 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-purple-900" />
        </div>
        
        {/* Call info */}
        <div className="absolute top-10 left-0 right-0 text-center">
          <h2 className="text-xl font-semibold text-white">{callerName}</h2>
          <p className="text-gray-300 text-sm">00:05:32</p>
        </div>
      </div>
      
      {/* Memoji selector panel - slides in from bottom */}
      {showMemoji && (
        <div className="absolute bottom-24 left-0 right-0 bg-gray-900/90 backdrop-blur-md p-4 animate-slide-in rounded-t-2xl">
          <div className="flex flex-wrap justify-center gap-4">
            {memojiOptions.map((emoji) => (
              <button
                key={emoji}
                className={`text-4xl p-2 rounded-full transition-transform ${
                  selectedMemoji === emoji ? 'bg-social-accent/20 scale-125' : ''
                }`}
                onClick={() => setSelectedMemoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="h-24 bg-gray-900/90 backdrop-blur-md flex items-center justify-around px-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 bg-gray-800"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <MicOff className="h-5 w-5 text-red-500" />
          ) : (
            <Mic className="h-5 w-5 text-white" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 bg-gray-800"
          onClick={() => setIsCameraOff(!isCameraOff)}
        >
          {isCameraOff ? (
            <CameraOff className="h-5 w-5 text-red-500" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-12 w-12 bg-gray-800"
          onClick={() => setShowMemoji(!showMemoji)}
        >
          <Smile className="h-5 w-5 text-white" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
          onClick={onEndCall}
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
};
