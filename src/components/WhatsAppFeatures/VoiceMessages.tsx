import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Play, Pause, Square, Volume2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VoiceMessageProps {
  onSend: (audioBlob: Blob) => void;
  disabled?: boolean;
}

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  onPlay?: () => void;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageProps> = ({ onSend, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const playPreview = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audioRef.current.play();
      setIsPlaying(true);
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSend(audioBlob);
      setAudioBlob(null);
      setRecordingTime(0);
      toast({
        title: "Voice message sent!",
        description: "Your voice message has been delivered"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={playPreview}
              className="h-10 w-10"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <div className="h-8 bg-primary/20 rounded-full flex items-center px-3">
                <div className="flex space-x-1 items-center">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      style={{ height: `${Math.random() * 20 + 10}px` }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(recordingTime)}
              </p>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={cancelRecording}
            >
              Cancel
            </Button>
            
            <Button
              size="sm"
              onClick={sendVoiceMessage}
              disabled={disabled}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          {isRecording ? (
            <>
              <Button
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="h-12 w-12 rounded-full animate-pulse"
              >
                <Square className="h-6 w-6" />
              </Button>
              
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording...</span>
                  <span className="text-lg font-mono text-red-500">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tap to stop recording
                </p>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={cancelRecording}
                className="h-12 w-12"
              >
                <MicOff className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <div className="w-full text-center">
              <Button
                size="icon"
                onClick={startRecording}
                disabled={disabled}
                className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90"
              >
                <Mic className="h-8 w-8" />
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Hold to record voice message
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ 
  audioUrl, 
  duration, 
  onPlay 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        onPlay?.();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-3 bg-muted/30 rounded-lg p-3 max-w-xs">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      
      <div className="flex-1">
        <div className="relative h-6 flex items-center">
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <Volume2 className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};