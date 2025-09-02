import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, UserCheck, MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Friend {
  id: string;
  display_name: string;
  avatar_url?: string;
  is_online?: boolean;
  last_active?: string;
}

interface FriendRequest {
  id: string;
  sender: Friend;
  created_at: string;
}

export const FriendsWidget = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchFriendsData();
    }
  }, [currentUser]);

  const fetchFriendsData = async () => {
    try {
      // This is a simplified version - in real implementation, you'd need proper friend tables
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', currentUser?.id)
        .limit(10);

      if (error) throw error;

      // Simulate friends vs suggestions (in real app, you'd have a friends table)
      const allProfiles = profiles || [];
      setFriends(allProfiles.slice(0, 5).map(p => ({
        id: p.user_id,
        display_name: p.display_name || 'Unknown User',
        avatar_url: p.avatar_url,
        is_online: Math.random() > 0.5 // Simulate online status
      })));
      
      setSuggestedFriends(allProfiles.slice(5).map(p => ({
        id: p.user_id,
        display_name: p.display_name || 'Unknown User',
        avatar_url: p.avatar_url
      })));

      // Simulate friend requests
      setFriendRequests([]);
    } catch (error) {
      console.error('Error fetching friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      // In real implementation, you'd insert into a friend_requests table
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully"
      });
      
      // Remove from suggested friends
      setSuggestedFriends(prev => prev.filter(f => f.id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      // In real implementation, you'd update the friend_requests table and add to friends
      toast({
        title: "Friend request accepted",
        description: "You are now friends!"
      });
      
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
    }
  };

  const startChat = (friendId: string) => {
    // Navigate to messages with this friend
    toast({
      title: "Starting chat",
      description: "Opening conversation..."
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Friends</span>
              <div className="w-6 h-4 bg-muted rounded animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Friend Requests</span>
              <Badge variant="destructive">{friendRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.sender.avatar_url} />
                      <AvatarFallback>
                        {request.sender.display_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{request.sender.display_name}</p>
                      <p className="text-xs text-muted-foreground">Sent friend request</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => acceptFriendRequest(request.id)}
                      className="bg-social-primary hover:bg-social-primary/90"
                    >
                      Accept
                    </Button>
                    <Button variant="outline" size="sm">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Friends</span>
            <Badge variant="secondary">{friends.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No friends yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friend.avatar_url} />
                        <AvatarFallback>{friend.display_name[0]}</AvatarFallback>
                      </Avatar>
                      {friend.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{friend.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {friend.is_online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startChat(friend.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Friends */}
      {suggestedFriends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>People You May Know</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedFriends.slice(0, 3).map((friend) => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={friend.avatar_url} />
                      <AvatarFallback>{friend.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{friend.display_name}</p>
                      <p className="text-xs text-muted-foreground">Suggested friend</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendFriendRequest(friend.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};