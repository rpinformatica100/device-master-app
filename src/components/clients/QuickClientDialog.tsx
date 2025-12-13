import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { MaskedInput } from "@/components/ui/masked-input";

interface QuickClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: { id: string; name: string; phone: string | null; cpf: string | null }) => void;
}

export function QuickClientDialog({ open, onOpenChange, onClientCreated }: QuickClientDialogProps) {
  const { createClient } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const client = await createClient({
        name: name.trim(),
        phone: phone || null,
        cpf: cpf || null,
      });
      
      if (client) {
        onClientCreated(client);
        onOpenChange(false);
        // Reset form
        setName("");
        setPhone("");
        setCpf("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Nome *</Label>
            <Input 
              id="quick-name" 
              placeholder="Nome do cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quick-phone">Telefone</Label>
            <MaskedInput 
              id="quick-phone" 
              mask="(00) 00000-0000"
              placeholder="(00) 00000-0000"
              value={phone}
              onAccept={(value) => setPhone(value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quick-cpf">CPF</Label>
            <MaskedInput 
              id="quick-cpf" 
              mask="000.000.000-00"
              placeholder="000.000.000-00"
              value={cpf}
              onAccept={(value) => setCpf(value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cadastrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
