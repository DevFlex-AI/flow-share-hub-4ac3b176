
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Video, Star, Clock, Plus, X } from "lucide-react";
import { MobileVideoCallUI } from '@/components/MobileVideoCallUI';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

type ContactType = {
  id: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  isOnline?: boolean;
};

type CallHistoryType = {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  recipientId: string;
  recipientName: string;
  recipientPhoto?: string;
  type: 'voice' | 'video';
  status: 'incoming' | 'outgoing' | 'missed';
  timestamp: any;
  duration?: number;
};

const CallPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeCall, setActiveCall] = useState<{name: string, avatar?: string, phone?: string} | null>(null);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [favoriteContacts, setFavoriteContacts] = useState<ContactType[]>([]);
  const [recentCalls, setRecentCalls] = useState<CallHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch contacts from Firestore
    const fetchContacts = async () => {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(
          usersRef, 
          where('id', '!=', currentUser.uid),
          limit(20)
        );
        
        // Real-time listener for contacts
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedContacts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ContactType[];
          
          setContacts(fetchedContacts);
          
          // For favorites, we'd normally have a separate collection or field
          // For this demo, we'll just use the first few contacts
          setFavoriteContacts(fetchedContacts.slice(0, 3));
          setLoading(false);
        });
        
        // Listen for call history
        const callsRef = collection(firestore, 'calls');
        const callsQuery = query(
          callsRef,
          where('participants', 'array-contains', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const callsUnsubscribe = onSnapshot(callsQuery, (snapshot) => {
          const fetchedCalls = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CallHistoryType[];
          
          setRecentCalls(fetchedCalls);
        });
        
        return () => {
          unsubscribe();
          callsUnsubscribe();
        };
      } catch (error) {
        console.error("Error fetching contacts data:", error);
        toast.error("Failed to load contacts", {
          description: "Please check your connection and try again",
          icon: "⚠️"
        });
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser]);

  const initiateCall = async (type: 'voice' | 'video', contact?: ContactType) => {
    if (!currentUser) return;
    
    // If it's a phone number call (not a contact)
    if (!contact && phoneNumber) {
      if (phoneNumber.length < 10) {
        toast.error("Invalid phone number", {
          description: "Please enter a valid phone number",
          icon: "📱"
        });
        return;
      }
      
      // Check if the phone number belongs to a user
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data() as ContactType;
          
          contact = {
            id: userDoc.id,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            phoneNumber: userData.phoneNumber
          };
        } else {
          // No user found with this phone number
          if (type === 'video') {
            toast.error("User not found", {
              description: "No user with this phone number found in the app",
              icon: "❌"
            });
            return;
          } else {
            // For voice calls we can still proceed with just the number
            contact = {
              id: 'external',
              displayName: phoneNumber,
              phoneNumber: phoneNumber
            };
          }
        }
      } catch (error) {
        console.error("Error looking up phone number:", error);
        toast.error("Failed to place call", {
          description: "Please try again",
          icon: "⚠️"
        });
        return;
      }
    }
    
    if (!contact) {
      toast.error("Missing information", {
        description: "Please enter a phone number or select a contact",
        icon: "❓"
      });
      return;
    }
    
    // Log call to Firestore
    try {
      await addDoc(collection(firestore, 'calls'), {
        callerId: currentUser.uid,
        callerName: userProfile?.displayName || currentUser.displayName,
        callerPhoto: userProfile?.photoURL,
        recipientId: contact.id,
        recipientName: contact.displayName,
        recipientPhoto: contact.photoURL,
        type: type,
        status: 'outgoing',
        timestamp: serverTimestamp(),
        participants: [currentUser.uid, contact.id]
      });
    } catch (error) {
      console.error("Error logging call:", error);
    }
    
    // Initiate call UI
    if (type === 'video') {
      setActiveCall(contact);
    } else {
      // Voice call
      toast.info(`Calling ${contact.displayName}...`, {
        icon: "📞",
        duration: 3000,
        action: {
          label: "Cancel",
          onClick: () => toast.info("Call cancelled", {
            icon: "✖️"
          })
        }
      });
      
      // Simulate connecting
      setTimeout(() => {
        navigate('/video-call', { 
          state: { 
            callerName: contact.displayName, 
            callerAvatar: contact.photoURL,
            callerPhone: contact.phoneNumber
          } 
        });
      }, 1500);
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

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  if (activeCall) {
    return <MobileVideoCallUI 
      callerName={activeCall.displayName} 
      callerAvatar={activeCall.photoURL}
      callerPhone={activeCall.phoneNumber}
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
              <AvatarImage src={userProfile?.photoURL || undefined} />
              <AvatarFallback>
                {userProfile?.displayName?.charAt(0) || currentUser?.displayName?.charAt(0) || 'U'}
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
                
                {phoneNumber && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhoneNumber('')}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : recentCalls.length > 0 ? (
                  recentCalls.map(call => (
                    <div 
                      key={call.id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 cursor-pointer"
                      onClick={() => {
                        const isOutgoing = call.callerId === currentUser?.uid;
                        const contactName = isOutgoing ? call.recipientName : call.callerName;
                        const contactPhoto = isOutgoing ? call.recipientPhoto : call.callerPhoto;
                        const contactId = isOutgoing ? call.recipientId : call.callerId;
                        
                        initiateCall(call.type, {
                          id: contactId,
                          displayName: contactName,
                          photoURL: contactPhoto
                        });
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage 
                            src={call.callerId === currentUser?.uid ? call.recipientPhoto : call.callerPhoto} 
                          />
                          <AvatarFallback>
                            {getInitials(call.callerId === currentUser?.uid ? call.recipientName : call.callerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={`font-medium ${call.status === 'missed' && call.callerId !== currentUser?.uid ? 'text-red-500' : ''}`}>
                            {call.callerId === currentUser?.uid ? call.recipientName : call.callerName}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {call.status === 'outgoing' ? (
                              <Phone className="h-3 w-3 mr-1 -rotate-90 text-blue-500" />
                            ) : (
                              <Phone className="h-3 w-3 mr-1 rotate-90 text-green-500" />
                            )}
                            <span>
                              {call.timestamp?.toDate ? new Date(call.timestamp.toDate()).toLocaleString() : 'Recently'}
                            </span>
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
                            const isOutgoing = call.callerId === currentUser?.uid;
                            initiateCall('voice', {
                              id: isOutgoing ? call.recipientId : call.callerId,
                              displayName: isOutgoing ? call.recipientName : call.callerName,
                              photoURL: isOutgoing ? call.recipientPhoto : call.callerPhoto
                            });
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
                            const isOutgoing = call.callerId === currentUser?.uid;
                            initiateCall('video', {
                              id: isOutgoing ? call.recipientId : call.callerId,
                              displayName: isOutgoing ? call.recipientName : call.callerName,
                              photoURL: isOutgoing ? call.recipientPhoto : call.callerPhoto
                            });
                          }}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No recent calls</h3>
                    <p className="text-muted-foreground mt-1">Your call history will appear here</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : favoriteContacts.length > 0 ? (
                  favoriteContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 cursor-pointer"
                      onClick={() => initiateCall('voice', contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={contact.photoURL} />
                          <AvatarFallback>{getInitials(contact.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.displayName}</p>
                          <p className="text-xs text-muted-foreground">{contact.phoneNumber || 'No phone number'}</p>
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
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No favorite contacts</h3>
                    <p className="text-muted-foreground mt-1 mb-4">Add contacts to your favorites for quick access</p>
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate('/friends')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contacts
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallPage;
