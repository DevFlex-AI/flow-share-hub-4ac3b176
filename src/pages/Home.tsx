import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { firestore, storage } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare, FileText } from "lucide-react";
import PostCard from "@/components/PostCard";

const getTimeAgo = (timestamp: any) => {
  if (!timestamp) return "Just now";

  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(firestore, "posts"), orderBy("createdAt", "desc"), limit(10));
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    const fetchSuggestedUsers = async () => {
      try {
        // Fetch users, but exclude the current user
        const usersQuery = query(collection(firestore, "users"), orderBy("createdAt", "desc"), limit(5));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Filter out the current user from the suggestions
        const usersData = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== currentUser?.uid);
        
        setSuggestedUsers(usersData);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    const fetchTrendingPosts = async () => {
      try {
        const trendingPostsQuery = query(collection(firestore, "posts"), orderBy("likeCount", "desc"), limit(5));
        const trendingPostsSnapshot = await getDocs(trendingPostsQuery);
        const trendingPostsData = trendingPostsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrendingPosts(trendingPostsData);
      } catch (error) {
        console.error("Error fetching trending posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    fetchSuggestedUsers();
    fetchTrendingPosts();
  }, [currentUser]);

  const renderPosts = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="text-gray-500 mt-1">Follow more people or create your first post.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/create-post")}
          >
            Create Post
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={{...post, userId: post.userId || ''}} 
          />
        ))}
      </div>
    );
  };

  const renderSuggestedUsers = () => {
    if (suggestedUsers.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Suggested for you</h3>
        </div>
        <div className="p-2">
          {suggestedUsers.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors dark:hover:bg-gray-700"
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{user.displayName || "User"}</p>
                  <p className="text-xs text-gray-500">{user.followers?.length || 0} followers</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/profile/${user.id || ''}`)}
              >
                View
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrendingPosts = () => {
    if (trendingPosts.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">Trending</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {trendingPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors dark:hover:bg-gray-700">
              <div className="flex items-center mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                  <p className="text-sm font-medium">{post.userName || "User"}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm line-clamp-2">{post.text}</p>
              <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {post.likeCount || 0}
                </span>
                <span className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {post.commentCount || 0}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs ml-auto h-auto py-1 px-2" 
                  onClick={() => navigate(`/profile/${post.userId || ''}`)}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {renderPosts()}
        </div>
        <div className="space-y-6">
          {renderSuggestedUsers()}
          {renderTrendingPosts()}
        </div>
      </div>
    </div>
  );
}
