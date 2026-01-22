import { Button } from "@/components/ui/button";
import { Client } from "@/types/database";
import { Edit, Trash2, User, Building2, Phone, Mail, MapPin } from "lucide-react";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  compact?: boolean;
}

export function ClientCard({ client, onEdit, onDelete, compact = false }: ClientCardProps) {
  const isCompany = client.client_type === "pessoa_juridica";
  
  const formatAddress = () => {
    const parts = [];
    if (client.address) parts.push(client.address);
    if (client.numero) parts.push(client.numero);
    if (client.bairro) parts.push(client.bairro);
    if (client.city && client.state) parts.push(`${client.city}/${client.state}`);
    return parts.join(", ");
  };

  if (compact) {
    return (
      <div className="glass rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {isCompany ? (
            <Building2 className="w-5 h-5 text-primary" />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{client.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {client.phone || client.email || (isCompany && client.cnpj) || client.cpf || "Sem contato"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(client)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive" 
            onClick={() => onDelete(client)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {isCompany ? (
              <Building2 className="w-5 h-5 text-primary" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{client.name}</p>
            {(client.cpf || client.cnpj) && (
              <p className="text-xs text-muted-foreground">
                {isCompany && client.cnpj ? `CNPJ: ${client.cnpj}` : client.cpf ? `CPF: ${client.cpf}` : null}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 text-sm">
        {client.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {(client.address || client.city) && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{formatAddress()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/50">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(client)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-destructive" 
          onClick={() => onDelete(client)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
