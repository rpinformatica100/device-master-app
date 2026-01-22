import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, User, Loader2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useIsMobile } from "@/hooks/use-mobile";
import { Client } from "@/types/database";
import { ClientCard } from "@/components/shared/ClientCard";
import { CpfInput, PhoneInput, CepInput, CnpjInput } from "@/components/ui/masked-input";
import { fetchAddressByCep } from "@/lib/cep";
import { toast } from "sonner";

export default function ClientsPage() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    client_type: "pessoa_fisica" as "pessoa_fisica" | "pessoa_juridica",
    cpf: "",
    cnpj: "",
    cep: "",
    address: "",
    numero: "",
    complemento: "",
    bairro: "",
    city: "",
    state: "",
    notes: "",
  });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.cpf && client.cpf.includes(searchTerm)) ||
      (client.cnpj && client.cnpj.includes(searchTerm))
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      client_type: "pessoa_fisica",
      cpf: "",
      cnpj: "",
      cep: "",
      address: "",
      numero: "",
      complemento: "",
      bairro: "",
      city: "",
      state: "",
      notes: "",
    });
    setSelectedClient(null);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      client_type: (client.client_type as "pessoa_fisica" | "pessoa_juridica") || "pessoa_fisica",
      cpf: client.cpf || "",
      cnpj: client.cnpj || "",
      cep: client.cep || "",
      address: client.address || "",
      numero: client.numero || "",
      complemento: client.complemento || "",
      bairro: client.bairro || "",
      city: client.city || "",
      state: client.state || "",
      notes: client.notes || "",
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleCepChange = useCallback(async (maskedValue: string, unmaskedValue: string) => {
    setFormData(prev => ({ ...prev, cep: maskedValue }));
    
    if (unmaskedValue.length === 8) {
      setIsFetchingCep(true);
      const address = await fetchAddressByCep(unmaskedValue);
      setIsFetchingCep(false);
      
      if (address) {
        setFormData(prev => ({
          ...prev,
          address: address.logradouro || prev.address,
          bairro: address.bairro || prev.bairro,
          city: address.localidade || prev.city,
          state: address.uf || prev.state,
        }));
        toast.success("Endereço preenchido automaticamente!");
      } else {
        toast.error("CEP não encontrado");
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, formData);
      } else {
        await createClient(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    setIsSubmitting(true);
    try {
      await deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1 hidden md:block">Gerencie sua base de clientes</p>
          </div>
          <Button className="gap-2" size={isMobile ? "sm" : "default"} onClick={openNewDialog}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Cliente</span>
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-xl p-3 md:p-4 mb-4 md:mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {clients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-muted-foreground mb-4">Comece cadastrando seu primeiro cliente</p>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Cliente
            </Button>
          </motion.div>
        )}

        {/* Mobile: Compact Cards */}
        {clients.length > 0 && isMobile && (
          <div className="space-y-2">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.02 }}
              >
                <ClientCard 
                  client={client} 
                  onEdit={openEditDialog} 
                  onDelete={openDeleteDialog}
                  compact
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Desktop: Grid Cards */}
        {clients.length > 0 && !isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
              >
                <ClientCard 
                  client={client} 
                  onEdit={openEditDialog} 
                  onDelete={openDeleteDialog}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Nome do cliente"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <PhoneInput
                id="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onAccept={(masked) => setFormData({ ...formData, phone: masked })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_type">Tipo de Pessoa</Label>
              <Select
                value={formData.client_type}
                onValueChange={(value: "pessoa_fisica" | "pessoa_juridica") => 
                  setFormData({ ...formData, client_type: value })
                }
              >
                <SelectTrigger id="client_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                  <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.client_type === "pessoa_fisica" ? (
              <div className="space-y-1.5">
                <Label htmlFor="cpf">CPF</Label>
                <CpfInput
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onAccept={(masked) => setFormData({ ...formData, cpf: masked })}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="cnpj">CNPJ</Label>
                <CnpjInput
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onAccept={(masked) => setFormData({ ...formData, cnpj: masked })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <div className="relative">
                <CepInput
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onAccept={handleCepChange}
                />
                {isFetchingCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            
            {/* Address Fields */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address">Logradouro (Rua/Avenida)</Label>
              <Input
                id="address"
                placeholder="Ex: Rua das Flores"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                placeholder="Ex: 123"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                placeholder="Ex: Apto 101, Bloco A"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                placeholder="Ex: Centro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                placeholder="UF"
                maxLength={2}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre o cliente..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {selectedClient ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedClient?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
