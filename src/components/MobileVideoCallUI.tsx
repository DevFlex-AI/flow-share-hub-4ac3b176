
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Mic, MicOff, Camera, CameraOff, PhoneOff, 
  MessageSquare, Users, RefreshCw, Smile,
  Phone, UserPlus, MoreVertical, Flip
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface MobileVideoCallUIProps {
  callerName: string;
  callerAvatar?: string;
  callerPhone?: string;
  onEndCall: () => void;
}

export const MobileVideoCallUI: React.FC<MobileVideoCallUIProps> = ({
  callerName,
  callerAvatar,
  callerPhone,
  onEndCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showMemoji, setShowMemoji] = useState(false);
  const [selectedMemoji, setSelectedMemoji] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const isMobile = useIsMobile();

  // More memoji options for a better user experience
  const memojiOptions = [
    "😀", "😎", "🤩", "🦄", "🐶", "🦊", "🐱", "🤖", 
    "👽", "👾", "😂", "🥳", "😍", "🤯", "👻", "🧠",
    "🫠", "🥹", "🤑", "😴"
  ];

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle camera
  const toggleCamera = () => {
    setIsCameraOff(!isCameraOff);
    toast.info(isCameraOff ? "Camera turned on" : "Camera turned off", {
      icon: isCameraOff ? "📷" : "🚫",
    });
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone unmuted" : "Microphone muted", {
      icon: isMuted ? "🎙️" : "🔇",
    });
  };

  // Switch camera
  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
    toast.info(`Switched to ${!isFrontCamera ? "front" : "back"} camera`, {
      icon: "🔄"
    });
  };

  // Handle memoji selection
  const handleMemojiSelect = (emoji: string) => {
    setSelectedMemoji(emoji);
    toast.info("Memoji effect applied", {
      icon: emoji
    });
  };

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
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Camera className="h-8 w-8 text-white/50" />
            </div>
          )}
        </div>
        
        {/* Call info */}
        <div className="absolute top-10 left-0 right-0 text-center">
          <h2 className="text-xl font-semibold text-white">{callerName}</h2>
          {callerPhone && (
            <p className="text-gray-300 text-xs">{callerPhone}</p>
          )}
          <p className="text-gray-300 text-sm mt-1">{formatDuration(callDuration)}</p>
        </div>
        
        {/* Call quality indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-1">
          <div className="h-2 w-1 bg-green-500 rounded-sm"></div>
          <div className="h-3 w-1 bg-green-500 rounded-sm"></div>
          <div className="h-4 w-1 bg-green-500 rounded-sm"></div>
        </div>
        
        {/* Additional call controls */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 bg-black/30 backdrop-blur-sm"
            onClick={switchCamera}
          >
            <Flip className="h-4 w-4 text-white" />
          </Button>
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
                  selectedMemoji === emoji ? 'bg-primary/20 scale-125' : ''
                }`}
                onClick={() => handleMemojiSelect(emoji)}
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
          onClick={toggleMute}
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
          onClick={toggleCamera}
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
          onClick={() => {
            onEndCall();
            toast.info("Call ended", {
              description: `Call with ${callerName} ended after ${formatDuration(callDuration)}`,
              icon: "📞"
            });
          }}
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      {/* Action hints */}
      <div className="absolute bottom-28 w-full flex justify-center">
        <div className="text-xs text-white/70 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
          Tap the screen for more options
        </div>
      </div>
    </div>
  );
};
