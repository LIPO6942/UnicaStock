
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
 * The query is adapted based on user type to comply with Firestore rules.
 * @param user The current user profile.
 * @returns A promise that resolves to an array of conversation summaries.
 */
export async function getAllConversationsForUser(user: UserProfile): Promise<any[]> {
    const messagesCollectionRef = collection(db, 'messages');
    let q;

    if (user.type === 'seller') {
        // Seller can read all messages and order them.
        q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    } else {
        // KEY CHANGE: Buyer can only read messages where they are the buyer.
        // We MUST remove orderBy to avoid needing a composite index and to comply with security rules.
        // Sorting will be done client-side. The `where` clause is critical for the security rule.
        q = query(messagesCollectionRef, where('buyerId', '==', user.uid));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    let messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

    // Sort client-side for buyers as we can't do it in the query.
    if(user.type === 'buyer') {
        messages.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }

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
        if (msg.productPreview) {
             acc[msg.orderId].productPreview = msg.productPreview
        }

        return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a,b) => (b.lastMessage.createdAt?.seconds || 0) - (a.lastMessage.createdAt?.seconds || 0));
}
