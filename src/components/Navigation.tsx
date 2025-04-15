
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
  Image
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
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Search, label: "Explore" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/friends", icon: Users, label: "Friends" },
  ];
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  if (!currentUser) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:top-0 md:bottom-auto md:border-b md:border-t-0 dark:bg-gray-900 dark:border-gray-800">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-social-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16.016v-8.032a1.984 1.984 0 0 0-1.984-1.984H7.984A1.984 1.984 0 0 0 6 7.984v8.032a1.984 1.984 0 0 0 1.984 1.984h8.032A1.984 1.984 0 0 0 18 16.016Z" />
                <path d="M18 7.984 6 16.016" />
              </svg>
            </div>
            <span className="text-xl font-bold">SocialConnect</span>
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
                    ? "text-social-primary"
                    : "text-gray-500 hover:text-social-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <item.icon className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/create-post")}
            className="hidden md:flex"
          >
            <PlusSquare className="w-5 h-5" />
          </Button>
          
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userProfile?.displayName || currentUser.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate(`/profile/${currentUser.uid}`)}>
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/create-post")}>
                  <PlusSquare className="w-4 h-4 mr-2" />
                  <span>Create Post</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/video-call")}>
                  <Video className="w-4 h-4 mr-2" />
                  <span>Video Call</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/location-share")}>
                  <Map className="w-4 h-4 mr-2" />
                  <span>Location Sharing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/generate-image")}>
                  <Image className="w-4 h-4 mr-2" />
                  <span>Generate Image</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Moon className="w-4 h-4 mr-2" />
                  <span>Dark Mode</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
