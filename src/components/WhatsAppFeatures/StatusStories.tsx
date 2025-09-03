import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye, Heart, MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Status {
  id: string;
  content: string;
  media_url?: string;
  user_id: string;
  views_count: number;
  created_at: string;
  expires_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

export const StatusStories = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [myStatuses, setMyStatuses] = useState<Status[]>([]);
  const [newStatusContent, setNewStatusContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchStatuses();
      fetchMyStatuses();
    }
  }, [currentUser]);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .neq('user_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchMyStatuses = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles!stories_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', currentUser.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyStatuses(data || []);
    } catch (error) {
      console.error('Error fetching my statuses:', error);
    }
  };

  const createStatus = async () => {
    if (!currentUser || !newStatusContent.trim()) return;

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.id,
          content: newStatusContent,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Status Posted",
        description: "Your status has been shared!"
      });

      setNewStatusContent('');
      setIsCreateDialogOpen(false);
      fetchMyStatuses();
    } catch (error) {
      console.error('Error creating status:', error);
      toast({
        title: "Error",
        description: "Failed to post status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const viewStatus = async (statusId: string) => {
    if (!currentUser) return;

    try {
      // Record the view
      await supabase
        .from('story_views')
        .upsert({
          story_id: statusId,
          viewer_id: currentUser.id
        });

      // Update views count
      await supabase
        .from('stories')
        .update({ views_count: statuses.find(s => s.id === statusId)?.views_count + 1 })
        .eq('id', statusId);

      // Refresh statuses
      fetchStatuses();
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const StatusCard = ({ status, isOwn = false }: { status: Status; isOwn?: boolean }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-secondary/5"
      onClick={() => !isOwn && viewStatus(status.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="border-2 border-primary">
            <AvatarImage src={status.profiles.avatar_url} />
            <AvatarFallback>
              {status.profiles.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{status.profiles.display_name}</h4>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(status.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <p className="text-sm mb-3 line-clamp-3">{status.content}</p>
        
        {status.media_url && (
          <img 
            src={status.media_url} 
            alt="Status media" 
            className="w-full rounded-lg mb-3 max-h-40 object-cover"
          />
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{status.views_count}</span>
            </span>
          </div>
          <span>
            Expires {formatDistanceToNow(new Date(status.expires_at), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Status</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Status
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share a Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newStatusContent}
                onChange={(e) => setNewStatusContent(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Your status will disappear after 24 hours
              </p>
              <Button 
                onClick={createStatus} 
                disabled={!newStatusContent.trim() || loading}
                className="w-full"
              >
                {loading ? 'Posting...' : 'Share Status'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Status */}
      {myStatuses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">My Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myStatuses.map((status) => (
              <StatusCard key={status.id} status={status} isOwn={true} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Updates */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Updates</h3>
        {statuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statuses.map((status) => (
              <StatusCard key={status.id} status={status} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No status updates</h3>
              <p className="text-muted-foreground">
                Be the first to share a status update!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};