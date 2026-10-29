import {
  collection,
  doc,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';

import { auth, db } from '../firebase/config';

// Get all registered users except the currently signed-in user
export async function getOtherUsers() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('You must be logged in to view users.');
  }

  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  return snapshot.docs
    .map((userDoc) => ({
      uid: userDoc.id,
      ...userDoc.data(),
    }))
    .filter((user) => user.uid !== currentUser.uid);
}

// Find an existing one-to-one conversation or create one
export async function getOrCreateConversation(otherUserId) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('You must be logged in to start a conversation.');
  }

  if (!otherUserId || otherUserId === currentUser.uid) {
    throw new Error('Please select another user.');
  }

  // Sort IDs so both users calculate the same conversation ID
  const participants = [currentUser.uid, otherUserId].sort();
  const conversationId = participants.join('_');

  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnapshot = await getDoc(conversationRef);

  if (!conversationSnapshot.exists()) {
    await setDoc(conversationRef, {
      participants,
      lastMessage: '',
      updatedAt: serverTimestamp(),
    });
  }

  return conversationId;
}


/**
 * Send a message to a conversation.
 */
export async function sendMessage(conversationId, text) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('You must be logged in to send messages.');
  }

  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('Message cannot be empty.');
  }

  if (trimmedText.length > 2000) {
    throw new Error('Message cannot exceed 2000 characters.');
  }

  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );

  await addDoc(messagesRef, {
    senderId: currentUser.uid,
    text: trimmedText,
    createdAt: serverTimestamp(),
  });

  const conversationRef = doc(db, 'conversations', conversationId);

  await setDoc(
    conversationRef,
    {
      lastMessage: trimmedText,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Listen for messages and return an unsubscribe function.
 */
export function listenToMessages(conversationId, callback, onError) {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );

  const messagesQuery = query(
    messagesRef,
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((messageDoc) => ({
        id: messageDoc.id,
        ...messageDoc.data(),
      }));

      callback(messages);
    },
    (error) => {
      console.error('Failed to listen to messages:', error);

      if (onError) {
        onError(error);
      }
    }
  );
}

