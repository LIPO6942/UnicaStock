'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMessagesForUser, markConversationAsRead, sendMessage } from "@/lib/message-service-client";
import type { Message } from "@/lib/types";
import Loading from "../loading";
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Conversation = {
  orderId: string;
  orderNumber: string;
  otherPartyName: string;
  lastMessage?: Message;
  unreadCount: number;
};

function MessagesPageComponent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    const fetchAndSetup = async () => {
      setIsLoading(true);
      const allMessages = await getMessagesForUser(user);
      const grouped = allMessages.reduce((acc, msg) => {
        (acc[msg.orderId] = acc[msg.orderId] || []).push(msg);
        return acc;
      }, {} as Record<string, Message[]>);

      const convos: Conversation[] = Object.values(grouped).map(msgs => {
        const lastMessage = msgs[0];
        const unreadCount = msgs.filter(m => !m.isRead && m.sender !== user.type).length;
        return {
          orderId: lastMessage.orderId,
          orderNumber: lastMessage.orderNumber,
          otherPartyName: user.type === 'seller' ? lastMessage.buyerName : 'Unica Link',
          lastMessage,
          unreadCount,
        };
      });

      setConversations(convos);

      const initialOrderId = searchParams.get('orderId');
      const initialOrderNumber = searchParams.get('orderNumber');

      if (initialOrderId) {
        const existingConvo = convos.find(c => c.orderId === initialOrderId);
        if (existingConvo) {
          handleSelectConversation(existingConvo);
        } else if (user?.type === 'buyer' && initialOrderNumber) {
           const newVirtualConvo: Conversation = {
            orderId: initialOrderId,
            orderNumber: initialOrderNumber,
            otherPartyName: 'Unica Link',
            unreadCount: 0,
          };
          setConversations(prev => [newVirtualConvo, ...prev.filter(c => c.orderId !== newVirtualConvo.orderId)]);
          handleSelectConversation(newVirtualConvo, true);
        }
        router.replace('/dashboard/messages', undefined);
      }

      setIsLoading(false);
    };

    fetchAndSetup();
  }, [user, isAuthLoading]);

  const handleSelectConversation = async (convo: Conversation, isNew: boolean = false) => {
    setSelectedConversation(convo);
    
    if (isNew) {
        setMessages([]);
    } else {
        const allMessages = await getMessagesForUser(user!);
        const convoMessages = allMessages.filter(m => m.orderId === convo.orderId).sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setMessages(convoMessages);
    }
    
    if (convo.unreadCount > 0 && user) {
        try {
            await markConversationAsRead(convo.orderId, user.type);
            setConversations(prev => prev.map(c => c.orderId === convo.orderId ? {...c, unreadCount: 0} : c));
        } catch (error) {
            console.error("Failed to mark conversation as read:", error);
            toast({
                title: 'Erreur de Permission',
                description: "Impossible de marquer la conversation comme lue. Vérifiez que les règles de sécurité Firestore sont à jour.",
                variant: 'destructive'
            });
        }
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
        const subject = messages.length > 0 
            ? `Re: ${messages[0].subject}`
            : `Question sur la commande ${selectedConversation.orderNumber}`;

        const buyerId = user.type === 'buyer' ? user.uid : selectedConversation.lastMessage!.buyerId;
        const buyerName = user.type === 'buyer' ? user.name : selectedConversation.lastMessage!.buyerName;
        const buyerEmail = user.type === 'buyer' ? user.email : selectedConversation.lastMessage!.buyerEmail;

        const messageData: Omit<Message, 'id' | 'isRead' | 'createdAt'> = {
            orderId: selectedConversation.orderId,
            orderNumber: selectedConversation.orderNumber,
            buyerId,
            buyerName,
            buyerEmail,
            subject,
            body: replyText,
            sender: user.type,
        };
        await sendMessage(messageData);
        setReplyText("");
        
        const allMessages = await getMessagesForUser(user!);
        const convoMessages = allMessages.filter(m => m.orderId === selectedConversation.orderId).sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setMessages(convoMessages);

        // This would be a good place to fully refresh the conversation list
        // to update the "last message" preview, but for now we just update the current view.

    } catch (error) {
        console.error("Failed to send reply:", error);
        toast({
          title: "Erreur d'envoi",
          description: "Votre message n'a pas pu être envoyé. Vérifiez vos permissions Firestore.",
          variant: 'destructive',
        });
    } finally {
        setIsSending(false);
    }
  };
  
  const formatMessageDate = (timestamp: any) => {
    if (!timestamp?.seconds) return '';
    const date = new Date(timestamp.seconds * 1000);
    if(isToday(date)) return format(date, 'HH:mm');
    if(isYesterday(date)) return 'Hier';
    return format(date, 'd MMM yyyy', {locale: fr})
  }

  if (isAuthLoading || isLoading) {
    return <Loading />;
  }
  
  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
       <CardHeader>
        <CardTitle>Messagerie</CardTitle>
        <CardDescription>Consultez et répondez aux messages concernant vos commandes.</CardDescription>
      </CardHeader>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 border-t overflow-hidden">
        {/* Conversations List */}
        <ScrollArea className="md:col-span-1 xl:col-span-1 border-r h-full">
            <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Aucune conversation.</div>
            ) : (
                conversations.map(convo => (
                    <button 
                        key={convo.orderId} 
                        onClick={() => handleSelectConversation(convo)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1",
                            selectedConversation?.orderId === convo.orderId ? 'bg-muted' : 'hover:bg-muted/50',
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm truncate">{convo.otherPartyName}</p>
                             {convo.unreadCount > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center">{convo.unreadCount}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Cde: {convo.orderNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{convo.lastMessage?.body || 'Commencez la conversation...'}</p>
                    </button>
                ))
            )}
            </div>
        </ScrollArea>

        {/* Message View */}
        <div className="md:col-span-2 xl:col-span-3 flex flex-col h-full bg-muted/20">
            {selectedConversation ? (
                <>
                <div className="p-4 border-b flex items-center gap-4 bg-background">
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${selectedConversation.otherPartyName.charAt(0)}`} data-ai-hint="person" />
                        <AvatarFallback>{selectedConversation.otherPartyName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{selectedConversation.otherPartyName}</p>
                        <p className="text-sm text-muted-foreground">Commande {selectedConversation.orderNumber}</p>
                    </div>
                </div>
                <ScrollArea className="flex-grow p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-end gap-2", msg.sender === user?.type ? 'justify-end' : 'justify-start')}>
                            {msg.sender !== user?.type && <Avatar className="h-8 w-8"><AvatarFallback>{msg.sender === 'buyer' ? msg.buyerName.charAt(0) : 'V'}</AvatarFallback></Avatar>}
                            <div className={cn(
                                "max-w-xs lg:max-w-md p-3 rounded-2xl",
                                msg.sender === user?.type ? "bg-primary text-primary-foreground rounded-br-none" : "bg-background rounded-bl-none border"
                            )}>
                                <p className="text-sm">{msg.body}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">{formatMessageDate(msg.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
                <div className="p-4 border-t bg-background">
                    <div className="relative">
                        <Textarea 
                            placeholder="Écrivez votre message..." 
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendReply();
                                }
                            }}
                            className="pr-12"
                            rows={1}
                        />
                        <Button 
                            size="icon" 
                            className="absolute right-2 bottom-2 h-8 w-8" 
                            onClick={handleSendReply}
                            disabled={isSending || !replyText.trim()}
                        >
                            <Send className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                     <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
                     <h3 className="mt-4 text-lg font-medium">Sélectionnez une conversation</h3>
                     <p className="text-sm text-muted-foreground">Choisissez une conversation dans la liste de gauche pour afficher les messages.</p>
                </div>
            )}
        </div>
      </div>
    </Card>
  )
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<Loading />}>
            <MessagesPageComponent />
        </Suspense>
    )
}
