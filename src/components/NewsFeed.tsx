import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  } | null;
}

export const NewsFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPosts();
    if (currentUser) {
      fetchUserLikes();
    }
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.id);

      if (error) throw error;
      setLikedPosts(new Set(data?.map(like => like.post_id) || []));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    const isLiked = likedPosts.has(postId);
    
    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);
        
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          });
        
        setLikedPosts(prev => new Set(prev).add(postId));
      }

      // Update post likes count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        title: 'Check out this post',
        url: `${window.location.origin}/post/${postId}`
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-32 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback>
                    {post.profiles?.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {post.profiles?.display_name || 'Unknown User'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
            
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                {post.media_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Post media ${index + 1}`}
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    likedPosts.has(post.id) ? 'text-red-500' : ''
                  }`}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      likedPosts.has(post.id) ? 'fill-current' : ''
                    }`} 
                  />
                  <span>{post.likes_count}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments_count}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-1"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares_count}</span>
                </Button>
              </div>
              
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};