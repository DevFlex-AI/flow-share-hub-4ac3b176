
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  or,
  and
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  createdAt: any;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  lastMessageSenderId: string;
  createdAt: any;
  updatedAt: any;
}

export const createConversation = async (userId1: string, userId2: string): Promise<string> => {
  // Create conversation ID from sorted user IDs
  const conversationId = [userId1, userId2].sort().join('_');
  
  const conversationRef = doc(firestore, "conversations", conversationId);
  const conversationDoc = await getDoc(conversationRef);
  
  if (!conversationDoc.exists()) {
    await setDoc(conversationRef, {
      participants: [userId1, userId2],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  return conversationId;
};

export const sendMessage = async (
  senderId: string, 
  receiverId: string, 
  text: string
): Promise<void> => {
  const conversationId = await createConversation(senderId, receiverId);
  
  // Add message
  await addDoc(collection(firestore, "messages"), {
    text,
    senderId,
    receiverId,
    conversationId,
    createdAt: serverTimestamp(),
    read: false
  });
  
  // Update conversation
  const conversationRef = doc(firestore, "conversations", conversationId);
  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    lastMessageSenderId: senderId,
    updatedAt: serverTimestamp()
  });
};

export const getMessages = (
  conversationId: string, 
  callback: (messages: Message[]) => void
) => {
  const messagesQuery = query(
    collection(firestore, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(messages);
  });
};

export const getUserConversations = (
  userId: string,
  callback: (conversations: any[]) => void
) => {
  const conversationsQuery = query(
    collection(firestore, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );
  
  return onSnapshot(conversationsQuery, async (snapshot) => {
    const conversationsWithUserInfo = await Promise.all(
      snapshot.docs.map(async (docSnapshot) => {
        const conversationData = docSnapshot.data();
        const otherUserId = conversationData.participants.find((id: string) => id !== userId);
        
        // Get other user's info
        const userDoc = await getDoc(doc(firestore, "users", otherUserId));
        const userData = userDoc.data();
        
        return {
          id: docSnapshot.id,
          ...conversationData,
          otherUser: {
            id: otherUserId,
            displayName: userData?.displayName || "Unknown User",
            photoURL: userData?.photoURL || null,
            isOnline: userData?.isOnline || false
          }
        };
      })
    );
    
    callback(conversationsWithUserInfo);
  });
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const messagesQuery = query(
    collection(firestore, "messages"),
    where("conversationId", "==", conversationId),
    where("receiverId", "==", userId),
    where("read", "==", false)
  );
  
  const snapshot = await getDocs(messagesQuery);
  const updatePromises = snapshot.docs.map(doc => 
    updateDoc(doc.ref, { read: true })
  );
  
  await Promise.all(updatePromises);
};
