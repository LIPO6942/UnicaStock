

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
 * Fetches all messages for a specific order and marks them as read.
 * This function is safe for both buyers and sellers due to Firestore rules.
 * @param orderId The ID of the order to fetch messages for.
 * @returns A promise that resolves to an array of messages for the specified order.
 */
export async function getMessagesForOrder(orderId: string): Promise<Message[]> {
    const messagesCollectionRef = collection(db, 'messages');
    const q = query(messagesCollectionRef, where('orderId', '==', orderId), orderBy('createdAt', 'asc'));
    
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
            } : { seconds: 0, nanoseconds: 0 },
        } as Message;
    });

    // Mark messages as read
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        if (!doc.data().isRead) {
            batch.update(doc.ref, { isRead: true });
        }
    });
    await batch.commit();

    return messages;
}


/**
 * Fetches all unique conversations for a user.
 * This is now more efficient as it fetches all messages and groups them client-side.
 * @param user The current user profile.
 * @returns A promise that resolves to an array of conversation summaries.
 */
export async function getAllConversationsForUser(user: UserProfile): Promise<any[]> {
    const messagesCollectionRef = collection(db, 'messages');
    let q;

    if (user.type === 'seller') {
        q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    } else {
        q = query(messagesCollectionRef, where('buyerId', '==', user.uid), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

    const grouped = messages.reduce((acc, msg) => {
        if (!acc[msg.orderId]) {
            acc[msg.orderId] = {
                orderId: msg.orderId,
                orderNumber: msg.orderNumber,
                otherPartyName: user.type === 'seller' ? msg.buyerName : 'Ùnica Cosmétiques',
                lastMessage: msg,
                unreadCount: 0,
                productPreview: msg.productPreview,
            };
        }
        if (!msg.isRead && msg.sender !== user.type) {
            acc[msg.orderId].unreadCount += 1;
        }
        // Ensure the productPreview is from the latest message that has one
        if (msg.productPreview) {
             acc[msg.orderId].productPreview = msg.productPreview
        }

        return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
}

    