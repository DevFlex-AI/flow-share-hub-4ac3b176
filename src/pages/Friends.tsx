
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserCheck, UserX, Users, Clock } from "lucide-react";
import { toast } from "sonner";

type FriendType = {
  id: string;
  displayName: string;
  photoURL: string;
  username?: string;
};

const Friends = () => {
  const [friends, setFriends] = useState<FriendType[]>([]);
  const [requests, setRequests] = useState<FriendType[]>([]);
  const [sent, setSent] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFriendsData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // In a real app, you would have a more complex data structure
        // For demonstration, we'll simulate friend connections
        const usersRef = collection(firestore, 'users');
        const querySnapshot = await getDocs(query(usersRef, where('id', '!=', currentUser.uid)));
        
        // Simulate different relationship statuses
        const allUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FriendType[];
        
        // For demo purposes, randomly assign users to different categories
        const mockFriends = allUsers.slice(0, 3);
        const mockRequests = allUsers.slice(3, 6);
        const mockSent = allUsers.slice(6, 9);
        
        setFriends(mockFriends);
        setRequests(mockRequests);
        setSent(mockSent);
      } catch (error) {
        console.error('Error fetching friends data:', error);
        toast.error('Failed to load friends data');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsData();
  }, [currentUser]);

  const acceptRequest = async (friend: FriendType) => {
    try {
      // In a real app, update the friendship status in Firestore
      setRequests(prev => prev.filter(req => req.id !== friend.id));
      setFriends(prev => [...prev, friend]);
      
      toast.success(`You are now friends with ${friend.displayName}`, {
        description: "You can now message each other and see each other's posts",
        icon: "🎉"
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const declineRequest = async (friend: FriendType) => {
    try {
      setRequests(prev => prev.filter(req => req.id !== friend.id));
      
      toast("Friend request declined", {
        description: `You declined ${friend.displayName}'s friend request`
      });
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    }
  };

  const cancelRequest = async (friend: FriendType) => {
    try {
      setSent(prev => prev.filter(req => req.id !== friend.id));
      
      toast("Request canceled", {
        description: `You canceled your friend request to ${friend.displayName}`
      });
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Failed to cancel friend request');
    }
  };

  const removeFriend = async (friend: FriendType) => {
    try {
      setFriends(prev => prev.filter(f => f.id !== friend.id));
      
      toast("Friend removed", {
        description: `You are no longer friends with ${friend.displayName}`
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>Please log in to view your friends</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 pb-24 md:pb-6">
      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
          <CardDescription>Manage your connections</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="friends">
            <TabsList className="mb-6">
              <TabsTrigger value="friends">
                <UserCheck className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="requests">
                <UserPlus className="h-4 w-4 mr-2" />
                Requests {requests.length > 0 && `(${requests.length})`}
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Clock className="h-4 w-4 mr-2" />
                Sent
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : friends.length > 0 ? (
                friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.photoURL} />
                        <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.displayName}</p>
                        {friend.username && <p className="text-sm text-muted-foreground">@{friend.username}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        toast("Message sent!", {
                          description: `Your message has been sent to ${friend.displayName}`,
                          icon: "💬"
                        });
                      }}>
                        Message
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeFriend(friend)}>
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No friends yet</h3>
                  <p className="text-muted-foreground">Start connecting with people to add friends</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : requests.length > 0 ? (
                requests.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.photoURL} />
                        <AvatarFallback>{getInitials(request.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.displayName}</p>
                        {request.username && <p className="text-sm text-muted-foreground">@{request.username}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => acceptRequest(request)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => declineRequest(request)}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No pending requests</h3>
                  <p className="text-muted-foreground">When someone sends you a friend request, it will appear here</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sent" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : sent.length > 0 ? (
                sent.map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.photoURL} />
                        <AvatarFallback>{getInitials(request.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.displayName}</p>
                        {request.username && <p className="text-sm text-muted-foreground">@{request.username}</p>}
                      </div>
                    </div>
                    <div>
                      <Button size="sm" variant="outline" onClick={() => cancelRequest(request)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No sent requests</h3>
                  <p className="text-muted-foreground">When you send friend requests, they will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Friends;
