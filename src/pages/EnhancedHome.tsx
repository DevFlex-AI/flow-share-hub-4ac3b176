import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { StoryViewer } from '@/components/StoryViewer';
import { CreatePostWidget } from '@/components/CreatePostWidget';
import { NewsFeed } from '@/components/NewsFeed';
import { NotificationCenter } from '@/components/NotificationCenter';
import { FriendsWidget } from '@/components/FriendsWidget';
// import { VortexAIChat } from '@/components/VortexAIChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, ShoppingBag, Users, MessageSquareText } from 'lucide-react';

export default function EnhancedHome() {
  const { currentUser, userProfile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to VortexSocial</h2>
          <p className="text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - User Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-social-primary to-social-accent rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {userProfile?.display_name?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <h3 className="font-semibold text-lg">
                    {userProfile?.display_name || 'User'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {currentUser.email}
                  </p>
                  <div className="flex justify-center space-x-4 mt-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold">0</p>
                      <p className="text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">0</p>
                      <p className="text-muted-foreground">Friends</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">0</p>
                      <p className="text-muted-foreground">Following</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                  <Badge variant="secondary" className="ml-auto">2</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                  <Badge variant="secondary" className="ml-auto">5</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Groups
                  <Badge variant="secondary" className="ml-auto">3</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquareText className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['#VortexSocial', '#TechNews', '#AI', '#WebDev', '#React'].map((tag, index) => (
                    <div key={tag} className="flex items-center justify-between text-sm">
                      <span className="text-social-primary hover:underline cursor-pointer">
                        {tag}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.floor(Math.random() * 1000) + 100}k
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <StoryViewer />
            <CreatePostWidget onPostCreated={handlePostCreated} />
            
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed">For You</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
              <TabsContent value="feed" className="space-y-6">
                <NewsFeed key={refreshKey} />
              </TabsContent>
              <TabsContent value="following" className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Follow people to see their posts</h3>
                  <p>Start following friends and creators to see their content here.</p>
                </div>
              </TabsContent>
              <TabsContent value="trending" className="space-y-6">
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Trending content coming soon</h3>
                  <p>Discover what's popular and trending in your network.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Notifications & Friends */}
          <div className="lg:col-span-1 space-y-6">
            <NotificationCenter />
            <FriendsWidget />
            
            {/* AI Chat Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquareText className="h-5 w-5" />
                  <span>AI Assistant</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquareText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">AI Chat coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}