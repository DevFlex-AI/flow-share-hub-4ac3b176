
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, PhoneOff, RotateCcw, MessageSquare } from "lucide-react";
import { toast } from 'sonner';

export interface MobileVideoCallUIProps {
  callerName: string;
  callerAvatar?: string;
  callerPhone?: string;
  onEndCall: () => void;
}

export function MobileVideoCallUI({ callerName, callerAvatar, callerPhone, onEndCall }: MobileVideoCallUIProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [cameraFlipped, setCameraFlipped] = useState(false);
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone on" : "Microphone off", {
      icon: isMuted ? "🔊" : "🔇",
      position: "top-center",
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    toast.info(isVideoOff ? "Camera on" : "Camera off", {
      icon: isVideoOff ? "📹" : "🚫",
      position: "top-center",
    });
  };

  const flipCamera = () => {
    setCameraFlipped(!cameraFlipped);
    toast.info("Camera flipped", {
      icon: "🔄",
      position: "top-center",
    });
  };

  const handleEndCall = () => {
    onEndCall();
    toast.success("Call ended", {
      icon: "📞",
      position: "top-center",
    });
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Main video area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {isVideoOff ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Avatar className="w-32 h-32">
              <AvatarImage src={callerAvatar} />
              <AvatarFallback className="text-4xl bg-primary/20">
                {callerName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 ${cameraFlipped ? 'scale-x-[-1]' : ''}`}>
            {/* This would be the remote video feed in a real implementation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-xl animate-pulse">Connecting video...</p>
            </div>
          </div>
        )}

        {/* Caller info overlay */}
        <div className="absolute top-8 left-0 right-0 text-center text-white p-4">
          <h2 className="text-2xl font-bold">{callerName}</h2>
          {callerPhone && <p className="text-sm opacity-80">{callerPhone}</p>}
          <p className="text-sm mt-1 animate-pulse">Call in progress</p>
        </div>

        {/* Self view (picture-in-picture) */}
        <div className="absolute bottom-32 right-4 w-28 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
          {/* This would be the local video feed in a real implementation */}
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="w-12 h-12">
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Call controls */}
      <div className="bg-gray-900 p-6 rounded-t-3xl shadow-lg">
        <div className="flex justify-between items-center">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={flipCamera}
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="h-14 w-14 rounded-full"
            onClick={() => {
              toast.info("Message sent", {
                icon: "💬",
                position: "top-center",
              });
            }}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
