
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  MessageCircle, 
  Search, 
  PlusSquare, 
  Bell, 
  User as UserIcon,
  LogOut,
  Moon,
  Settings,
  Video,
  Map,
  Image,
  FileText,
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Search, label: "Explore" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/friends", icon: Users, label: "Friends" },
  ];
  
  // Added quick access feature items for better visibility
  const featuredItems = [
    { path: "/pdf-editor", icon: FileText, label: "PDF Editor" },
    { path: "/generate-image", icon: Image, label: "Generate Image" },
    { path: "/call", icon: Phone, label: "Call" },
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Successfully logged out", {
        description: "You have been signed out of your account",
        icon: "👋"
      });
    } catch (error: any) {
      toast.error("Logout failed", {
        description: error.message
      });
    }
  };
  
  if (!currentUser) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  // Group dropdown items for better organization
  const creationItems = [
    { path: "/create-post", icon: PlusSquare, label: "Create Post" },
    { path: "/generate-image", icon: Image, label: "Generate Image" },
    { path: "/pdf-editor", icon: FileText, label: "PDF Editor" },
  ];
  
  const communicationItems = [
    { path: "/video-call", icon: Video, label: "Video Call" },
    { path: "/location-share", icon: Map, label: "Location Sharing" },
    { path: "/call", icon: Phone, label: "Call" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:top-0 md:bottom-auto md:border-b md:border-t-0 dark:bg-gray-900 dark:border-gray-800">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16.016v-8.032a1.984 1.984 0 0 0-1.984-1.984H7.984A1.984 1.984 0 0 0 6 7.984v8.032a1.984 1.984 0 0 0 1.984 1.984h8.032A1.984 1.984 0 0 0 18 16.016Z" />
                <path d="M18 7.984 6 16.016" />
              </svg>
            </div>
            <span className="text-xl font-bold">VortexSocial</span>
          </Link>
        </div>
        
        <div className="flex-1 justify-center md:flex-none">
          <nav className="flex items-center justify-between md:justify-start md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 md:px-3 md:py-2 md:flex-row md:space-x-2 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "text-primary bg-primary-foreground/10"
                    : "text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Featured items navigation */}
        <div className="hidden md:flex items-center space-x-2 mr-4">
          {featuredItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "outline"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center gap-1"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Create Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="hidden md:flex"
              >
                <PlusSquare className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Create</DropdownMenuLabel>
              {creationItems.map((item) => (
                <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                  <item.icon className="w-4 h-4 mr-2" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications Button - for better usability */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hidden md:flex"
            onClick={() => {
              toast.info("Notifications", {
                description: "You have no new notifications",
                icon: "🔔"
              });
            }}
          >
            <Bell className="w-5 h-5" />
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative rounded-full" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile?.photoURL || undefined} />
                  <AvatarFallback>{getInitials(userProfile?.displayName || currentUser.displayName || "")}</AvatarFallback>
                </Avatar>
                
                {userProfile?.isOnline && (
                  <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-1 ring-white"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userProfile?.displayName || currentUser.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email || currentUser.phoneNumber}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* User Profile */}
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate(`/profile/${currentUser.uid}`)}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              {/* Content Creation */}
              <DropdownMenuLabel>Create</DropdownMenuLabel>
              <DropdownMenuGroup>
                {creationItems.map((item) => (
                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              {/* Communication */}
              <DropdownMenuLabel>Connect</DropdownMenuLabel>
              <DropdownMenuGroup>
                {communicationItems.map((item) => (
                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              
              {/* Settings */}
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Moon className="w-4 h-4 mr-2" />
                <span>Dark Mode</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Logout */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Quick Actions Bar (featuring PDF Editor and other tools) */}
      <div className="md:hidden border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 py-2 px-4">
        <div className="flex items-center justify-between">
          {featuredItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-1 rounded-lg transition-colors flex-1",
                location.pathname === item.path
                  ? "text-primary bg-primary-foreground/10"
                  : "text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
