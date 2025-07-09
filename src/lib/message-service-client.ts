import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, updateDoc, Timestamp, where, writeBatch } from 'firebase/firestore';
import type { Message, UserProfile } from '@/lib/types';

/**
 * Sends a message.
 * @param messageData The message data to send.
 */
export async function sendMessage(messageData: Omit<Message, 'id' | 'isRead' | 'createdAt'>) {
    const messagesCollectionRef = collection(db, 'messages');
    await addDoc(messagesCollectionRef, {
        ...messageData,
        isRead: false,
        createdAt: serverTimestamp()
    });
}

/**
 * Fetches all messages for a user, grouped by order to form conversations.
 * @returns A promise that resolves to an array of messages.
 */
export async function getMessagesForUser(user: UserProfile): Promise<Message[]> {
    const messagesCollectionRef = collection(db, 'messages');
    let q;

    if (user.type === 'seller') {
        q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    } else {
        q = query(messagesCollectionRef, where('buyerId', '==', user.uid), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp | null;
        return {
            id: doc.id,
            ...data,
            createdAt: createdAtTimestamp ? {
                seconds: createdAtTimestamp.seconds,
                nanoseconds: createdAtTimestamp.nanoseconds,
            } : null,
        } as Message
    });
}

/**
 * Marks all messages in a conversation as read for the current user.
 * @param orderId The ID of the order, which identifies the conversation.
 * @param currentUserType The type of the user marking messages as read ('buyer' or 'seller').
 */
export async function markConversationAsRead(orderId: string, currentUserType: 'buyer' | 'seller') {
    const messagesCollectionRef = collection(db, 'messages');
    const senderTypeToMark = currentUserType === 'buyer' ? 'seller' : 'buyer';
    
    const q = query(
        messagesCollectionRef, 
        where('orderId', '==', orderId),
        where('sender', '==', senderTypeToMark),
        where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
}
