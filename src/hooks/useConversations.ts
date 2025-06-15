
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserConversations } from '@/services/messageService';

export const useConversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = getUserConversations(currentUser.uid, (fetchedConversations) => {
      setConversations(fetchedConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { conversations, loading };
};
