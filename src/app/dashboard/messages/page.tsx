
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getMessagesForOrder, getAllConversationsForUser, sendMessage } from "@/lib/message-service-client";
import type { Message, Conversation } from "@/lib/types";
import Loading from "../loading";
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";

function MessagesPageComponent() {
  const { user, isLoading: isAuthLoading, setUnreadMessagesCount } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingComponent, setIsLoadingComponent] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const loadConversations = useCallback(async () => {
      if (!user) return;
      setIsLoadingComponent(true);
      try {
          const convos = await getAllConversationsForUser(user);
          setConversations(convos);
          const totalUnread = convos.reduce((sum, c) => sum + c.unreadCount, 0);
          setUnreadMessagesCount(totalUnread);

          const orderIdFromParams = searchParams.get('orderId');
          if (orderIdFromParams && convos.some(c => c.orderId === orderIdFromParams)) {
              setSelectedOrderId(orderIdFromParams);
          } else if (convos.length > 0 && !selectedOrderId) {
              setSelectedOrderId(convos[0].orderId);
          }

      } catch (error) {
          console.error("Failed to load conversations", error);
          if (error instanceof FirebaseError && error.code === 'permission-denied') {
             toast({ title: 'Permission Refusée', description: 'Vérifiez vos règles de sécurité Firestore.', variant: 'destructive'});
          } else {
             toast({ title: 'Erreur de chargement', description: 'Impossible de charger les conversations.', variant: 'destructive'});
          }
      } finally {
          setIsLoadingComponent(false);
      }
  }, [user, toast, setUnreadMessagesCount, searchParams, selectedOrderId]);
  
  useEffect(() => {
    if (!isAuthLoading && user) {
        loadConversations();
    }
  }, [user, isAuthLoading, loadConversations]);


  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedOrderId || !user) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const messagesForOrder = await getMessagesForOrder(selectedOrderId, user.type);
        setMessages(messagesForOrder);

        const convo = conversations.find(c => c.orderId === selectedOrderId);
        if (convo && convo.unreadCount > 0) {
            const updatedConversations = conversations.map(c => 
                c.orderId === selectedOrderId ? {...c, unreadCount: 0} : c
            );
            setConversations(updatedConversations);
            const totalUnread = updatedConversations.reduce((sum, c) => sum + c.unreadCount, 0);
            setUnreadMessagesCount(totalUnread);
        }

      } catch (error) {
        console.error("Error loading messages:", error);
        toast({ title: 'Erreur', description: 'Impossible de charger les messages pour cette conversation.', variant: 'destructive'});
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (selectedOrderId) {
        loadMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrderId, user, toast, setUnreadMessagesCount]);

  const handleSendReply = async () => {
    const selectedConversation = conversations.find(c => c.orderId === selectedOrderId);
    if (!replyText.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    
    const originalMessage = messages[0] ?? conversations.find(c => c.orderId === selectedOrderId)?.lastMessage;

    if (!originalMessage) {
       toast({ title: "Erreur", description: "Impossible de trouver la conversation d'origine.", variant: "destructive"});
       setIsSending(false);
       return;
    }

    const messageData: Omit<Message, 'id' | 'isRead' | 'createdAt'> = {
        orderId: selectedConversation.orderId,
        orderNumber: selectedConversation.orderNumber,
        buyerId: originalMessage.buyerId,
        buyerName: originalMessage.buyerName,
        buyerEmail: originalMessage.buyerEmail,
        subject: `Re: Commande ${selectedConversation.orderNumber}`,
        body: replyText,
        sender: user.type,
        productPreview: selectedConversation.productPreview,
    };
    
    const textToSend = replyText;
    setReplyText("");
        
    try {
        const tempMessage: Message = {
            ...messageData,
            id: `temp-${Date.now()}`,
            body: textToSend,
            isRead: true,
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
            sender: user.type,
        };
        setMessages(prev => [...prev, tempMessage]);
        
        await sendMessage(messageData);
        // Do not reload all conversations, just update the last message display
        setConversations(prevConvos => prevConvos.map(c => {
          if (c.orderId === selectedOrderId) {
            return {
              ...c,
              lastMessage: {
                ...c.lastMessage,
                body: textToSend,
                createdAt: tempMessage.createdAt,
              }
            }
          }
          return c;
        }).sort((a,b) => (b.lastMessage.createdAt?.seconds || 0) - (a.lastMessage.createdAt?.seconds || 0)))

    } catch (error) {
        console.error("Failed to send reply:", error);
        toast({
          title: "Erreur d'envoi",
          description: "Votre message n'a pas pu être envoyé.",
          variant: 'destructive',
        });
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        setReplyText(textToSend); // Restore text on failure
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
  
  const selectedConversation = conversations.find(c => c.orderId === selectedOrderId);

  if (isAuthLoading || isLoadingComponent) {
    return <Loading />;
  }
  
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="mt-4 text-lg font-medium">Accès non autorisé</h3>
            <p className="text-sm text-muted-foreground">Veuillez vous connecter pour accéder à la messagerie.</p>
        </div>
    )
  }
  
  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
       <CardHeader>
        <CardTitle>Messagerie</CardTitle>
        <CardDescription>Consultez et répondez aux messages concernant vos commandes.</CardDescription>
      </CardHeader>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 border-t overflow-hidden">
        <ScrollArea className="md:col-span-1 xl:col-span-1 border-r h-full">
            <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Aucune conversation.</div>
            ) : (
                conversations.map(convo => (
                    <button 
                        key={convo.orderId} 
                        onClick={() => setSelectedOrderId(convo.orderId)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1",
                            selectedOrderId === convo.orderId ? 'bg-muted' : 'hover:bg-muted/50',
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm truncate">{convo.otherPartyName}</p>
                             {convo.unreadCount > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center">{convo.unreadCount}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Cde: {convo.orderNumber}</p>
                        {convo.productPreview && user?.type === 'seller' && (
                            <p className="text-xs text-muted-foreground truncate italic">
                                {convo.productPreview}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">{convo.lastMessage?.body || 'Commencez la conversation...'}</p>
                    </button>
                ))
            )}
            </div>
        </ScrollArea>

        <div className="md:col-span-2 xl:col-span-3 flex flex-col bg-muted/20">
            {selectedConversation ? (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b flex items-center gap-4 bg-background flex-shrink-0">
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
                        {isLoadingMessages && <div className="flex justify-center items-center h-full"><Loading /></div>}
                        {!isLoadingMessages && messages.map((msg, index) => (
                            <div key={msg.id || index} className={cn("flex items-end gap-2", msg.sender === user?.type ? 'justify-end' : 'justify-start')}>
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
                    <div className="p-4 border-t bg-background flex-shrink-0">
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
                </div>
            ) : (
                 !isLoadingComponent && conversations.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">Sélectionnez une conversation</h3>
                        <p className="text-sm text-muted-foreground">Choisissez une conversation dans la liste de gauche pour afficher les messages.</p>
                    </div>
                ) : !isLoadingComponent && (
                     <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <MessageSquare className="h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">Aucun message</h3>
                        <p className="text-sm text-muted-foreground">Vous n'avez pas encore de conversation.</p>
                    </div>
                )
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

    