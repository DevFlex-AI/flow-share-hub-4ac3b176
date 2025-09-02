import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, Play } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Story {
  id: string;
  content?: string;
  media_url: string;
  media_type: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
}

interface StoryGroup {
  user_id: string;
  profile: {
    display_name?: string;
    avatar_url?: string;
  };
  stories: Story[];
  has_new: boolean;
}

export const StoryViewer = () => {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchStories();
  }, [currentUser]);

  const fetchStories = async () => {
    try {
      // Fetch stories from last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group stories by user
      const grouped = data?.reduce((acc: Record<string, StoryGroup>, story: Story) => {
        if (!acc[story.user_id]) {
          acc[story.user_id] = {
            user_id: story.user_id,
            profile: { display_name: 'User', avatar_url: undefined },
            stories: [],
            has_new: true // For simplicity, assuming all are new
          };
        }
        acc[story.user_id].stories.push(story);
        return acc;
      }, {}) || {};

      setStoryGroups(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = () => {
    // Navigate to story creation
    toast({
      title: "Create Story",
      description: "Story creation feature coming soon!"
    });
  };

  const openStoryViewer = (storyGroup: StoryGroup) => {
    // Open full screen story viewer
    toast({
      title: "Story Viewer",
      description: `Opening stories from ${storyGroup.profile.display_name}`
    });
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                  <div className="w-12 h-3 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4">
            {/* Add Story Button */}
            <div className="flex flex-col items-center space-y-2 flex-shrink-0">
              <button
                onClick={handleCreateStory}
                className="relative w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:border-primary transition-colors"
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground">Your Story</span>
            </div>

            {/* Story Groups */}
            {storyGroups.map((group) => (
              <div
                key={group.user_id}
                className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer"
                onClick={() => openStoryViewer(group)}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full p-0.5 ${
                    group.has_new 
                      ? 'bg-gradient-to-tr from-social-accent to-social-warning' 
                      : 'bg-muted'
                  }`}>
                    <Avatar className="w-full h-full border-2 border-background">
                      <AvatarImage src={group.profile.avatar_url} />
                      <AvatarFallback>
                        {group.profile.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {group.stories.some(s => s.media_type === 'video') && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Play className="h-3 w-3 text-primary-foreground fill-current" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-center max-w-16 truncate">
                  {group.profile.display_name}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};