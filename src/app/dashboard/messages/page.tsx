'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getMessagesForSeller, markMessageAsRead } from "@/lib/message-service-client";
import type { Message } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Loading from "../loading";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MessagesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || user.type !== 'seller') {
      router.replace('/dashboard');
      return;
    }

    const fetchMessages = async () => {
      try {
        const fetchedMessages = await getMessagesForSeller();
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user, isAuthLoading, router]);

  const handleOpenMessage = async (messageId: string, isRead: boolean) => {
    if (!isRead) {
      await markMessageAsRead(messageId);
      // Optimistically update the UI
      setMessages(prevMessages => 
        prevMessages.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg)
      );
    }
  };

  if (isAuthLoading || isLoading) {
    return <Loading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Boîte de réception</CardTitle>
        <CardDescription>Consultez les messages envoyés par les acheteurs.</CardDescription>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-center">
            <p className="text-lg text-muted-foreground">Votre boîte de réception est vide.</p>
            <p className="text-sm text-muted-foreground">Les nouveaux messages des clients apparaîtront ici.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {messages.map((message) => (
              <AccordionItem value={message.id} key={message.id}>
                <AccordionTrigger 
                  className={`flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 ${!message.isRead ? 'bg-primary/5' : ''}`}
                  onClick={() => handleOpenMessage(message.id, message.isRead)}
                >
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {!message.isRead && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        <p className={`font-semibold ${!message.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                           {message.buyerName} <span className="font-normal text-muted-foreground">({message.orderNumber})</span>
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                         {message.createdAt ? format(new Date(message.createdAt.seconds * 1000), 'd MMMM yyyy', { locale: fr }) : ''}
                      </p>
                    </div>
                    <p className={`text-sm font-medium ${!message.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{message.subject}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pl-12 bg-muted/30">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{message.body}</p>
                   <a href={`mailto:${message.buyerEmail}?subject=RE: Votre message concernant la commande ${message.orderNumber}`} className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">
                      Répondre par email
                    </a>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
