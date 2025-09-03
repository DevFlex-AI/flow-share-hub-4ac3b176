import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Video, 
  Download, 
  Share2, 
  Calendar,
  Grid3X3,
  List,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  sentBy: string;
  conversationId: string;
  duration?: number; // for videos
}

interface MediaGalleryProps {
  mediaItems?: MediaItem[];
  conversationId?: string;
  currentUser?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  mediaItems = [],
  conversationId,
  currentUser
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>(mediaItems);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let filtered = mediaItems;

    // Filter by conversation if specified
    if (conversationId) {
      filtered = filtered.filter(item => item.conversationId === conversationId);
    }

    // Filter by date if specified
    if (selectedDate !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedDate) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => 
        new Date(item.uploadedAt) >= filterDate
      );
    }

    setFilteredItems(filtered);
  }, [mediaItems, conversationId, selectedDate]);

  const groupedByDate = filteredItems.reduce((groups, item) => {
    const date = new Date(item.uploadedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, MediaItem[]>);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadMedia = async (item: MediaItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${item.fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download media",
        variant: "destructive"
      });
    }
  };

  const shareMedia = (item: MediaItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.fileName,
        url: item.url
      });
    } else {
      navigator.clipboard.writeText(item.url);
      toast({
        title: "Link copied",
        description: "Media link copied to clipboard"
      });
    }
  };

  const MediaCard = ({ item }: { item: MediaItem }) => (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-lg border hover:shadow-md transition-shadow"
      onClick={() => setSelectedMedia(item)}
    >
      <div className="aspect-square">
        {item.type === 'image' ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={item.url}
              poster={item.thumbnailUrl}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="bg-white/90 rounded-full p-2">
                <Play className="h-6 w-6 text-black" />
              </div>
            </div>
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              downloadMedia(item);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              shareMedia(item);
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const MediaListItem = ({ item }: { item: MediaItem }) => (
    <div
      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
      onClick={() => setSelectedMedia(item)}
    >
      <div className="w-12 h-12 rounded overflow-hidden shrink-0">
        {item.type === 'image' ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full bg-muted flex items-center justify-center">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.fileName}</h4>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{formatFileSize(item.size)}</span>
          <span>•</span>
          <span>{item.sentBy === currentUser ? 'You' : item.sentBy}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true })}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Badge variant={item.type === 'image' ? 'default' : 'secondary'}>
          {item.type === 'image' ? <ImageIcon className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
          {item.type}
        </Badge>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            downloadMedia(item);
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            shareMedia(item);
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const images = filteredItems.filter(item => item.type === 'image');
  const videos = filteredItems.filter(item => item.type === 'video');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Media Gallery</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
              </select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
              <TabsTrigger value="photos">Photos ({images.length})</TabsTrigger>
              <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {viewMode === 'grid' ? (
                Object.entries(groupedByDate).map(([date, items]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{date}</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {items.map((item) => (
                        <MediaCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <MediaListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="photos">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {images.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((item) => (
                    <MediaListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="videos">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {videos.map((item) => (
                    <MediaCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {videos.map((item) => (
                    <MediaListItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No media found</h3>
              <p className="text-muted-foreground">
                Share photos and videos to see them here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Viewer Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedMedia && (
            <div className="relative">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.fileName}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              ) : (
                <div className="relative">
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-auto max-h-[80vh]"
                    autoPlay
                  />
                </div>
              )}
              
              {/* Media info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white">
                  <h3 className="font-semibold mb-1">{selectedMedia.fileName}</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>{formatFileSize(selectedMedia.size)}</span>
                    <span>•</span>
                    <span>
                      {selectedMedia.sentBy === currentUser ? 'You' : selectedMedia.sentBy}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(selectedMedia.uploadedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadMedia(selectedMedia)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => shareMedia(selectedMedia)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};