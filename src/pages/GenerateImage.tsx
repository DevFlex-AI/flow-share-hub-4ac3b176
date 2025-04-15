
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { 
  Sparkles, 
  Download, 
  Share2, 
  ImagePlus, 
  RefreshCw, 
  PlusCircle, 
  Trash2,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This is a UI-only placeholder component. In a real app, it would connect to the Gemini API.
export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("natural");
  const [ratio, setRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("create");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const { currentUser } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an image",
        variant: "destructive"
      });
      return;
    }
    
    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would call the Gemini API
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Placeholder generated image (random placeholder from Unsplash)
      const placeholderImageUrl = `https://source.unsplash.com/random/800x800?${encodeURIComponent(prompt)}`;
      
      const newGeneration = {
        id: Date.now().toString(),
        prompt,
        style,
        ratio,
        imageUrl: placeholderImageUrl,
        createdAt: new Date()
      };
      
      setGeneratedImages([newGeneration]);
      setGenerationHistory(prev => [newGeneration, ...prev]);
      
      toast({
        title: "Image Generated",
        description: "Your image has been successfully created"
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would securely store the API key
    
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved"
    });
    
    setShowApiKeyInput(false);
  };

  const handleDownload = (imageUrl: string) => {
    // In a real app, this would download the image
    window.open(imageUrl, '_blank');
  };

  const handleShare = (image: any) => {
    // In a real app, this would prepare the image for sharing in a post
    toast({
      title: "Ready to Share",
      description: "Image ready to share in a new post"
    });
    
    // Navigate to create post page with image
    window.location.href = "/create-post";
  };

  const clearGeneratedImages = () => {
    setGeneratedImages([]);
  };

  const removeFromHistory = (id: string) => {
    setGenerationHistory(prev => prev.filter(item => item.id !== id));
  };

  const styleOptions = [
    { value: "natural", label: "Natural" },
    { value: "3d-render", label: "3D Render" },
    { value: "anime", label: "Anime" },
    { value: "digital-art", label: "Digital Art" },
    { value: "photographic", label: "Photographic" },
    { value: "cinematic", label: "Cinematic" },
    { value: "cartoon", label: "Cartoon" }
  ];

  const ratioOptions = [
    { value: "1:1", label: "Square (1:1)" },
    { value: "4:3", label: "Landscape (4:3)" },
    { value: "16:9", label: "Widescreen (16:9)" },
    { value: "3:4", label: "Portrait (3:4)" },
    { value: "9:16", label: "Mobile (9:16)" }
  ];

  return (
    <div className="container max-w-4xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="create" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Create Image</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Generate Image with AI</h2>
              <p className="text-gray-500">
                Enter a detailed description of the image you want to create
              </p>
            </div>
            
            {showApiKeyInput ? (
              <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg dark:border-amber-900 dark:bg-amber-900/20">
                <h3 className="font-medium mb-2">Enter Gemini API Key</h3>
                <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
                  You need to provide a Gemini API key to generate images. This key will be securely stored.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">Gemini API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowApiKeyInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveApiKey}>
                      Save API Key
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate in detail..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style" className="mt-1">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {styleOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="ratio">Aspect Ratio</Label>
                    <Select value={ratio} onValueChange={setRatio}>
                      <SelectTrigger id="ratio" className="mt-1">
                        <SelectValue placeholder="Select ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {ratioOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      <span>Generate Image</span>
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-gray-500 text-center">
                  <button 
                    onClick={() => setShowApiKeyInput(true)}
                    className="text-blue-500 hover:underline"
                  >
                    Change API Key
                  </button>
                </div>
              </div>
            )}
            
            {generatedImages.length > 0 && (
              <>
                <Separator className="my-6" />
                
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">Generated Images</h3>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearGeneratedImages}
                  >
                    <X className="h-4 w-4 mr-2" />
                    <span>Clear</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="rounded-lg overflow-hidden border dark:border-gray-700">
                      <div className="relative aspect-square">
                        <img
                          src={image.imageUrl}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-3">
                        <p className="text-sm mb-3 line-clamp-2">{image.prompt}</p>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownload(image.imageUrl)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            <span>Download</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleShare(image)}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Share</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Generation History</h2>
              <p className="text-gray-500">
                Your previously generated images
              </p>
            </div>
            
            {generationHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generationHistory.map((image) => (
                  <div key={image.id} className="rounded-lg overflow-hidden border dark:border-gray-700">
                    <div className="relative aspect-square">
                      <img
                        src={image.imageUrl}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => removeFromHistory(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm mb-2 line-clamp-2">{image.prompt}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        Created {image.createdAt.toLocaleString()}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(image.imageUrl)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span>Download</span>
                        </Button>
                        
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleShare(image)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <ImagePlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Images Yet</h3>
                <p className="text-gray-500 mb-4">
                  Generate your first image to see it here
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>Create New Image</span>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
