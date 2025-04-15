
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, User, Star, Clock, Plus } from "lucide-react";
import { MobileVideoCallUI } from '@/components/MobileVideoCallUI';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CallPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeCall, setActiveCall] = useState<{name: string, avatar?: string, phone?: string} | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Recent calls data - in a real app this would come from a database
  const recentCalls = [
    { id: '1', name: 'Emma Johnson', avatar: 'https://i.pravatar.cc/150?img=1', time: '10:23 AM', type: 'incoming', missed: false },
    { id: '2', name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=4', time: 'Yesterday', type: 'outgoing', missed: false },
    { id: '3', name: 'Olivia Davis', avatar: 'https://i.pravatar.cc/150?img=5', time: 'Yesterday', type: 'incoming', missed: true },
    { id: '4', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?img=7', time: 'Monday', type: 'outgoing', missed: false },
  ];

  // Favorite contacts - in a real app this would come from a database
  const favoriteContacts = [
    { id: '1', name: 'Emma Johnson', avatar: 'https://i.pravatar.cc/150?img=1', phone: '+1 (555) 123-4567' },
    { id: '2', name: 'Michael Brown', avatar: 'https://i.pravatar.cc/150?img=4', phone: '+1 (555) 234-5678' },
    { id: '3', name: 'Olivia Davis', avatar: 'https://i.pravatar.cc/150?img=5', phone: '+1 (555) 345-6789' },
  ];

  const initiateCall = (type: 'voice' | 'video', contact?: {name: string, avatar?: string, phone?: string}) => {
    if (contact) {
      // Call existing contact
      if (type === 'video') {
        setActiveCall(contact);
      } else {
        // Voice call
        toast.info(`Voice calling ${contact.name}...`, {
          icon: "📞",
          duration: 3000,
          action: {
            label: "Cancel",
            onClick: () => toast.info("Call cancelled")
          }
        });
        
        // Simulate connecting
        setTimeout(() => {
          navigate('/video-call', { state: { callerName: contact.name, callerAvatar: contact.avatar } });
        }, 1500);
      }
    } else if (phoneNumber) {
      // Call using entered phone number
      if (type === 'video') {
        setActiveCall({
          name: phoneNumber,
          phone: phoneNumber
        });
      } else {
        // Voice call with entered phone number
        toast.info(`Voice calling ${phoneNumber}...`, {
          icon: "📞",
          duration: 3000,
          action: {
            label: "Cancel",
            onClick: () => toast.info("Call cancelled")
          }
        });
        
        // Simulate connecting
        setTimeout(() => {
          navigate('/video-call', { state: { callerName: phoneNumber, callerPhone: phoneNumber } });
        }, 1500);
      }
    } else {
      toast.warning("Please enter a phone number or select a contact");
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    toast.info("Call ended", {
      description: "The call was ended",
      icon: "📞"
    });
  };

  // Format phone number for display
  const formatPhoneNumber = (input: string) => {
    const digits = input.replace(/\D/g, '');
    
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  if (activeCall) {
    return <MobileVideoCallUI 
      callerName={activeCall.name} 
      callerAvatar={activeCall.avatar}
      callerPhone={activeCall.phone}
      onEndCall={handleEndCall} 
    />;
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4 pb-24 md:pb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Phone</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.photoURL || undefined} />
              <AvatarFallback>
                {currentUser?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </CardTitle>
          <CardDescription>Make calls to your contacts or any phone number</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="keypad">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="keypad">
                <Phone className="h-4 w-4 mr-2" />
                Keypad
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
            </TabsList>

            <TabsContent value="keypad">
              <div className="space-y-6">
                <div>
                  <Input
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="text-lg text-center font-medium"
                  />
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="h-14 text-lg font-medium"
                      onClick={() => setPhoneNumber(prev => formatPhoneNumber(prev + key))}
                    >
                      {key}
                    </Button>
                  ))}
                </div>

                {/* Call buttons */}
                <div className="flex justify-center space-x-4 pt-4">
                  <Button 
                    size="icon" 
                    className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => initiateCall('voice')}
                  >
                    <Phone className="h-8 w-8 text-white" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="h-16 w-16 rounded-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => initiateCall('video')}
                  >
                    <Video className="h-8 w-8 text-white" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="space-y-4">
                {recentCalls.map(call => (
                  <div 
                    key={call.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 cursor-pointer"
                    onClick={() => initiateCall('voice', { name: call.name, avatar: call.avatar })}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={call.avatar} />
                        <AvatarFallback>{call.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={`font-medium ${call.missed && call.type === 'incoming' ? 'text-red-500' : ''}`}>{call.name}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {call.type === 'incoming' ? (
                            <Phone className="h-3 w-3 mr-1 rotate-90 text-green-500" />
                          ) : (
                            <Phone className="h-3 w-3 mr-1 -rotate-90 text-blue-500" />
                          )}
                          <span>{call.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full text-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateCall('voice', { name: call.name, avatar: call.avatar });
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateCall('video', { name: call.name, avatar: call.avatar });
                        }}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="space-y-4">
                {favoriteContacts.map(contact => (
                  <div 
                    key={contact.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 cursor-pointer"
                    onClick={() => initiateCall('voice', contact)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full text-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateCall('voice', contact);
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateCall('video', contact);
                        }}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Contact
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallPage;
