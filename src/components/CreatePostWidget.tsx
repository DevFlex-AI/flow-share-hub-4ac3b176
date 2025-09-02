import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, MapPin, Users, Smile, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const CreatePostWidget = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser, userProfile } = useAuth();

  const handleSubmit = async () => {
    if (!currentUser || !content.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          user_id: currentUser.id,
          privacy_level: 'public',
          media_type: 'text'
        });

      if (error) throw error;

      setContent('');
      toast({
        title: "Success",
        description: "Your post has been shared!"
      });

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="flex-shrink-0">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>
              {userProfile?.display_name?.[0] || currentUser.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
              maxLength={2000}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Image className="h-4 w-4 mr-1" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  Tag
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Smile className="h-4 w-4 mr-1" />
                  Feeling
                </Button>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isLoading}
                size="sm"
                className="bg-social-primary hover:bg-social-primary/90"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};