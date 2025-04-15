
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { firestore, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Image as ImageIcon, MapPin, Calendar, AtSign, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (!text.trim() && !image) {
      toast({
        title: "Error",
        description: "Please add some text or an image to your post",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      let imageUrl = null;
      
      // Upload image if there is one
      if (image) {
        const storageRef = ref(storage, `posts/${currentUser.uid}/${Date.now()}-${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading image:", error);
            toast({
              title: "Error",
              description: "Failed to upload image. Please try again.",
              variant: "destructive"
            });
            setLoading(false);
          },
          async () => {
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create post document
            await addPostToFirestore(imageUrl);
          }
        );
      } else {
        // Create post without image
        await addPostToFirestore(null);
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const addPostToFirestore = async (imageUrl: string | null) => {
    try {
      const postData = {
        userId: currentUser!.uid,
        text: text.trim(),
        imageUrl,
        location: location.trim() || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        likeCount: 0,
        commentCount: 0
      };
      
      await addDoc(collection(firestore, "posts"), postData);
      
      toast({
        title: "Success",
        description: "Your post has been published!"
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error adding post to Firestore:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto pb-20 pt-4 md:pt-20 px-4">
      <div className="bg-white rounded-lg shadow p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Create Post</h1>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.photoURL || undefined} />
            <AvatarFallback>
              {userProfile?.displayName?.charAt(0) || currentUser?.displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <span className="font-medium">
              {userProfile?.displayName || currentUser?.displayName || "User"}
            </span>
            
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{location || "Add location"}</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Textarea
              placeholder={`What's on your mind, ${userProfile?.displayName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || "there"}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[120px] resize-none"
            />
          </div>
          
          {imagePreview && (
            <div className="relative mb-4">
              <img 
                src={imagePreview} 
                alt="Post preview" 
                className="w-full h-auto rounded-lg max-h-[300px] object-contain bg-gray-100" 
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">
                Uploading: {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
          
          <div className="flex items-center mb-4">
            <Input
              type="text"
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-3 pb-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              <ImageIcon className="h-5 w-5 mr-2 text-green-500" />
              <span>Add Photo</span>
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              className="flex items-center"
            >
              <Video className="h-5 w-5 mr-2 text-red-500" />
              <span>Add Video</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="flex items-center"
            >
              <AtSign className="h-5 w-5 mr-2 text-social-primary" />
              <span>Tag People</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="flex items-center"
            >
              <Calendar className="h-5 w-5 mr-2 text-orange-500" />
              <span>Schedule</span>
            </Button>
          </div>
          
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={loading || (!text.trim() && !image)}
          >
            {loading ? "Publishing..." : "Publish Post"}
          </Button>
        </form>
      </div>
    </div>
  );
}
