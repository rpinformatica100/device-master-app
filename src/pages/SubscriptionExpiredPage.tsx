import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageCircle, LogOut } from "lucide-react";

export default function SubscriptionExpiredPage() {
  const { signOut } = useAuth();

  const whatsappUrl = "https://wa.me/5500000000000?text=Olá! Gostaria de renovar minha assinatura do TechOS.";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Assinatura Inativa</h1>
          <p className="text-muted-foreground">
            Sua assinatura do TechOS expirou ou ainda não foi ativada. 
            Entre em contato via WhatsApp para contratar ou renovar seu plano.
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar no WhatsApp
            </a>
          </Button>

          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
