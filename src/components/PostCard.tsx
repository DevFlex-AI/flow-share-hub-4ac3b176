import React, { useState } from "react";
import { Link } from "react-router-dom";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, increment, getDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: any;
  onDelete?: () => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.uid));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    if (!currentUser) return;
    
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    
    try {
      const postRef = doc(firestore, "posts", post.id);
      
      if (newLiked) {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid),
          likeCount: increment(1)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid),
          likeCount: increment(-1)
        });
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      setLiked(!newLiked);
      setLikeCount(prev => !newLiked ? prev + 1 : prev - 1);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) return;
    
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    
    try {
      const userRef = doc(firestore, "users", currentUser.uid);
      
      if (newBookmarked) {
        await updateDoc(userRef, {
          bookmarks: arrayUnion(post.id)
        });
        
        toast({
          title: "Post saved",
          description: "This post has been added to your bookmarks"
        });
      } else {
        await updateDoc(userRef, {
          bookmarks: arrayRemove(post.id)
        });
        
        toast({
          title: "Post removed",
          description: "This post has been removed from your bookmarks"
        });
      }
    } catch (error) {
      console.error("Error updating bookmark status:", error);
      setBookmarked(!newBookmarked);
      toast({
        title: "Error",
        description: "Failed to update bookmark status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    
    if (!showComments && comments.length === 0) {
      await loadComments();
    }
  };

  const loadComments = async () => {
    if (loadingComments) return;
    
    try {
      setLoadingComments(true);
      
      // In a real implementation, you would fetch comments from Firestore
      // For now, we'll simulate it with a delay
      setTimeout(() => {
        setComments([]);
        setLoadingComments(false);
      }, 1000);
    } catch (error) {
      console.error("Error loading comments:", error);
      setLoadingComments(false);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !commentText.trim()) return;
    
    // In a real implementation, you would add comment to Firestore
    console.log("Adding comment:", commentText);
    setCommentText("");
  };

  const handleDelete = async () => {
    if (!currentUser || currentUser.uid !== post.userId) return;
    
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        // Delete post from Firestore
        if (onDelete) onDelete();
        
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted"
        });
      } catch (error) {
        console.error("Error deleting post:", error);
        toast({
          title: "Error",
          description: "Failed to delete post. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (!post || !post.user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow dark:bg-gray-800">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.userId}`}>
              <Avatar className="w-10 h-10 border border-gray-200">
                <AvatarImage src={post.user.photoURL} />
                <AvatarFallback>{post.user.displayName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            
            <div>
              <Link to={`/profile/${post.userId}`} className="font-medium hover:underline">
                {post.user.displayName}
              </Link>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                {post.createdAt?.toDate && (
                  <span>{formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}</span>
                )}
                
                {post.location && (
                  <>
                    <span className="mx-1">•</span>
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{post.location}</span>
                  </>
                )}
                
                {post.user.isOnline && (
                  <span className="inline-flex ml-2 items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs">Online</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBookmark}>
                {bookmarked ? "Remove Bookmark" : "Bookmark Post"}
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                Report Post
              </DropdownMenuItem>
              
              {currentUser && currentUser.uid === post.userId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                    Delete Post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Post Content */}
      {post.text && (
        <div className="px-4 pb-3">
          <p>{post.text}</p>
        </div>
      )}
      
      {post.imageUrl && (
        <div className="relative">
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="w-full object-cover max-h-[500px]" 
          />
        </div>
      )}
      
      {/* Post Actions */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1",
              liked && "text-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-current")} />
            <span>{likeCount > 0 ? likeCount : ""}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleComments}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.commentCount || ""}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBookmark}
          className={cn(
            bookmarked && "text-social-primary"
          )}
        >
          <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
        </Button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-700">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <span className="loading">Loading comments...</span>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div key={index} className="flex space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.photoURL} />
                    <AvatarFallback>{comment.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2 dark:bg-gray-700">
                      <span className="font-medium">{comment.user.displayName}</span>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <button>Like</button>
                      <button>Reply</button>
                      <span>{formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 text-center text-gray-500 dark:text-gray-400">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
          
          {currentUser && (
            <form onSubmit={handleComment} className="mt-3 flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.photoURL || undefined} />
                <AvatarFallback>{currentUser.displayName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-social-primary dark:bg-gray-700"
              />
              <Button type="submit" disabled={!commentText.trim()}>
                Post
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
