import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Share2, 
  Clock, 
  StopCircle,
  Users,
  Eye,
  EyeOff,
  Target
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  sharedBy: string;
  sharedAt: string;
  expiresAt?: string;
  accuracy?: number;
  isLive?: boolean;
  viewers?: string[];
}

interface LocationSharingProps {
  onLocationShare?: (location: LocationData) => void;
  sharedLocations?: LocationData[];
  currentUser?: string;
}

export const LocationSharing: React.FC<LocationSharingProps> = ({
  onLocationShare,
  sharedLocations = [],
  currentUser = 'You'
}) => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [duration, setDuration] = useState('1h');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position);
        setIsGettingLocation(false);
        toast({
          title: "Location found",
          description: "Your current location has been detected"
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let message = "Failed to get location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location error",
          description: message,
          variant: "destructive"
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const shareCurrentLocation = () => {
    if (!currentLocation || !onLocationShare) return;

    const expiresAt = new Date();
    const hours = parseInt(duration.replace('h', ''));
    expiresAt.setHours(expiresAt.getHours() + hours);

    const locationData: LocationData = {
      id: Date.now().toString(),
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      accuracy: currentLocation.coords.accuracy,
      sharedBy: currentUser,
      sharedAt: new Date().toISOString(),
      expiresAt: duration === 'live' ? undefined : expiresAt.toISOString(),
      isLive: duration === 'live',
      viewers: []
    };

    // Get address from coordinates (reverse geocoding)
    reverseGeocode(locationData.latitude, locationData.longitude)
      .then(address => {
        locationData.address = address;
        onLocationShare(locationData);
      });

    if (duration === 'live') {
      startLiveLocationSharing();
    }

    setShareDialog(false);
    toast({
      title: "Location shared",
      description: duration === 'live' ? "Live location sharing started" : `Location shared for ${duration}`
    });
  };

  const startLiveLocationSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        setIsSharing(true);
        // Here you would send the updated location to the server
      },
      (error) => {
        console.error('Live location error:', error);
        toast({
          title: "Live location error",
          description: "Failed to update live location",
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    setWatchId(id);
    setIsSharing(true);
  };

  const stopLiveLocationSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    toast({
      title: "Live location stopped",
      description: "Live location sharing has been stopped"
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free geocoding service (you might want to use Google Maps API in production)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const openInMaps = (location: LocationData) => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const getDirections = (location: LocationData) => {
    if (!currentLocation) {
      toast({
        title: "Location needed",
        description: "Please enable location access to get directions",
        variant: "destructive"
      });
      return;
    }

    const url = `https://www.google.com/maps/dir/${currentLocation.coords.latitude},${currentLocation.coords.longitude}/${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const shareLocation = (location: LocationData) => {
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Location',
        text: location.address || 'Shared location',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Location link copied to clipboard"
      });
    }
  };

  const LocationCard = ({ location }: { location: LocationData }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium">{location.sharedBy}</h4>
              {location.isLive && (
                <Badge variant="destructive" className="text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(location.sharedAt), { addSuffix: true })}</span>
              </span>
              
              {location.accuracy && (
                <span>±{Math.round(location.accuracy)}m</span>
              )}
              
              {location.viewers && (
                <span className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{location.viewers.length}</span>
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInMaps(location)}
                className="text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                View
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => getDirections(location)}
                className="text-xs"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Directions
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareLocation(location)}
                className="text-xs"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Sharing</span>
            </CardTitle>
            
            {isSharing && (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopLiveLocationSharing}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Live Location
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col space-y-4">
            {!currentLocation ? (
              <Button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                {isGettingLocation ? 'Getting location...' : 'Get Current Location'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Location detected: ±{Math.round(currentLocation.coords.accuracy || 0)}m accuracy
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog open={shareDialog} onOpenChange={setShareDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Your Location</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Share for how long?
                          </label>
                          <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                          >
                            <option value="15m">15 minutes</option>
                            <option value="1h">1 hour</option>
                            <option value="8h">8 hours</option>
                            <option value="live">Live location (until stopped)</option>
                          </select>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {duration === 'live' 
                            ? 'Your location will be shared in real-time until you stop it'
                            : `Your location will be shared for ${duration}`
                          }
                        </div>
                        
                        <Button onClick={shareCurrentLocation} className="w-full">
                          Share Location
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    onClick={() => openInMaps({
                      id: 'current',
                      latitude: currentLocation.coords.latitude,
                      longitude: currentLocation.coords.longitude,
                      sharedBy: 'You',
                      sharedAt: new Date().toISOString()
                    })}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View in Maps
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shared Locations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shared Locations</h3>
          <Badge variant="secondary">
            {sharedLocations.length} locations
          </Badge>
        </div>
        
        {sharedLocations.length > 0 ? (
          <div className="space-y-3">
            {sharedLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No locations shared</h3>
              <p className="text-muted-foreground">
                Share your location to see it here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};