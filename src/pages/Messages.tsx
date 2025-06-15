import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Send, ChevronLeft, Phone, Video, MoreVertical, Image as ImageIcon, Smile, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  getUserConversations, 
  getMessages, 
  sendMessage, 
  markMessagesAsRead,
  Message 
} from "@/services/messageService";
import { toast } from "sonner";

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  // Fetch user conversations
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = getUserConversations(currentUser.uid, (fetchedConversations) => {
      setConversations(fetchedConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;
    
    const unsubscribe = getMessages(selectedConversation.id, (fetchedMessages) => {
      setMessages(fetchedMessages);
      
      // Mark messages as read
      markMessagesAsRead(selectedConversation.id, currentUser.uid);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    return () => unsubscribe();
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
      await sendMessage(
        currentUser.uid, 
        selectedConversation.otherUser.id, 
        messageText
      );
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "U";
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than a day, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  const getUnreadCount = (conversation: any) => {
    return messages.filter(msg => 
      msg.receiverId === currentUser?.uid && 
      !msg.read && 
      msg.conversationId === conversation.id
    ).length;
  };

  return (
    <div className="container mx-auto pb-20 pt-4 md:pt-20 px-4 max-w-5xl">
      <Card className="overflow-hidden h-[calc(100vh-150px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className={cn(
            "border-r border-gray-200 dark:border-gray-700 h-full",
            selectedConversation && "hidden md:block"
          )}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-50 dark:bg-gray-800 rounded-none">
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="active">
                  Active ({filteredConversations.filter(conv => conv.otherUser.isOnline).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="messages" className="m-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto h-[calc(100vh-280px)]">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <span>Loading conversations...</span>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div 
                        key={conversation.id}
                        className={cn(
                          "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                          selectedConversation?.id === conversation.id && "bg-gray-50 dark:bg-gray-800"
                        )}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.otherUser.photoURL} />
                              <AvatarFallback>{getInitials(conversation.otherUser.displayName)}</AvatarFallback>
                            </Avatar>
                            
                            {conversation.otherUser.isOnline && (
                              <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">{conversation.otherUser.displayName}</h3>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessageTime && formatDistanceToNow(conversation.lastMessageTime.toDate(), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-gray-500 truncate">{conversation.lastMessage || "No messages yet"}</p>
                              
                              {getUnreadCount(conversation) > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-social-primary text-white rounded-full">
                                  {getUnreadCount(conversation)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">No conversations found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="active" className="m-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto h-[calc(100vh-280px)]">
                  {filteredConversations
                    .filter(conv => conv.otherUser.isOnline)
                    .map((conversation) => (
                      <div 
                        key={conversation.id}
                        className={cn(
                          "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                          selectedConversation?.id === conversation.id && "bg-gray-50 dark:bg-gray-800"
                        )}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.otherUser.photoURL} />
                              <AvatarFallback>{getInitials(conversation.otherUser.displayName)}</AvatarFallback>
                            </Avatar>
                            
                            <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                          </div>
                          
                          <div>
                            <h3 className="font-medium">{conversation.otherUser.displayName}</h3>
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
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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
                        <AvatarImage src={selectedConversation.otherUser.photoURL} />
                        <AvatarFallback>{getInitials(selectedConversation.otherUser.displayName)}</AvatarFallback>
                      </Avatar>
                      
                      {selectedConversation.otherUser.isOnline && (
                        <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{selectedConversation.otherUser.displayName}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.otherUser.isOnline ? (
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
                        message.senderId === currentUser?.uid ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="flex items-end space-x-2">
                        {message.senderId !== currentUser?.uid && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={selectedConversation.otherUser.photoURL} />
                            <AvatarFallback>{getInitials(selectedConversation.otherUser.displayName)}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={cn(
                            "max-w-xs px-4 py-2 rounded-lg",
                            message.senderId === currentUser?.uid
                              ? "bg-social-primary text-white rounded-br-none"
                              : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
                          )}
                        >
                          <p>{message.text}</p>
                          <div
                            className={cn(
                              "text-xs mt-1",
                              message.senderId === currentUser?.uid
                                ? "text-blue-100"
                                : "text-gray-500"
                            )}
                          >
                            {formatMessageTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Button variant="ghost" size="icon" type="button">
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" type="button">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageText.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 dark:bg-gray-800">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-gray-500 text-center mb-4">
                  Send messages and photos to people on VortexSocial
                </p>
                <Button onClick={() => {}}>Send Message</Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
