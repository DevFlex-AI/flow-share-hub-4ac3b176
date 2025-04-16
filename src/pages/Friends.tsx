
import React, { useEffect, useState } from 'react';
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserCheck, UserX, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type FriendType = {
  id: string;
  displayName: string;
  photoURL: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  isOnline?: boolean;
};

const Friends = () => {
  const [friends, setFriends] = useState<FriendType[]>([]);
  const [requests, setRequests] = useState<FriendType[]>([]);
  const [sent, setSent] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    
    const userRef = doc(firestore, 'users', currentUser.uid);
    
    // Listen for current user's data to get references to friendships
    const unsubUser = onSnapshot(userRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      
      const userData = snapshot.data();
      
      // Fetch friends
      if (userData.friends && userData.friends.length > 0) {
        const friendsQuery = query(
          collection(firestore, 'users'),
          where('id', 'in', userData.friends)
        );
        
        const friendsSnapshot = await getDoc(userRef);
        if (friendsSnapshot.exists()) {
          const data = friendsSnapshot.data();
          
          // This would be replaced with actual friends data in a real app
          if (data.friends) {
            const friendIds = data.friends;
            const friendsDocs = await Promise.all(
              friendIds.map((id: string) => getDoc(doc(firestore, 'users', id)))
            );
            
            const friendsData = friendsDocs
              .filter(doc => doc.exists())
              .map(doc => ({ id: doc.id, ...doc.data() })) as FriendType[];
              
            setFriends(friendsData);
          }
        }
      } else {
        setFriends([]);
      }
      
      // Fetch friend requests
      if (userData.friendRequests && userData.friendRequests.length > 0) {
        const requestsPromises = userData.friendRequests.map((id: string) => 
          getDoc(doc(firestore, 'users', id))
        );
        
        const requestsDocs = await Promise.all(requestsPromises);
        const requestsData = requestsDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() })) as FriendType[];
          
        setRequests(requestsData);
      } else {
        setRequests([]);
      }
      
      // Fetch sent requests
      if (userData.sentRequests && userData.sentRequests.length > 0) {
        const sentPromises = userData.sentRequests.map((id: string) => 
          getDoc(doc(firestore, 'users', id))
        );
        
        const sentDocs = await Promise.all(sentPromises);
        const sentData = sentDocs
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, ...doc.data() })) as FriendType[];
          
        setSent(sentData);
      } else {
        setSent([]);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Error with friends listener:', error);
      toast.error('Connection issue', {
        description: 'Real-time updates interrupted. Try refreshing the page.',
        icon: '🔄'
      });
      setLoading(false);
    });
    
    return () => {
      unsubUser();
    };
  }, [currentUser]);

  const acceptRequest = async (friend: FriendType) => {
    if (!currentUser) return;
    
    try {
      // Update current user's friends list
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(friend.id),
        friendRequests: arrayRemove(friend.id)
      });
      
      // Update the requester's friends list
      const friendRef = doc(firestore, 'users', friend.id);
      await updateDoc(friendRef, {
        friends: arrayUnion(currentUser.uid),
        sentRequests: arrayRemove(currentUser.uid)
      });
      
      // Update local state
      setRequests(prev => prev.filter(req => req.id !== friend.id));
      setFriends(prev => [...prev, friend]);
      
      toast.success(`You are now friends with ${friend.displayName}`, {
        description: "You can now message each other and see each other's posts",
        icon: "🎉"
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request', {
        description: 'Please try again',
        icon: '⚠️'
      });
    }
  };

  const declineRequest = async (friend: FriendType) => {
    if (!currentUser) return;
    
    try {
      // Remove from current user's requests
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friendRequests: arrayRemove(friend.id)
      });
      
      // Remove from sender's sent requests
      const friendRef = doc(firestore, 'users', friend.id);
      await updateDoc(friendRef, {
        sentRequests: arrayRemove(currentUser.uid)
      });
      
      // Update local state
      setRequests(prev => prev.filter(req => req.id !== friend.id));
      
      toast.info("Friend request declined", {
        description: `You declined ${friend.displayName}'s friend request`,
        icon: "👋"
      });
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request', {
        description: 'Please try again',
        icon: '⚠️'
      });
    }
  };

  const cancelRequest = async (friend: FriendType) => {
    if (!currentUser) return;
    
    try {
      // Remove from current user's sent requests
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        sentRequests: arrayRemove(friend.id)
      });
      
      // Remove from recipient's friend requests
      const friendRef = doc(firestore, 'users', friend.id);
      await updateDoc(friendRef, {
        friendRequests: arrayRemove(currentUser.uid)
      });
      
      // Update local state
      setSent(prev => prev.filter(req => req.id !== friend.id));
      
      toast.info("Request canceled", {
        description: `You canceled your friend request to ${friend.displayName}`,
        icon: "✖️"
      });
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Failed to cancel friend request', {
        description: 'Please try again',
        icon: '⚠️'
      });
    }
  };

  const removeFriend = async (friend: FriendType) => {
    if (!currentUser) return;
    
    try {
      // Remove from current user's friends
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(friend.id)
      });
      
      // Remove from friend's friends list
      const friendRef = doc(firestore, 'users', friend.id);
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUser.uid)
      });
      
      // Update local state
      setFriends(prev => prev.filter(f => f.id !== friend.id));
      
      toast.info("Friend removed", {
        description: `You are no longer friends with ${friend.displayName}`,
        icon: "👋"
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend', {
        description: 'Please try again',
        icon: '⚠️'
      });
    }
  };

  const sendMessage = (friend: FriendType) => {
    // In a real app, this would redirect to messages with this friend
    toast.success(`Message sent to ${friend.displayName}`, {
      description: "Check your messages for their response",
      icon: "💬"
    });
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
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
                Friends {friends.length > 0 && `(${friends.length})`}
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                <UserPlus className="h-4 w-4 mr-2" />
                Requests 
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {requests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Clock className="h-4 w-4 mr-2" />
                Sent {sent.length > 0 && `(${sent.length})`}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : friends.length > 0 ? (
                friends.map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="relative">
                        <AvatarImage src={friend.photoURL} />
                        <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                        {friend.isOnline && (
                          <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-1 ring-white"></span>
                        )}
                      </Avatar>
                      <div>
                        <Link to={`/profile/${friend.id}`} className="font-medium hover:underline">
                          {friend.displayName}
                        </Link>
                        {friend.username && <p className="text-sm text-muted-foreground">@{friend.username}</p>}
                        {friend.isOnline ? (
                          <p className="text-xs text-green-500">Online</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Offline</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => sendMessage(friend)}>
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFriend(friend)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No friends yet</h3>
                  <p className="text-muted-foreground mb-4">Start connecting with people to add friends</p>
                  <Button onClick={() => window.location.href = '/explore'}>
                    Find Friends
                  </Button>
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
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.photoURL} />
                        <AvatarFallback>{getInitials(request.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/profile/${request.id}`} className="font-medium hover:underline">
                          {request.displayName}
                        </Link>
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
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.photoURL} />
                        <AvatarFallback>{getInitials(request.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/profile/${request.id}`} className="font-medium hover:underline">
                          {request.displayName}
                        </Link>
                        {request.username && <p className="text-sm text-muted-foreground">@{request.username}</p>}
                      </div>
                    </div>
                    <div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => cancelRequest(request)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No sent requests</h3>
                  <p className="text-muted-foreground mb-4">When you send friend requests, they will appear here</p>
                  <Button onClick={() => window.location.href = '/explore'}>
                    Find Friends
                  </Button>
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
