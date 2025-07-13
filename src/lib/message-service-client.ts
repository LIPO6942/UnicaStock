
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, updateDoc, Timestamp, where, writeBatch } from 'firebase/firestore';
import type { Message, UserProfile } from '@/lib/types';

/**
 * Sends a message. It cleans up undefined fields before sending to Firestore.
 * @param messageData The message data to send.
 */
export async function sendMessage(messageData: Omit<Message, 'id' | 'isRead' | 'createdAt'>) {
    const dataToSend: { [key: string]: any } = {
        ...messageData,
        isRead: false,
        createdAt: serverTimestamp()
    };

    if (dataToSend.productPreview === undefined) {
        delete dataToSend.productPreview;
    }

    const messagesCollectionRef = collection(db, 'messages');
    await addDoc(messagesCollectionRef, dataToSend);
}

/**
 * Fetches all messages relevant to a user.
 * For sellers, it fetches all messages. For buyers, it fetches only messages where they are the buyer.
 * @param user The current user profile.
 * @returns A promise that resolves to an array of messages.
 */
export async function getMessagesForUser(user: UserProfile): Promise<Message[]> {
    const messagesCollectionRef = collection(db, 'messages');
    let q;

    if (user.type === 'seller') {
        // Seller can read all messages and sort them directly via query
        q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    } else {
        // Buyer can only read messages where they are the buyerId.
        // We remove orderBy to avoid needing a composite index, which is a common
        // cause for permission errors if the rules are simple. Sorting will be done client-side.
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
            } : { seconds: 0, nanoseconds: 0 }, // Provide a default if null
        } as Message
    });

    // Sort client-side for consistency, especially for the buyer.
    messages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

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
