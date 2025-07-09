import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Message, SerializableTimestamp } from '@/lib/types';

/**
 * Sends a message from the buyer to the seller.
 * @param messageData The message data to send.
 */
export async function sendMessageFromBuyer(messageData: Omit<Message, 'id' | 'sender' | 'isRead' | 'createdAt'>) {
    const messagesCollectionRef = collection(db, 'messages');
    await addDoc(messagesCollectionRef, {
        ...messageData,
        sender: 'buyer',
        isRead: false,
        createdAt: serverTimestamp()
    });
}

/**
 * Fetches all messages for the seller, ordered by creation date.
 * @returns A promise that resolves to an array of messages.
 */
export async function getMessagesForSeller(): Promise<Message[]> {
    const messagesCollectionRef = collection(db, 'messages');
    const q = query(
        messagesCollectionRef, 
        orderBy('createdAt', 'desc')
    );
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
 * Marks a specific message as read.
 * @param messageId The ID of the message to update.
 */
export async function markMessageAsRead(messageId: string) {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { isRead: true });
}
