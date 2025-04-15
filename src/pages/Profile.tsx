
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Edit, Settings, MapPin, Calendar, Grid, Bookmark, UserCheck, Users, Tag } from "lucide-react";
import PostCard from "@/components/PostCard";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  
  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(firestore, "users", userId!));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          
          // Check if current user is following this profile
          if (currentUser && userDoc.data().followers) {
            setIsFollowing(userDoc.data().followers.includes(currentUser.uid));
          }
        } else {
          toast({
            title: "Error",
            description: "User not found",
            variant: "destructive"
          });
          return;
        }
        
        // Fetch user posts
        const postsQuery = query(
          collection(firestore, "posts"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          user: userDoc.data()
        }));
        
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive"
        });
      }
    };
    
    if (userId) {
      fetchProfileAndPosts();
    }
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    
    try {
      setIsFollowing(!isFollowing);
      
      // In a real app, you would update the followers/following arrays in Firestore
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You are no longer following ${userProfile.displayName}`
          : `You are now following ${userProfile.displayName}`
      });
    } catch (error) {
      console.error("Error updating follow status:", error);
      setIsFollowing(!isFollowing); // Revert UI state
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-4 dark:bg-gray-700"></div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded mb-2 w-1/3 dark:bg-gray-700"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="h-24 bg-gray-200 rounded mb-4 dark:bg-gray-700"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-gray-500 mb-4">The user you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  return (
    <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      {/* Cover Photo */}
      <div className="relative h-48 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 mb-16">
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-4 md:left-8">
          <Avatar className="w-24 h-24 border-4 border-white">
            <AvatarImage src={userProfile.photoURL} />
            <AvatarFallback className="text-2xl">{getInitials(userProfile.displayName)}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {isOwnProfile ? (
            <>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                <Edit className="h-4 w-4 mr-2" />
                <span>Edit Profile</span>
              </Button>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant={isFollowing ? "outline" : "default"} 
                onClick={handleFollowToggle}
                className={isFollowing ? "bg-white/80 backdrop-blur-sm" : ""}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    <span>Following</span>
                  </>
                ) : (
                  <span>Follow</span>
                )}
              </Button>
              <Button>Message</Button>
            </>
          )}
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="pl-4 md:pl-8 mb-6">
        <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
        
        <div className="flex items-center text-gray-500 text-sm mt-1 space-x-4">
          {userProfile.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{userProfile.location}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Joined April 2023</span>
          </div>
          
          {userProfile.isOnline && (
            <div className="flex items-center text-green-500">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
              <span>Online</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 mt-4">
          <Link to="#" className="font-medium">
            <span className="text-black dark:text-white">{posts.length}</span>{" "}
            <span className="text-gray-500">Posts</span>
          </Link>
          <Link to="#" className="font-medium">
            <span className="text-black dark:text-white">{userProfile.followers?.length || 0}</span>{" "}
            <span className="text-gray-500">Followers</span>
          </Link>
          <Link to="#" className="font-medium">
            <span className="text-black dark:text-white">{userProfile.following?.length || 0}</span>{" "}
            <span className="text-gray-500">Following</span>
          </Link>
        </div>
        
        {userProfile.bio && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{userProfile.bio}</p>
        )}
      </div>
      
      <Separator className="my-6" />
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b pb-px mb-6">
          <TabsTrigger value="posts" className="flex items-center">
            <Grid className="h-4 w-4 mr-2" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center">
            <Bookmark className="h-4 w-4 mr-2" />
            <span>Saved</span>
          </TabsTrigger>
          <TabsTrigger value="tagged" className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            <span>Tagged</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-4">
                {isOwnProfile 
                  ? "Share your first post with the world!" 
                  : `${userProfile.displayName} hasn't posted anything yet.`}
              </p>
              
              {isOwnProfile && (
                <Button asChild>
                  <Link to="/create-post">Create Post</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Saved Posts</h3>
          <p className="text-gray-500 mb-4">
            {isOwnProfile 
              ? "Posts you save will appear here." 
              : "This tab is only visible to the account owner."}
          </p>
        </TabsContent>
        
        <TabsContent value="tagged" className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Tagged Posts</h3>
          <p className="text-gray-500 mb-4">
            When people tag you in posts, they'll appear here.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
