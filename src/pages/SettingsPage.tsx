import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Bell, Palette, Loader2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { MaskedInput, CepInput } from "@/components/ui/masked-input";
import { fetchAddressByCep } from "@/lib/cep";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, loading, saveSettings } = useCompanySettings();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  // Company form state
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [inscricaoEstadual, setInscricaoEstadual] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setRazaoSocial(settings.razao_social || "");
      setNomeFantasia(settings.nome_fantasia || "");
      setCnpj(settings.cnpj || "");
      setInscricaoEstadual(settings.inscricao_estadual || "");
      setTelefone(settings.telefone || "");
      setEmail(settings.email || "");
      setCep((settings as any).cep || "");
      setRua((settings as any).rua || "");
      setNumero((settings as any).numero || "");
      setComplemento((settings as any).complemento || "");
      setBairro((settings as any).bairro || "");
      setCidade((settings as any).cidade || "");
      setEstado((settings as any).estado || "");
    }
  }, [settings]);

  const handleCepChange = useCallback(async (maskedValue: string, unmaskedValue: string) => {
    setCep(maskedValue);
    
    if (unmaskedValue.length === 8) {
      setIsFetchingCep(true);
      const address = await fetchAddressByCep(unmaskedValue);
      setIsFetchingCep(false);
      
      if (address) {
        setRua(address.logradouro || rua);
        setBairro(address.bairro || bairro);
        setCidade(address.localidade || cidade);
        setEstado(address.uf || estado);
        toast.success("Endereço preenchido automaticamente!");
      } else {
        toast.error("CEP não encontrado");
      }
    }
  }, [rua, bairro, cidade, estado]);

  const handleSaveCompany = async () => {
    setIsSaving(true);
    await saveSettings({
      razao_social: razaoSocial || null,
      nome_fantasia: nomeFantasia || null,
      cnpj: cnpj || null,
      inscricao_estadual: inscricaoEstadual || null,
      telefone: telefone || null,
      email: email || null,
      cep: cep || null,
      rua: rua || null,
      numero: numero || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      estado: estado || null,
    } as any);
    setIsSaving(false);
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize o sistema de acordo com suas necessidades</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="empresa" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="empresa" className="gap-2">
                <Building2 className="w-4 h-4" />
                Empresa
              </TabsTrigger>
              <TabsTrigger value="usuario" className="gap-2">
                <User className="w-4 h-4" />
                Usuário
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="gap-2">
                <Palette className="w-4 h-4" />
                Aparência
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresa" className="glass rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Dados da Empresa</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="razao">Razão Social</Label>
                      <Input 
                        id="razao" 
                        placeholder="Razão social da empresa" 
                        value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fantasia">Nome Fantasia</Label>
                      <Input 
                        id="fantasia" 
                        placeholder="Nome fantasia" 
                        value={nomeFantasia}
                        onChange={(e) => setNomeFantasia(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <MaskedInput 
                        id="cnpj" 
                        mask="00.000.000/0000-00"
                        placeholder="00.000.000/0000-00" 
                        value={cnpj}
                        onAccept={(value) => setCnpj(value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ie">Inscrição Estadual</Label>
                      <Input 
                        id="ie" 
                        placeholder="Inscrição estadual" 
                        value={inscricaoEstadual}
                        onChange={(e) => setInscricaoEstadual(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <MaskedInput 
                        id="telefone" 
                        mask="(00) 00000-0000"
                        placeholder="(00) 00000-0000" 
                        value={telefone}
                        onAccept={(value) => setTelefone(value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="contato@empresa.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-md font-medium text-foreground mb-4">Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <div className="relative">
                          <CepInput
                            id="cep"
                            placeholder="00000-000"
                            value={cep}
                            onAccept={handleCepChange}
                          />
                          {isFetchingCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="rua">Logradouro (Rua/Avenida)</Label>
                        <Input 
                          id="rua" 
                          placeholder="Ex: Rua das Flores" 
                          value={rua}
                          onChange={(e) => setRua(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input 
                          id="numero" 
                          placeholder="Ex: 123" 
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complemento">Complemento</Label>
                        <Input 
                          id="complemento" 
                          placeholder="Ex: Sala 101" 
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input 
                          id="bairro" 
                          placeholder="Ex: Centro" 
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input 
                          id="cidade" 
                          placeholder="Cidade" 
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input 
                          id="estado" 
                          placeholder="UF" 
                          maxLength={2}
                          value={estado}
                          onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveCompany} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="usuario" className="glass rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Dados do Usuário</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" defaultValue="Administrador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailUser">E-mail</Label>
                  <Input id="emailUser" type="email" value={user?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <Input id="senhaAtual" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input id="novaSenha" type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Atualizar Perfil</Button>
              </div>
            </TabsContent>

            <TabsContent value="notificacoes" className="glass rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Preferências de Notificação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Nova OS criada</p>
                    <p className="text-sm text-muted-foreground">Receber notificação quando uma nova OS for aberta</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Estoque baixo</p>
                    <p className="text-sm text-muted-foreground">Alertar quando itens estiverem abaixo do mínimo</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Pagamentos pendentes</p>
                    <p className="text-sm text-muted-foreground">Notificar sobre pagamentos em atraso</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Relatórios semanais</p>
                    <p className="text-sm text-muted-foreground">Receber resumo semanal por e-mail</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aparencia" className="glass rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personalização</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Tema Escuro</p>
                    <p className="text-sm text-muted-foreground">Ativar modo escuro na interface</p>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Animações</p>
                    <p className="text-sm text-muted-foreground">Habilitar animações na interface</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">Sidebar Compacta</p>
                    <p className="text-sm text-muted-foreground">Manter sidebar recolhida por padrão</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}