
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, MapPin, Clock, Users, Share2, User } from "lucide-react";

export default function LocationShare() {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [sharingDuration, setSharingDuration] = useState(60); // minutes
  const [activeTab, setActiveTab] = useState("share");
  const [friends, setFriends] = useState<any[]>([]);
  const [sharedLocations, setSharedLocations] = useState<any[]>([]);
  
  const { currentUser, userProfile } = useAuth();

  // Fetch friends list
  useEffect(() => {
    if (!currentUser) return;
    
    // In a real app, you would fetch friends from Firestore
    const fetchFriends = async () => {
      // Simulated friends list
      const demoFriends = [
        {
          id: "friend1",
          displayName: "John Doe",
          photoURL: null,
          isOnline: true,
          isSharing: false
        },
        {
          id: "friend2",
          displayName: "Sarah Smith",
          photoURL: null,
          isOnline: true,
          isSharing: true,
          location: { lat: 37.7749, lng: -122.4194 }, // San Francisco
          sharingUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 min from now
        },
        {
          id: "friend3",
          displayName: "Mike Johnson",
          photoURL: null,
          isOnline: false,
          isSharing: false
        }
      ];
      
      setFriends(demoFriends);
      
      // Set shared locations based on friends who are sharing
      const locations = demoFriends
        .filter(friend => friend.isSharing)
        .map(friend => ({
          id: friend.id,
          displayName: friend.displayName,
          photoURL: friend.photoURL,
          location: friend.location,
          sharingUntil: friend.sharingUntil
        }));
      
      setSharedLocations(locations);
    };
    
    fetchFriends();
  }, [currentUser]);

  // Request and track location
  useEffect(() => {
    if (!isLocationEnabled) return;
    
    let watchId: number;
    
    const getLocation = () => {
      if (!navigator.geolocation) {
        toast({
          title: "Error",
          description: "Geolocation is not supported by your browser",
          variant: "destructive"
        });
        setIsLocationEnabled(false);
        return;
      }
      
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Error",
            description: `Could not get your location: ${error.message}`,
            variant: "destructive"
          });
          setIsLocationEnabled(false);
        },
        { enableHighAccuracy: true }
      );
    };
    
    getLocation();
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isLocationEnabled]);

  const handleToggleLocation = (enabled: boolean) => {
    setIsLocationEnabled(enabled);
    
    if (enabled) {
      toast({
        title: "Location Enabled",
        description: "Your location is now being tracked"
      });
    } else {
      toast({
        title: "Location Disabled",
        description: "Location tracking has been turned off"
      });
      setLocation(null);
    }
  };

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleShareLocation = () => {
    if (!location) {
      toast({
        title: "Error",
        description: "Unable to get your location. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedFriends.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one friend to share with",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would store this in Firestore
    
    const selectedFriendNames = friends
      .filter(friend => selectedFriends.includes(friend.id))
      .map(friend => friend.displayName)
      .join(", ");
    
    toast({
      title: "Location Shared",
      description: `Your location is now shared with ${selectedFriendNames} for ${sharingDuration} minutes`
    });
    
    // Reset selection
    setSelectedFriends([]);
    setActiveTab("map");
  };

  const formatTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now();
    
    if (diff <= 0) {
      return "Expired";
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`;
    }
    
    return `${minutes}m remaining`;
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  return (
    <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="share" className="flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                <span>Share My Location</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>View Map</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="share" className="p-6 min-h-[600px]">
            <div className="max-w-lg mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-social-primary" />
                    <h2 className="text-xl font-semibold">Share My Location</h2>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="location-toggle"
                      checked={isLocationEnabled}
                      onCheckedChange={handleToggleLocation}
                    />
                    <Label htmlFor="location-toggle" className="text-sm">
                      {isLocationEnabled ? "On" : "Off"}
                    </Label>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg mb-6 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {isLocationEnabled 
                      ? location 
                        ? `Your current location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                        : "Getting your location..."
                      : "Enable location sharing to continue"}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-social-primary" />
                  <h3 className="font-medium">Sharing Duration</h3>
                </div>
                
                <div className="space-y-6">
                  <Slider
                    value={[sharingDuration]}
                    min={15}
                    max={360}
                    step={15}
                    onValueChange={(value) => setSharingDuration(value[0])}
                    disabled={!isLocationEnabled}
                  />
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>15 min</span>
                    <span>1 hour</span>
                    <span>6 hours</span>
                  </div>
                  
                  <div className="text-center font-medium text-lg">
                    {sharingDuration < 60 
                      ? `${sharingDuration} minutes` 
                      : `${Math.floor(sharingDuration / 60)} hours ${sharingDuration % 60 ? `${sharingDuration % 60} min` : ""}`}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-social-primary" />
                    <h3 className="font-medium">Share With</h3>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-social-primary">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Select All</span>
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${
                        selectedFriends.includes(friend.id)
                          ? "border-social-primary bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => handleToggleFriend(friend.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={friend.photoURL} />
                            <AvatarFallback>{getInitials(friend.displayName)}</AvatarFallback>
                          </Avatar>
                          
                          {friend.isOnline && (
                            <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-1 ring-white dark:ring-gray-800"></span>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium">{friend.displayName}</p>
                          <p className="text-xs text-gray-500">
                            {friend.isSharing
                              ? "Already sharing location"
                              : friend.isOnline
                              ? "Online"
                              : "Offline"}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedFriends.includes(friend.id)
                          ? "bg-social-primary border-social-primary"
                          : "border-gray-300 dark:border-gray-600"
                      }`}>
                        {selectedFriends.includes(friend.id) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                className="w-full"
                disabled={!isLocationEnabled || selectedFriends.length === 0}
                onClick={handleShareLocation}
              >
                Share My Location
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="map" className="min-h-[600px]">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-social-primary" />
                <h2 className="text-xl font-semibold">Location Map</h2>
              </div>
              
              <div className="bg-gray-200 rounded-lg h-[400px] mb-6 flex items-center justify-center dark:bg-gray-700">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p>Map would be displayed here</p>
                  <p className="text-sm text-gray-500">
                    In a real implementation, this would show a map with shared locations
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium flex items-center space-x-2">
                  <User className="h-5 w-5 text-social-primary" />
                  <span>Shared With You</span>
                </h3>
                
                {sharedLocations.length > 0 ? (
                  <div className="space-y-2">
                    {sharedLocations.map((shared) => (
                      <div 
                        key={shared.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={shared.photoURL} />
                            <AvatarFallback>{getInitials(shared.displayName)}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <p className="font-medium">{shared.displayName}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatTimeRemaining(shared.sharingUntil)}</span>
                            </p>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>View</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No shared locations right now</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
