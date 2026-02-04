import { Button } from "@/components/ui/button";
import { Client } from "@/types/database";
import { Edit, Trash2, User, Building2, Phone, Mail, MapPin, Eye } from "lucide-react";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onView?: (client: Client) => void;
  compact?: boolean;
}

export function ClientCard({ client, onEdit, onDelete, onView, compact = false }: ClientCardProps) {
  const isCompany = client.client_type === "pessoa_juridica";
  
  const formatAddress = () => {
    const parts = [];
    if (client.address) parts.push(client.address);
    if (client.numero) parts.push(client.numero);
    if (client.bairro) parts.push(client.bairro);
    if (client.city && client.state) parts.push(`${client.city}/${client.state}`);
    return parts.join(", ");
  };

  const handleCardClick = () => {
    if (onView) {
      onView(client);
    }
  };

  if (compact) {
    return (
      <div 
        className="glass rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={handleCardClick}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {isCompany ? (
            <Building2 className="w-4 h-4 text-primary" />
          ) : (
            <User className="w-4 h-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{client.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {client.phone || client.email || (isCompany && client.cnpj) || client.cpf || "Sem contato"}
          </p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onView && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(client)}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(client)}>
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-destructive" 
            onClick={() => onDelete(client)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass rounded-lg p-3 space-y-2 cursor-pointer hover:bg-secondary/30 transition-colors"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {isCompany ? (
              <Building2 className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{client.name}</p>
            {(client.cpf || client.cnpj) && (
              <p className="text-[10px] text-muted-foreground">
                {isCompany && client.cnpj ? `CNPJ: ${client.cnpj}` : client.cpf ? `CPF: ${client.cpf}` : null}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 text-[10px]">
        {client.phone && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="w-3 h-3 shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {(client.address || client.city) && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{formatAddress()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
        {onView && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onView(client)}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(client)}>
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-destructive" 
          onClick={() => onDelete(client)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
