import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MessagesPage() {
  const messages = [
    {
      id: 1,
      sender: "Créations BellePeau",
      subject: "Question sur l'huile d'argan",
      preview: "Bonjour, je voudrais savoir si votre huile d'argan est désodorisée...",
      time: "2h",
      unread: true,
    },
    {
      id: 2,
      sender: "Artisan Savonnier",
      subject: "RE: Commande #3208",
      preview: "Merci pour votre rapidité, colis bien reçu !",
      time: "1j",
      unread: false,
    },
     {
      id: 3,
      sender: "Cosmétique Naturelle SA",
      subject: "Demande de devis pour 50kg de beurre de karité",
      preview: "Bonjour, nous souhaiterions obtenir un devis pour une commande en gros...",
      time: "3j",
      unread: false,
    },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
            {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer hover:bg-muted/50 ${message.unread ? 'bg-muted/50' : ''}`}>
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${message.sender.charAt(0)}`} alt={message.sender} data-ai-hint="person" />
                        <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <p className={`font-semibold ${message.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{message.sender}</p>
                            <p className="text-xs text-muted-foreground">{message.time}</p>
                        </div>
                        <p className={`text-sm font-medium ${message.unread ? 'text-foreground' : 'text-muted-foreground'}`}>{message.subject}</p>
                        <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
