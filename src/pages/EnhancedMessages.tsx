import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Send, 
  ChevronLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Image as ImageIcon, 
  Smile, 
  MessageCircle,
  Mic,
  Paperclip,
  MapPin,
  Plus,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  getUserSupabaseConversations, 
  getSupabaseMessages, 
  sendSupabaseMessage, 
  markSupabaseMessagesAsRead,
  SupabaseMessage,
  subscribeToMessages,
  subscribeToConversations
} from "@/services/supabaseMessageService";
import { toast } from "@/components/ui/use-toast";
import { ContactManager } from "@/components/ContactManager";
import { VoiceMessageRecorder } from "@/components/WhatsAppFeatures/VoiceMessages";
import { DocumentSharing } from "@/components/WhatsAppFeatures/DocumentSharing";
import { LocationSharing } from "@/components/WhatsAppFeatures/LocationSharing";

export default function EnhancedMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<SupabaseMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  // Fetch user conversations
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchConversations = async () => {
      try {
        const fetchedConversations = await getUserSupabaseConversations(currentUser.id);
        setConversations(fetchedConversations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to conversation updates
    const subscription = subscribeToConversations(currentUser.id, fetchConversations);

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;
    
    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getSupabaseMessages(selectedConversation.id);
        setMessages(fetchedMessages);
        
        // Mark messages as read
        await markSupabaseMessagesAsRead(selectedConversation.id, currentUser.id);
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = subscribeToMessages(selectedConversation.id, (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation, currentUser]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation || !currentUser) return;
    
    try {
      await sendSupabaseMessage(
        currentUser.id, 
        selectedConversation.otherUser.id, 
        messageText
      );
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob) => {
    if (!selectedConversation || !currentUser) return;

    try {
      // In a real app, you would upload the audio blob to storage first
      // For now, we'll just send a placeholder
      await sendSupabaseMessage(
        currentUser.id,
        selectedConversation.otherUser.id,
        "🎵 Voice message",
        "audio"
      );
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive"
      });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.otherUser.phone_number && conv.otherUser.phone_number.includes(searchQuery))
  );

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than a day, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto pb-20 pt-4 md:pt-20 px-4 max-w-6xl">
      <Card className="overflow-hidden h-[calc(100vh-150px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className={cn(
            "border-r border-border h-full",
            selectedConversation && "hidden md:block"
          )}>
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-muted rounded-none">
                <TabsTrigger value="messages">Chats</TabsTrigger>
                <TabsTrigger value="contacts">
                  <Users className="h-4 w-4 mr-1" />
                  Contacts
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({filteredConversations.filter(conv => conv.otherUser.is_online).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="messages" className="m-0">
                <div className="divide-y divide-border overflow-y-auto h-[calc(100vh-350px)]">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <span>Loading conversations...</span>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div 
                        key={conversation.id}
                        className={cn(
                          "p-4 hover:bg-muted cursor-pointer transition-colors",
                          selectedConversation?.id === conversation.id && "bg-muted"
                        )}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.otherUser.avatar_url} />
                              <AvatarFallback>{getInitials(conversation.otherUser.display_name)}</AvatarFallback>
                            </Avatar>
                            
                            {conversation.otherUser.is_online && (
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-background"></span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">{conversation.otherUser.display_name}</h3>
                              <span className="text-xs text-muted-foreground">
                                {conversation.last_message_time && formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message || "No messages yet"}
                              </p>
                              
                              {conversation.type === 'sms' && (
                                <Badge variant="secondary" className="text-xs">
                                  SMS
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-muted-foreground">No conversations found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="m-0 h-[calc(100vh-350px)] overflow-y-auto">
                <div className="p-4">
                  <ContactManager />
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="m-0">
                <div className="divide-y divide-border overflow-y-auto h-[calc(100vh-350px)]">
                  {filteredConversations
                    .filter(conv => conv.otherUser.is_online)
                    .map((conversation) => (
                      <div 
                        key={conversation.id}
                        className={cn(
                          "p-4 hover:bg-muted cursor-pointer",
                          selectedConversation?.id === conversation.id && "bg-muted"
                        )}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.otherUser.avatar_url} />
                              <AvatarFallback>{getInitials(conversation.otherUser.display_name)}</AvatarFallback>
                            </Avatar>
                            
                            <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-background"></span>
                          </div>
                          
                          <div>
                            <h3 className="font-medium">{conversation.otherUser.display_name}</h3>
                            <p className="text-xs text-green-500">Online</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Messages Section */}
          <div className={cn(
            "col-span-2 flex flex-col h-full",
            !selectedConversation && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={selectedConversation.otherUser.avatar_url} />
                        <AvatarFallback>{getInitials(selectedConversation.otherUser.display_name)}</AvatarFallback>
                      </Avatar>
                      
                      {selectedConversation.otherUser.is_online && (
                        <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-background"></span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{selectedConversation.otherUser.display_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.otherUser.is_online ? (
                          <span className="text-green-500">Online</span>
                        ) : (
                          "Last active recently"
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender_id === currentUser?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="flex items-end space-x-2 max-w-[70%]">
                        {message.sender_id !== currentUser?.id && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={selectedConversation.otherUser.avatar_url} />
                            <AvatarFallback>{getInitials(selectedConversation.otherUser.display_name)}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={cn(
                            "px-4 py-2 rounded-lg break-words",
                            message.sender_id === currentUser?.id
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted rounded-bl-none"
                          )}
                        >
                          {message.message_type === 'audio' ? (
                            <div className="flex items-center space-x-2">
                              <Mic className="h-4 w-4" />
                              <span>Voice message</span>
                            </div>
                          ) : message.media_url ? (
                            <div>
                              {message.message_type === 'image' && (
                                <img src={message.media_url} alt="Shared image" className="rounded max-w-xs" />
                              )}
                              {message.content && <p className="mt-2">{message.content}</p>}
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                          
                          <div
                            className={cn(
                              "text-xs mt-1",
                              message.sender_id === currentUser?.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {formatMessageTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-border">
                  {showVoiceRecorder ? (
                    <VoiceMessageRecorder 
                      onSend={handleSendVoiceMessage}
                      disabled={!selectedConversation}
                    />
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button"
                        onClick={() => setShowAttachments(!showAttachments)}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="flex-1"
                      />
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        type="button"
                        onClick={() => setShowVoiceRecorder(true)}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                      
                      <Button variant="ghost" size="icon" type="button">
                        <Smile className="h-5 w-5" />
                      </Button>
                      
                      <Button type="submit" disabled={!messageText.trim()}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  )}
                  
                  {/* Attachments Panel */}
                  {showAttachments && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-4 gap-4">
                        <Button variant="outline" className="flex flex-col h-16 text-xs">
                          <ImageIcon className="h-6 w-6 mb-1" />
                          Photos
                        </Button>
                        <Button variant="outline" className="flex flex-col h-16 text-xs">
                          <Video className="h-6 w-6 mb-1" />
                          Videos
                        </Button>
                        <Button variant="outline" className="flex flex-col h-16 text-xs">
                          <Paperclip className="h-6 w-6 mb-1" />
                          Files
                        </Button>
                        <Button variant="outline" className="flex flex-col h-16 text-xs">
                          <MapPin className="h-6 w-6 mb-1" />
                          Location
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">FlowShare Messages</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Send messages to anyone, anywhere. Even if they don't have the app.
                </p>
                <Button onClick={() => setActiveTab("contacts")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
