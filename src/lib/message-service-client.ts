
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, Timestamp, where, writeBatch } from 'firebase/firestore';
import type { Message, UserProfile, Conversation } from '@/lib/types';

const messagesCollectionRef = collection(db, 'messages');

/**
 * Sends a new message to Firestore.
 * @param messageData The message data to be sent.
 */
export async function sendMessage(messageData: Omit<Message, 'id' | 'isRead' | 'createdAt'>): Promise<void> {
    const dataToSend: { [key: string]: any } = {
        ...messageData,
        isRead: false,
        createdAt: serverTimestamp()
    };
    // Ensure optional fields are not sent as 'undefined'
    if (dataToSend.productPreview === undefined) {
        delete dataToSend.productPreview;
    }
    await addDoc(messagesCollectionRef, dataToSend);
}

/**
 * Fetches all messages for a specific order and marks them as read by the current user.
 * @param orderId The ID of the order to fetch messages for.
 * @param currentUserType The type of the current user ('buyer' or 'seller').
 * @returns A promise that resolves to an array of messages.
 */
export async function getMessagesForOrder(orderId: string, currentUserType: 'buyer' | 'seller'): Promise<Message[]> {
    // Query without orderBy to avoid needing a composite index.
    const q = query(messagesCollectionRef, where('orderId', '==', orderId));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const messages: Message[] = [];
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAtTimestamp = data.createdAt as Timestamp | null;
        
        const message: Message = {
            id: doc.id,
            ...data,
            createdAt: createdAtTimestamp ? {
                seconds: createdAtTimestamp.seconds,
                nanoseconds: createdAtTimestamp.nanoseconds,
            } : { seconds: Date.now() / 1000, nanoseconds: 0 }, // Fallback for optimistic updates
        } as Message;
        
        messages.push(message);

        // Mark as read only if the message was not sent by the current user and is unread
        if (!message.isRead && message.sender !== currentUserType) {
            batch.update(doc.ref, { isRead: true });
        }
    });
    
    await batch.commit();

    // Sort messages by date on the client-side
    messages.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

    return messages;
}


/**
 * Fetches all unique conversations for a user, respecting Firestore security rules.
 * @param user The current user profile.
 * @returns A promise that resolves to an array of conversation summaries.
 */
export async function getAllConversationsForUser(user: UserProfile): Promise<Conversation[]> {
    let q;
    // The query must align with firestore.rules
    if (user.type === 'seller') {
        // Seller can read all messages. We order them by date to group them later.
        q = query(messagesCollectionRef, orderBy('createdAt', 'desc'));
    } else {
        // Buyer can ONLY list messages where they are the buyer.
        // We do NOT add orderBy to comply with simple security rules without composite indexes.
        q = query(messagesCollectionRef, where('buyerId', '==', user.uid));
    }
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    let messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

    // For buyers, sort messages client-side since we couldn't do it in the query.
    if(user.type === 'buyer') {
        messages.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }

    const groupedConversations = messages.reduce((acc, msg) => {
        if (!acc[msg.orderId]) {
            acc[msg.orderId] = {
                orderId: msg.orderId,
                orderNumber: msg.orderNumber,
                otherPartyName: user.type === 'seller' ? msg.buyerName : 'Única Stock',
                lastMessage: msg,
                unreadCount: 0,
                productPreview: msg.productPreview,
            };
        }
        if (!msg.isRead && msg.sender !== user.type) {
            acc[msg.orderId].unreadCount += 1;
        }
        // Ensure the latest message is always stored
        if ((msg.createdAt?.seconds || 0) > (acc[msg.orderId].lastMessage.createdAt?.seconds || 0)) {
            acc[msg.orderId].lastMessage = msg;
        }
        if (msg.productPreview) {
             acc[msg.orderId].productPreview = msg.productPreview
        }

        return acc;
    }, {} as Record<string, Conversation>);

    return Object.values(groupedConversations).sort((a,b) => (b.lastMessage.createdAt?.seconds || 0) - (a.lastMessage.createdAt?.seconds || 0));
}
