
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Flag } from "lucide-react";
import { firestore } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ReportPostDialogProps {
  postId: string;
  postContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportPostDialog({ postId, postContent, isOpen, onClose }: ReportPostDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const reasonOptions = [
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "misinformation", label: "Misinformation" },
    { value: "hateSpeech", label: "Hate Speech" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to report content",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit report to Firestore
      await addDoc(collection(firestore, "reports"), {
        postId,
        contentPreview: postContent.substring(0, 100) + (postContent.length > 100 ? "..." : ""),
        contentId: postId,
        reason,
        details,
        reportedBy: currentUser.uid,
        reportedAt: serverTimestamp(),
        status: "pending",
        type: reason
      });

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe. An administrator will review your report."
      });

      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Help us understand why you're reporting this content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="reason">
              Reason
            </Label>
            <div className="col-span-3">
              <Select
                value={reason}
                onValueChange={setReason}
              >
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="details">
              Details
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional details..."
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
