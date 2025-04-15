
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, query, orderBy, limit, startAfter, getDocs, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image as ImageIcon, Video, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostCard from "@/components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Fetch initial posts
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        const postsQuery = query(
          collection(firestore, "posts"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
          if (snapshot.empty) {
            setPosts([]);
            setHasMore(false);
            setLoading(false);
            return;
          }
          
          const lastVisible = snapshot.docs[snapshot.docs.length - 1];
          setLastVisible(lastVisible);
          
          // Get user data for each post
          const postsWithUserData = await Promise.all(
            snapshot.docs.map(async (postDoc) => {
              const postData = { id: postDoc.id, ...postDoc.data() };
              
              // Fetch user data
              const userDoc = await getDoc(doc(firestore, "users", postData.userId));
              const userData = userDoc.exists() ? userDoc.data() : null;
              
              return {
                ...postData,
                user: userData
              };
            })
          );
          
          setPosts(postsWithUserData);
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };
    
    fetchInitialPosts();
  }, []);

  // Load more posts
  const loadMorePosts = async () => {
    if (!lastVisible || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      const postsQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(5)
      );
      
      const snapshot = await getDocs(postsQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(newLastVisible);
      
      // Get user data for each post
      const newPostsWithUserData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = { id: postDoc.id, ...postDoc.data() };
          
          // Fetch user data
          const userDoc = await getDoc(doc(firestore, "users", postData.userId));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          return {
            ...postData,
            user: userData
          };
        })
      );
      
      setPosts(prevPosts => [...prevPosts, ...newPostsWithUserData]);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error loading more posts:", error);
      setLoadingMore(false);
    }
  };

  // Pull to refresh - will be implemented in a real mobile app
  const handleRefresh = async () => {
    setLoading(true);
    
    try {
      const postsQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      
      const snapshot = await getDocs(postsQuery);
      
      if (snapshot.empty) {
        setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(newLastVisible);
      
      // Get user data for each post
      const postsWithUserData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = { id: postDoc.id, ...postDoc.data() };
          
          // Fetch user data
          const userDoc = await getDoc(doc(firestore, "users", postData.userId));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          return {
            ...postData,
            user: userData
          };
        })
      );
      
      setPosts(postsWithUserData);
      setHasMore(true);
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      {/* Create Post Card */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 dark:bg-gray-800">
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.photoURL || undefined} />
            <AvatarFallback>
              {userProfile?.displayName?.charAt(0) || currentUser?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <button 
            className="bg-gray-100 rounded-full px-4 py-2 flex-1 text-left text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
            onClick={() => window.location.href = "/create-post"}
          >
            What's on your mind, {userProfile?.displayName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || "there"}?
          </button>
        </div>
        
        <Separator className="my-3" />
        
        <div className="flex justify-between pt-1">
          <Button variant="ghost" className="flex-1" onClick={() => window.location.href = "/create-post"}>
            <ImageIcon className="w-5 h-5 mr-2 text-green-500" />
            <span>Photo</span>
          </Button>
          
          <Button variant="ghost" className="flex-1" onClick={() => window.location.href = "/create-post"}>
            <Video className="w-5 h-5 mr-2 text-social-primary" />
            <span>Video</span>
          </Button>
          
          <Button variant="ghost" className="flex-1" onClick={() => window.location.href = "/create-post"}>
            <MapPin className="w-5 h-5 mr-2 text-red-500" />
            <span>Location</span>
          </Button>
        </div>
      </div>
      
      {/* Stories Section (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto dark:bg-gray-800">
        <div className="flex space-x-4">
          <div className="flex flex-col items-center space-y-1 min-w-[80px]">
            <div className="w-16 h-16 bg-gradient-to-br from-social-primary to-social-secondary rounded-full flex items-center justify-center border-4 border-white">
              <Button variant="ghost" size="icon" className="rounded-full bg-white h-14 w-14 text-social-primary">
                <span className="text-xl font-bold">+</span>
              </Button>
            </div>
            <span className="text-xs">Add Story</span>
          </div>
          
          {/* Example stories (placeholders) */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1 min-w-[80px]">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-4 border-social-primary">
                <div className="w-full h-full bg-gray-300 animate-pulse"></div>
              </div>
              <span className="text-xs">User {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 dark:bg-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-64 w-full rounded-md mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center dark:bg-gray-800">
            <h3 className="text-xl font-medium mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4 dark:text-gray-400">
              Be the first to share a post with your friends!
            </p>
            <Button onClick={() => window.location.href = "/create-post"}>
              Create Post
            </Button>
          </div>
        )}
        
        {hasMore && !loading && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="w-full"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
