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

    // Firestore doesn't allow `undefined` values.
    // We explicitly remove the productPreview field if it's undefined
    // to prevent runtime errors when replying to older conversations.
    if (dataToSend.productPreview === undefined) {
        delete dataToSend.productPreview;
    }

    const messagesCollectionRef = collection(db, 'messages');
    await addDoc(messagesCollectionRef, dataToSend);
}

/**
 * Fetches all messages for a user.
 * It avoids server-side sorting to prevent complex index requirements and potential permission errors.
 * All sorting is handled on the client-side.
 * @returns A promise that resolves to an array of messages.
 */
export async function getMessagesForUser(user: UserProfile): Promise<Message[]> {
    const messagesCollectionRef = collection(db, 'messages');
    let q;

    if (user.type === 'seller') {
        // For sellers, query all messages and sort on the client to avoid indexing issues.
        q = query(messagesCollectionRef);
    } else {
        // For buyers, we also query without sorting to avoid needing a composite index.
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

    // Always sort messages on the client by creation date for consistent display
    messages.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

    return messages;
}

/**
 * Marks a specific list of messages as read by their document IDs.
 * This is an optimized version that uses the already-fetched messages to avoid extra reads.
 * @param messageIds An array of message document IDs to update.
 * @param allMessages The full list of messages in the current scope to check against.
 */
export async function markMessagesAsReadByIds(messageIds: string[], allMessages: Message[]) {
     if (messageIds.length === 0) {
        return;
    }
    
    // We get all the current conversation messages to avoid another Firestore query.
    // We only update messages that are actually unread.
    const messagesToUpdate = allMessages.filter(m => messageIds.includes(m.id) && !m.isRead);

    if(messagesToUpdate.length === 0) {
        return;
    }

    const batch = writeBatch(db);
    messagesToUpdate.forEach(msg => {
        const docRef = doc(db, 'messages', msg.id);
        batch.update(docRef, { isRead: true });
    });
    
    await batch.commit();
}
