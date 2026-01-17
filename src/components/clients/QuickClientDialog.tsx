import { useState, useCallback } from "react";
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
import { MaskedInput, CepInput } from "@/components/ui/masked-input";
import { fetchAddressByCep } from "@/lib/cep";
import { toast } from "sonner";

interface QuickClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: { id: string; name: string; phone: string | null; cpf: string | null }) => void;
}

export function QuickClientDialog({ open, onOpenChange, onClientCreated }: QuickClientDialogProps) {
  const { createClient } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const handleCepChange = useCallback(async (maskedValue: string, unmaskedValue: string) => {
    setCep(maskedValue);
    
    if (unmaskedValue.length === 8) {
      setIsFetchingCep(true);
      const addressData = await fetchAddressByCep(unmaskedValue);
      setIsFetchingCep(false);
      
      if (addressData) {
        setAddress(addressData.logradouro || address);
        setBairro(addressData.bairro || bairro);
        setCity(addressData.localidade || city);
        setState(addressData.uf || state);
        toast.success("Endereço preenchido automaticamente!");
      } else {
        toast.error("CEP não encontrado");
      }
    }
  }, [address, bairro, city, state]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setCpf("");
    setCep("");
    setAddress("");
    setNumero("");
    setBairro("");
    setCity("");
    setState("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const client = await createClient({
        name: name.trim(),
        phone: phone || null,
        cpf: cpf || null,
        cep: cep || null,
        address: address || null,
        numero: numero || null,
        bairro: bairro || null,
        city: city || null,
        state: state || null,
      } as any);
      
      if (client) {
        onClientCreated(client);
        onOpenChange(false);
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="quick-name">Nome *</Label>
              <Input 
                id="quick-name" 
                placeholder="Nome do cliente"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="quick-phone">Telefone</Label>
              <MaskedInput 
                id="quick-phone" 
                mask="(00) 00000-0000"
                placeholder="(00) 00000-0000"
                value={phone}
                onAccept={(value) => setPhone(value)}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="quick-cpf">CPF</Label>
              <MaskedInput 
                id="quick-cpf" 
                mask="000.000.000-00"
                placeholder="000.000.000-00"
                value={cpf}
                onAccept={(value) => setCpf(value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-cep">CEP</Label>
              <div className="relative">
                <CepInput
                  id="quick-cep"
                  placeholder="00000-000"
                  value={cep}
                  onAccept={handleCepChange}
                />
                {isFetchingCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-address">Logradouro</Label>
              <Input 
                id="quick-address" 
                placeholder="Rua/Avenida"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-numero">Número</Label>
              <Input 
                id="quick-numero" 
                placeholder="Ex: 123"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-bairro">Bairro</Label>
              <Input 
                id="quick-bairro" 
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-city">Cidade</Label>
              <Input 
                id="quick-city" 
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quick-state">Estado</Label>
              <Input 
                id="quick-state" 
                placeholder="UF"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
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