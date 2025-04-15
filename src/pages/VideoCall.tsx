
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Share, Users, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { firestore } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Note: This is a placeholder component. Actual video calls would require WebRTC implementation.
export default function VideoCall() {
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isUsingMemoji, setIsUsingMemoji] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const { currentUser, userProfile } = useAuth();

  // Simulate fetching contacts
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchContacts = async () => {
      try {
        // In a real app, you would fetch user's contacts from Firestore
        // For now, we'll simulate contacts
        
        // For demo, we'll create some fake contacts
        const demoContacts = [
          {
            id: "1",
            displayName: "John Doe",
            photoURL: null,
            isOnline: true
          },
          {
            id: "2",
            displayName: "Sarah Smith",
            photoURL: null,
            isOnline: true
          },
          {
            id: "3",
            displayName: "Mike Johnson",
            photoURL: null,
            isOnline: false
          }
        ];
        
        setContacts(demoContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive"
        });
      }
    };
    
    fetchContacts();
  }, [currentUser]);

  // Simulate accessing camera/mic
  useEffect(() => {
    if (callStatus === "connected" && !isVideoOff) {
      // In a real implementation, this would use WebRTC and getUserMedia
      // For demo, we'll just display the camera feed if available
      const enableCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMuted });
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          setIsVideoOff(true);
          toast({
            title: "Camera Error",
            description: "Could not access your camera",
            variant: "destructive"
          });
        }
      };
      
      enableCamera();
      
      return () => {
        // Clean up camera stream
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [callStatus, isVideoOff, isMuted]);

  const handleStartCall = () => {
    if (!selectedContact) {
      toast({
        title: "Error",
        description: "Please select a contact to call",
        variant: "destructive"
      });
      return;
    }
    
    setCallStatus("connecting");
    
    // Simulate connecting
    setTimeout(() => {
      setCallStatus("connected");
      toast({
        title: "Connected",
        description: `Call connected with ${selectedContact.displayName}`
      });
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    
    // Clean up video streams
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const stream = remoteVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    toast({
      title: "Call Ended",
      description: "The call has been ended"
    });
    
    // Reset after a moment
    setTimeout(() => {
      setCallStatus("idle");
      setSelectedContact(null);
    }, 3000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // In a real implementation, would mute actual audio track
    toast({
      title: isMuted ? "Microphone On" : "Microphone Off",
      description: isMuted ? "You are now unmuted" : "You are now muted"
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    
    // In a real implementation, would enable/disable video track
    toast({
      title: isVideoOff ? "Camera On" : "Camera Off",
      description: isVideoOff ? "Your camera is now on" : "Your camera is now off"
    });
  };

  const toggleMemoji = () => {
    setIsUsingMemoji(!isUsingMemoji);
    
    toast({
      title: isUsingMemoji ? "Memoji Disabled" : "Memoji Enabled",
      description: isUsingMemoji ? "Showing your actual video" : "Using animated avatar"
    });
  };

  const filteredContacts = contacts.filter(contact => 
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  return (
    <div className="container max-w-5xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
          {/* Contacts List */}
          {callStatus === "idle" && (
            <div className="col-span-1 border-r border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">New Video Call</h2>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-social-primary focus:border-transparent dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto max-h-[500px]">
                {filteredContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                      selectedContact?.id === contact.id ? "bg-gray-50 dark:bg-gray-700" : ""
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.photoURL} />
                          <AvatarFallback>{getInitials(contact.displayName)}</AvatarFallback>
                        </Avatar>
                        
                        {contact.isOnline && (
                          <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium">{contact.displayName}</h3>
                        <p className="text-xs text-gray-500">
                          {contact.isOnline ? (
                            <span className="text-green-500">Available</span>
                          ) : (
                            "Offline"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredContacts.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <p>No contacts found</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Call Space */}
          <div className={`${callStatus === "idle" ? "col-span-2" : "col-span-3"} flex flex-col`}>
            {callStatus === "idle" ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                {selectedContact ? (
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={selectedContact.photoURL} />
                      <AvatarFallback className="text-3xl">{getInitials(selectedContact.displayName)}</AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-2xl font-bold mb-2">{selectedContact.displayName}</h2>
                    <p className="text-gray-500 mb-6">
                      {selectedContact.isOnline ? (
                        <span className="text-green-500">Available for call</span>
                      ) : (
                        "Offline (can't receive calls)"
                      )}
                    </p>
                    
                    <div className="flex space-x-4 justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setSelectedContact(null)}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={handleStartCall}
                        disabled={!selectedContact.isOnline}
                      >
                        Start Video Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 dark:bg-gray-700">
                      <VideoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Start a Video Call</h2>
                    <p className="text-gray-500 mb-8">
                      Select a contact from the list to start a video call
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative flex-1">
                {/* Main video area - would show remote video in real implementation */}
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  {callStatus === "connecting" ? (
                    <div className="text-center text-white">
                      <Avatar className="w-24 h-24 mx-auto mb-4 animate-pulse">
                        <AvatarImage src={selectedContact?.photoURL} />
                        <AvatarFallback className="text-3xl">{selectedContact ? getInitials(selectedContact.displayName) : "U"}</AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl mb-2">Calling {selectedContact?.displayName}...</h2>
                      <p className="text-gray-400">Please wait while we connect your call</p>
                    </div>
                  ) : callStatus === "ended" ? (
                    <div className="text-center text-white">
                      <h2 className="text-2xl mb-2">Call Ended</h2>
                    </div>
                  ) : (
                    <>
                      {isUsingMemoji ? (
                        /* Memoji placeholder - in a real app would be a 3D avatar */
                        <div className="w-48 h-48 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-6xl">🙂</span>
                        </div>
                      ) : (
                        /* Remote video - would actually connect to peer in real implementation */
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Local video preview (picture-in-picture) */}
                      <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg">
                        {isVideoOff ? (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={userProfile?.photoURL} />
                              <AvatarFallback>{userProfile?.displayName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                          </div>
                        ) : isUsingMemoji ? (
                          /* Local Memoji */
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-3xl">🙂</span>
                          </div>
                        ) : (
                          /* Local video feed */
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Call controls */}
                {(callStatus === "connected" || callStatus === "connecting") && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 flex justify-center">
                    <div className="flex space-x-4">
                      <Button
                        size="icon"
                        variant={isMuted ? "destructive" : "secondary"}
                        className="rounded-full h-12 w-12"
                        onClick={toggleMute}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant={isVideoOff ? "destructive" : "secondary"}
                        className="rounded-full h-12 w-12"
                        onClick={toggleVideo}
                      >
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-full h-12 w-12"
                        onClick={handleEndCall}
                      >
                        <PhoneOff className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant={isUsingMemoji ? "default" : "secondary"}
                        className="rounded-full h-12 w-12"
                        onClick={toggleMemoji}
                      >
                        <span className="text-xl">🙂</span>
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-12 w-12"
                      >
                        <Share className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-12 w-12"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-12 w-12"
                      >
                        <Users className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
