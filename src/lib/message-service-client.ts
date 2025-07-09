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
        // The seller query is simple and does not require a composite index.
        q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    } else {
        // For buyers, we remove the `orderBy` clause to avoid the need for a composite index.
        // We will sort the results on the client-side instead.
        q = query(messagesCollectionRef, where('buyerId', '==', user.uid));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }

    const messages = snapshot.docs.map(doc => {
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

    // If the user is a buyer, we need to sort the messages manually.
    if (user.type === 'buyer') {
        messages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }

    return messages;
}

/**
 * Marks a specific list of messages as read by their document IDs.
 * @param messageIds An array of message document IDs to update.
 */
export async function markMessagesAsReadByIds(messageIds: string[]) {
    if (messageIds.length === 0) {
        return;
    }

    const batch = writeBatch(db);
    messageIds.forEach(id => {
        const docRef = doc(db, 'messages', id);
        batch.update(docRef, { isRead: true });
    });
    
    await batch.commit();
}
