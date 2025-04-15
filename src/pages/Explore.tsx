
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type User = {
  id: string;
  displayName: string;
  photoURL: string;
  username?: string;
  bio?: string;
};

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, limit(20));
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[];
        
        // Filter out current user
        const filteredUsers = fetchedUsers.filter(user => user.id !== currentUser?.uid);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const allUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      // Filter users based on search query (client-side filtering for simplicity)
      const searchResults = allUsers.filter(user => 
        user.id !== currentUser?.uid && 
        (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.username?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
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
            placeholder="Search users by name or username"
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
              <Sparkles className="h-4 w-4 mr-2" />
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
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium">{user.displayName}</h3>
                            {user.username && (
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            )}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => {
                            toast.success(`Follow request sent to ${user.displayName}`, {
                              description: "You'll be notified when they accept",
                              icon: "👋"
                            });
                          }}>
                            Follow
                          </Button>
                        </div>
                        {user.bio && (
                          <p className="text-sm mt-2 text-muted-foreground">{user.bio}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            <div className="py-10 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Trending content coming soon!</h3>
              <p className="text-muted-foreground">Check back later for trending topics and posts</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
