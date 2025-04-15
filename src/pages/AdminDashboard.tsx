
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { 
  Users, UserX, Shield, BarChart2, Settings, Search, 
  Flag, Clock, AlertTriangle, User, Trash2, Ban, CheckCircle, 
  Eye, MessageSquare, FileText
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    reportedContent: 0
  });

  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!currentUser || !userProfile?.isAdmin) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
    }
  }, [currentUser, userProfile, navigate]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(firestore, "users"), orderBy("createdAt", "desc"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          activeUsers: usersData.filter((user: any) => user.isOnline).length
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users data.",
          variant: "destructive"
        });
      }
    };

    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsData);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalPosts: postsData.length
        }));
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to load posts data.",
          variant: "destructive"
        });
      }
    };

    const fetchReports = async () => {
      try {
        const reportsQuery = query(collection(firestore, "reports"), orderBy("createdAt", "desc"));
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData = reportsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReports(reportsData);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          reportedContent: reportsData.length
        }));
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: "Failed to load reports data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && userProfile?.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchReports();
    }
  }, [currentUser, userProfile]);

  // Ban user
  const handleBanUser = async (userId: string) => {
    try {
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, {
        isBanned: true,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? {...user, isBanned: true} : user
      ));
      
      toast({
        title: "User Banned",
        description: "The user has been banned successfully.",
      });
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: "Failed to ban the user.",
        variant: "destructive"
      });
    }
  };

  // Unban user
  const handleUnbanUser = async (userId: string) => {
    try {
      const userRef = doc(firestore, "users", userId);
      await updateDoc(userRef, {
        isBanned: false,
        updatedAt: new Date()
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? {...user, isBanned: false} : user
      ));
      
      toast({
        title: "User Unbanned",
        description: "The user has been unbanned successfully.",
      });
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        title: "Error",
        description: "Failed to unban the user.",
        variant: "destructive"
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete user document
      await deleteDoc(doc(firestore, "users", userId));
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete the user.",
        variant: "destructive"
      });
    }
  };

  // Remove post
  const handleRemovePost = async (postId: string) => {
    if (!confirm("Are you sure you want to remove this post? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete post document
      await deleteDoc(doc(firestore, "posts", postId));
      
      // Update local state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast({
        title: "Post Removed",
        description: "The post has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing post:", error);
      toast({
        title: "Error",
        description: "Failed to remove the post.",
        variant: "destructive"
      });
    }
  };

  // Resolve report
  const handleResolveReport = async (reportId: string) => {
    try {
      const reportRef = doc(firestore, "reports", reportId);
      await updateDoc(reportRef, {
        status: "resolved",
        resolvedAt: new Date(),
        resolvedBy: currentUser?.uid
      });
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId ? {...report, status: "resolved", resolvedAt: new Date(), resolvedBy: currentUser?.uid} : report
      ));
      
      toast({
        title: "Report Resolved",
        description: "The report has been marked as resolved.",
      });
    } catch (error) {
      console.error("Error resolving report:", error);
      toast({
        title: "Error",
        description: "Failed to resolve the report.",
        variant: "destructive"
      });
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber?.includes(searchQuery)
  );

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => 
    post.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Admin Dashboard...</h1>
          <p className="text-gray-500">Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UwuSocial Admin Dashboard</h1>
        <p className="text-gray-500">Manage users, posts, and reports. Monitor site activity.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="h-8 w-8 mr-3 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-3 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Posts</p>
                <h3 className="text-2xl font-bold">{stats.totalPosts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Flag className="h-8 w-8 mr-3 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Reported Content</p>
                <h3 className="text-2xl font-bold">{stats.reportedContent}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Tabs */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users, posts, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full md:w-2/3"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <TabsContent value="users" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>
                Manage users, ban/unban accounts, and delete profiles if necessary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email / Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {searchQuery ? "No users match your search" : "No users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-full h-full p-1 text-gray-500" />
                              )}
                            </div>
                            {user.displayName || "Unknown User"}
                          </div>
                        </TableCell>
                        <TableCell>{user.email || user.phoneNumber || "N/A"}</TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : user.isOnline ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Online</Badge>
                          ) : (
                            <Badge variant="outline">Offline</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.createdAt?.toDate ? 
                            new Date(user.createdAt.toDate()).toLocaleDateString() : 
                            "Unknown"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {user.isBanned ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleUnbanUser(user.id)}
                                className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleBanUser(user.id)}
                                className="text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Review and moderate user-generated content across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {searchQuery ? "No posts match your search" : "No posts found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="truncate">{post.text || "No text content"}</p>
                            {post.imageUrl && (
                              <Badge variant="outline" className="mt-1">
                                <Eye className="h-3 w-3 mr-1" />
                                Has Image
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{post.userId}</TableCell>
                        <TableCell>
                          {post.createdAt?.toDate ? 
                            new Date(post.createdAt.toDate()).toLocaleDateString() : 
                            "Unknown"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Badge variant="outline">
                              {post.likeCount || 0} Likes
                            </Badge>
                            <Badge variant="outline">
                              {post.commentCount || 0} Comments
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRemovePost(post.id)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Reported Content</CardTitle>
              <CardDescription>
                Review and resolve reported content and user complaints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge className={
                            report.type === "harassment" ? "bg-red-100 text-red-800" :
                            report.type === "inappropriate" ? "bg-amber-100 text-amber-800" :
                            report.type === "spam" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }>
                            {report.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.reportedBy}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="truncate">{report.contentPreview || "No content preview"}</p>
                            <p className="text-xs text-gray-500 mt-1">ID: {report.contentId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={report.status === "resolved" ? "outline" : "secondary"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {report.status !== "resolved" && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleResolveReport(report.id)}
                                className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
}
