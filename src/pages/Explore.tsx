
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy, where, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Sparkles, TrendingUp, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';

type User = {
  id: string;
  displayName: string;
  photoURL: string;
  username?: string;
  bio?: string;
  isOnline?: boolean;
};

type Post = {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  likes: number;
  comments: number;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
};

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Setup real-time listeners for users
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const fetchedUsers = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[];
        
        // Filter out current user
        const filteredUsers = fetchedUsers.filter(user => user.id !== currentUser.uid);
        setUsers(filteredUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users', {
          description: 'Please check your connection and try again',
          icon: '⚠️'
        });
        setLoading(false);
      }
    }, (error) => {
      console.error('Error with user listener:', error);
      toast.error('Connection issue', {
        description: 'Real-time updates interrupted. Try refreshing the page.',
        icon: '🔄'
      });
      setLoading(false);
    });

    // Get trending posts
    const postsRef = collection(firestore, 'posts');
    const postsQuery = query(postsRef, orderBy('likes', 'desc'), limit(5));
    
    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
      try {
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        
        setTrendingPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      }
    });

    return () => {
      unsubscribe();
      postsUnsubscribe();
    };
  }, [currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const usersRef = collection(firestore, 'users');
      const q = query(
        usersRef, 
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      
      const searchResults = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
      
      // Filter out current user
      const filteredResults = searchResults.filter(user => user.id !== currentUser?.uid);
      
      setUsers(filteredResults);
      
      if (filteredResults.length === 0) {
        toast.info('No users found', {
          description: 'Try a different search term',
          icon: '🔍'
        });
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed', {
        description: 'Please try again',
        icon: '⚠️'
      });
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string, username: string) => {
    if (!currentUser) return;
    
    try {
      // In a real app, update Firestore with follow relationship
      toast.success(`Following ${username}`, {
        description: "You'll now see their posts in your feed",
        icon: "👋",
        duration: 3000
      });
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user', {
        description: 'Please try again',
        icon: '⚠️'
      });
    }
  };

  const getInitials = (name?: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 pb-24 md:pb-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Explore</h1>
          <span className="text-sm text-muted-foreground">Find new connections</span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search users by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        <Tabs defaultValue="people" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="people">
              <Users className="h-4 w-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="mt-0">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.length > 0 ? (
                  users.map(user => (
                    <Card key={user.id} className="hover:bg-accent/50 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Link to={`/profile/${user.id}`}>
                            <Avatar className="h-12 w-12 relative">
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                              {user.isOnline && (
                                <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                              )}
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <Link to={`/profile/${user.id}`} className="hover:underline">
                              <h3 className="font-medium">{user.displayName}</h3>
                            </Link>
                            {user.username && (
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => followUser(user.id, user.displayName)}
                            >
                              Follow
                            </Button>
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                toast.success(`Message sent to ${user.displayName}`, {
                                  description: "Check your messages for their response",
                                  icon: "💬"
                                });
                              }}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {user.bio && (
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{user.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No users found</h3>
                    <p className="text-muted-foreground mt-1">Try searching for someone else</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            {trendingPosts.length > 0 ? (
              <div className="space-y-4">
                {trendingPosts.map(post => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.authorPhotoURL} />
                          <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.authorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      
                      <p className="mb-3">{post.content}</p>
                      
                      {post.imageUrl && (
                        <div className="relative rounded-md overflow-hidden mb-3 aspect-video">
                          <img 
                            src={post.imageUrl} 
                            alt="Post" 
                            className="object-cover w-full h-full" 
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-4">❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No trending posts yet</h3>
                <p className="text-muted-foreground">Be the first to create popular content!</p>
                <Button className="mt-4" asChild>
                  <Link to="/create-post">Create a Post</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
