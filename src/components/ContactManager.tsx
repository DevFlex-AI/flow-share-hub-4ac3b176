import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { PhoneNumberInput } from './PhoneNumberInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, MessageCircle, Phone, Video, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  avatar_url?: string;
  is_app_user: boolean;
  user_id?: string;
  last_seen?: string;
}

export const ContactManager = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser]);

  const fetchContacts = async () => {
    // Mock contacts data until database tables are created
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'John Doe',
        phone_number: '+1234567890',
        is_app_user: true,
        user_id: 'user1',
        avatar_url: null,
        created_at: new Date().toISOString()
      }
    ];
    setContacts(mockContacts);
  };

  const addContact = async () => {
    if (!currentUser || !newContactName.trim() || !newContactPhone.trim()) return;

    setLoading(true);
    // Mock contact addition
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phone_number: newContactPhone,
      is_app_user: false,
      user_id: currentUser.id,
      avatar_url: null,
      created_at: new Date().toISOString()
    };

    setContacts(prev => [...prev, newContact]);
    
    toast({
      title: "Success", 
      description: `${newContactName} added to contacts`
    });

    setNewContactName('');
    setNewContactPhone('');
    setIsAddDialogOpen(false);
    setLoading(false);
  };

  const startConversation = async (contact: Contact) => {
    if (!currentUser) return;

    try {
      // If it's an app user, create a normal conversation
      if (contact.is_app_user && contact.user_id) {
        const conversationId = [currentUser.id, contact.user_id].sort().join('_');
        
        const { error } = await supabase
          .from('conversations')
          .upsert({
            id: conversationId,
            participant_ids: [currentUser.id, contact.user_id],
            last_message: '',
            last_message_time: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        // Navigate to messages with this conversation
        window.location.href = `/messages?conversation=${conversationId}`;
      } else {
        // For non-app users, create SMS conversation
        const { error } = await supabase
          .from('sms_conversations')
          .insert({
            user_id: currentUser.id,
            phone_number: contact.phone_number,
            contact_name: contact.name,
            last_message: '',
            last_message_time: new Date().toISOString()
          });

        if (error && error.code !== '23505') throw error; // Ignore duplicate errors
        
        // Navigate to SMS messages
        window.location.href = `/messages?phone=${contact.phone_number}`;
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const makeCall = async (contact: Contact, isVideo = false) => {
    try {
      const { error } = await supabase
        .from('calls')
        .insert({
          caller_id: currentUser?.id,
          receiver_phone: contact.phone_number,
          receiver_id: contact.user_id,
          call_type: isVideo ? 'video' : 'audio',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: `${isVideo ? 'Video' : 'Voice'} Call`,
        description: `Calling ${contact.name}...`
      });

      // Here you would integrate with WebRTC or calling service
      // For now, we'll just show a placeholder
      setTimeout(() => {
        toast({
          title: "Call Connected",
          description: `Connected to ${contact.name}`
        });
      }, 2000);
    } catch (error) {
      console.error('Error making call:', error);
      toast({
        title: "Error",
        description: "Failed to make call",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone_number.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contacts</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Contact name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
              <PhoneNumberInput
                value={newContactPhone}
                onChange={setNewContactPhone}
                placeholder="Phone number"
              />
              <Button 
                onClick={addContact} 
                disabled={!newContactName.trim() || !newContactPhone.trim() || loading}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add Contact'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={contact.avatar_url} />
                    <AvatarFallback>
                      {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {contact.is_app_user && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                  {contact.is_app_user && (
                    <p className="text-xs text-green-600">FlowShare User</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startConversation(contact)}
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => makeCall(contact, false)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => makeCall(contact, true)}
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try a different search term' : 'Add your first contact to get started'}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Add Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};