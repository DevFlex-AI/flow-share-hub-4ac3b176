import { supabase } from '@/integrations/supabase/client';

export interface SupabaseMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseConversation {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_message_time: string;
  last_message_sender_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  contact_user_id?: string;
  is_app_user: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface SMSConversation {
  id: string;
  user_id: string;
  phone_number: string;
  contact_name: string;
  last_message: string;
  last_message_time: string;
  created_at: string;
}

// Create or get conversation between two users
export const createConversation = async (userId1: string, userId2: string): Promise<string> => {
  const conversationId = [userId1, userId2].sort().join('_');
  
  const { data, error } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .single();

  if (!data) {
    const { error: insertError } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        participant_ids: [userId1, userId2],
        last_message: '',
        last_message_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) throw insertError;
  }

  return conversationId;
};

// Send a message
export const sendSupabaseMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' = 'text',
  mediaUrl?: string
): Promise<void> => {
  let conversationId: string;
  
  if (receiverId.startsWith('+')) {
    // SMS conversation
    const { data: smsConv, error: smsError } = await supabase
      .from('sms_conversations')
      .select('id')
      .eq('user_id', senderId)
      .eq('phone_number', receiverId)
      .single();

    if (!smsConv) {
      const { data: newSmsConv, error: createError } = await supabase
        .from('sms_conversations')
        .insert({
          user_id: senderId,
          phone_number: receiverId,
          contact_name: receiverId,
          last_message: content,
          last_message_time: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) throw createError;
      conversationId = `sms_${newSmsConv.id}`;
    } else {
      conversationId = `sms_${smsConv.id}`;
    }
  } else {
    // Regular app user conversation
    conversationId = await createConversation(senderId, receiverId);
  }

  // Insert message
  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      conversation_id: conversationId,
      content,
      message_type: messageType,
      media_url: mediaUrl,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) throw error;

  // Update conversation last message
  if (!conversationId.startsWith('sms_')) {
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_time: new Date().toISOString(),
        last_message_sender_id: senderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);
  } else {
    await supabase
      .from('sms_conversations')
      .update({
        last_message: content,
        last_message_time: new Date().toISOString()
      })
      .eq('id', conversationId.replace('sms_', ''));
  }
};

// Get messages for a conversation
export const getSupabaseMessages = async (conversationId: string): Promise<SupabaseMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Get user conversations
export const getUserSupabaseConversations = async (userId: string): Promise<any[]> => {
  // Get regular conversations
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('updated_at', { ascending: false });

  if (convError) throw convError;

  // Get SMS conversations
  const { data: smsConversations, error: smsError } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_time', { ascending: false });

  if (smsError) throw smsError;

  // Combine and format conversations
  const allConversations = [];

  // Process regular conversations
  for (const conv of conversations || []) {
    const otherUserId = conv.participant_ids.find((id: string) => id !== userId);
    
    // Get other user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', otherUserId)
      .single();

    allConversations.push({
      id: conv.id,
      type: 'app',
      otherUser: {
        id: otherUserId,
        display_name: profile?.display_name || 'Unknown User',
        avatar_url: profile?.avatar_url,
        is_online: false
      },
      last_message: conv.last_message,
      last_message_time: conv.last_message_time,
      last_message_sender_id: conv.last_message_sender_id,
      updated_at: conv.updated_at
    });
  }

  // Process SMS conversations
  for (const smsConv of smsConversations || []) {
    allConversations.push({
      id: `sms_${smsConv.id}`,
      type: 'sms',
      otherUser: {
        id: smsConv.phone_number,
        display_name: smsConv.contact_name,
        avatar_url: null,
        is_online: false,
        phone_number: smsConv.phone_number
      },
      last_message: smsConv.last_message,
      last_message_time: smsConv.last_message_time,
      last_message_sender_id: userId,
      updated_at: smsConv.last_message_time
    });
  }

  // Sort by last message time
  return allConversations.sort((a, b) => 
    new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
  );
};

// Mark messages as read
export const markSupabaseMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) throw error;
};

// Add contact
export const addContact = async (
  userId: string,
  name: string,
  phoneNumber: string
): Promise<void> => {
  // Check if phone number belongs to an app user
  const { data: profileData } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .eq('phone_number', phoneNumber)
    .single();

  const { error } = await supabase
    .from('contacts')
    .insert({
      user_id: userId,
      name,
      phone_number: phoneNumber,
      contact_user_id: profileData?.user_id || null,
      is_app_user: !!profileData,
      avatar_url: profileData?.avatar_url || null
    });

  if (error) throw error;
};

// Get user contacts
export const getUserContacts = async (userId: string): Promise<Contact[]> => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw error;
  return data || [];
};

// Subscribe to real-time messages
export const subscribeToMessages = (
  conversationId: string,
  callback: (message: SupabaseMessage) => void
) => {
  return supabase
    .channel(`messages_${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as SupabaseMessage);
      }
    )
    .subscribe();
};

// Subscribe to conversation updates
export const subscribeToConversations = (
  userId: string,
  callback: () => void
) => {
  return supabase
    .channel(`conversations_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations'
      },
      () => {
        callback();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sms_conversations',
        filter: `user_id=eq.${userId}`
      },
      () => {
        callback();
      }
    )
    .subscribe();
};