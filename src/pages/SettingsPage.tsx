import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Palette, Loader2 } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { MaskedInput, CepInput } from "@/components/ui/masked-input";
import { fetchAddressByCep } from "@/lib/cep";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUiPrefs, setUiPref } from "@/lib/uiPrefs";

export default function SettingsPage() {
  const { settings, loading, saveSettings } = useCompanySettings();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const uiPrefs = useUiPrefs();

  // User form state
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setFullName((user?.user_metadata?.full_name as string) || "");
    // Session data can be stale; read the latest profile from the server.
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name as string | undefined;
      if (name) setFullName(name);
    });
  }, [user?.id]);

  const handleSaveName = async () => {
    if (!fullName.trim()) return toast.error("Informe seu nome");
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
    setSavingName(false);
    if (error) toast.error("Não foi possível salvar o nome");
    else toast.success("Nome atualizado!");
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    if (!currentPassword) return toast.error("Informe a senha atual");
    if (newPassword.length < 8) return toast.error("A nova senha precisa ter pelo menos 8 caracteres");
    if (newPassword !== confirmPassword) return toast.error("A confirmação não confere com a nova senha");
    if (newPassword === currentPassword) return toast.error("A nova senha deve ser diferente da atual");
    setSavingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (signInError) {
      setSavingPassword(false);
      return toast.error("Senha atual incorreta");
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      const msg = /weak|pwned|leaked/i.test(error.message)
        ? "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra."
        : "Não foi possível alterar a senha";
      return toast.error(msg);
    }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    toast.success("Senha alterada com sucesso!");
  };

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
  const [logoUrl, setLogoUrl] = useState("");
  const [defaultWarranty, setDefaultWarranty] = useState("");
  const [defaultOsNotes, setDefaultOsNotes] = useState("");
  const [defaultQuoteNotes, setDefaultQuoteNotes] = useState("");

  // Resize the logo in the browser and keep it as a small PNG data URL,
  // so prints/PDFs render it without cross-origin issues.
  const handleLogoFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Escolha um arquivo de imagem (PNG, JPG ou SVG)");
    if (file.size > 5 * 1024 * 1024) return toast.error("Imagem muito grande (máximo 5 MB)");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 480 / img.width, 200 / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        setLogoUrl(canvas.toDataURL("image/png"));
        toast.success("Logo carregado. Clique em Salvar para confirmar.");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

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
      setLogoUrl(settings.logo_url || "");
      setDefaultWarranty(settings.default_warranty_text || "");
      setDefaultOsNotes(settings.default_os_notes || "");
      setDefaultQuoteNotes(settings.default_quote_notes || "");
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
      logo_url: logoUrl || null,
      default_warranty_text: defaultWarranty || null,
      default_os_notes: defaultOsNotes || null,
      default_quote_notes: defaultQuoteNotes || null,
    } as any);
    setIsSaving(false);
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Personalize o sistema de acordo com suas necessidades</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="empresa" className="space-y-4">
            <TabsList className="glass flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="empresa" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Empresa</span>
                <span className="sm:hidden">Emp.</span>
              </TabsTrigger>
              <TabsTrigger value="usuario" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Usuário</span>
                <span className="sm:hidden">User</span>
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Aparência</span>
                <span className="sm:hidden">Tema</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="empresa" className="glass rounded-lg p-3 sm:p-4 lg:p-6 space-y-4">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">Dados da Empresa</h3>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <Label htmlFor="razao" className="text-xs">Razão Social</Label>
                      <Input 
                        id="razao" 
                        placeholder="Razão social" 
                        value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1 space-y-1">
                      <Label htmlFor="fantasia" className="text-xs">Nome Fantasia</Label>
                      <Input 
                        id="fantasia" 
                        placeholder="Nome fantasia" 
                        value={nomeFantasia}
                        onChange={(e) => setNomeFantasia(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cnpj" className="text-xs">CNPJ</Label>
                      <MaskedInput 
                        id="cnpj" 
                        mask="00.000.000/0000-00"
                        placeholder="00.000.000/0000-00" 
                        value={cnpj}
                        onAccept={(value) => setCnpj(value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ie" className="text-xs">Inscr. Estadual</Label>
                      <Input 
                        id="ie" 
                        placeholder="Inscrição estadual" 
                        value={inscricaoEstadual}
                        onChange={(e) => setInscricaoEstadual(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="telefone" className="text-xs">Telefone</Label>
                      <MaskedInput 
                        id="telefone" 
                        mask="(00) 00000-0000"
                        placeholder="(00) 00000-0000" 
                        value={telefone}
                        onAccept={(value) => setTelefone(value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="contato@empresa.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-3 border-t border-border">
                    <h4 className="text-xs sm:text-sm font-medium text-foreground mb-2">Endereço</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="cep" className="text-xs">CEP</Label>
                        <div className="relative">
                          <CepInput
                            id="cep"
                            placeholder="00000-000"
                            value={cep}
                            onAccept={handleCepChange}
                            className="h-8 text-sm"
                          />
                          {isFetchingCep && (
                            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="numero" className="text-xs">Número</Label>
                        <Input 
                          id="numero" 
                          placeholder="123" 
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="complemento" className="text-xs">Complemento</Label>
                        <Input 
                          id="complemento" 
                          placeholder="Sala 101" 
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-3 space-y-1">
                        <Label htmlFor="rua" className="text-xs">Logradouro</Label>
                        <Input 
                          id="rua" 
                          placeholder="Rua das Flores" 
                          value={rua}
                          onChange={(e) => setRua(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bairro" className="text-xs">Bairro</Label>
                        <Input 
                          id="bairro" 
                          placeholder="Centro" 
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cidade" className="text-xs">Cidade</Label>
                        <Input 
                          id="cidade" 
                          placeholder="Cidade" 
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="estado" className="text-xs">UF</Label>
                        <Input 
                          id="estado" 
                          placeholder="UF" 
                          maxLength={2}
                          value={estado}
                          onChange={(e) => setEstado(e.target.value.toUpperCase())}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-foreground">Logo (aparece nas impressões)</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="h-16 w-40 rounded-md border border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden">
                        {logoUrl ? <img src={logoUrl} alt="Logo da empresa" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted-foreground">Sem logo</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <label htmlFor="logoFile" className="cursor-pointer">{logoUrl ? "Trocar logo" : "Enviar logo"}</label>
                        </Button>
                        <input id="logoFile" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => { handleLogoFile(e.target.files?.[0]); e.target.value = ""; }} />
                        {logoUrl && <Button size="sm" variant="ghost" onClick={() => setLogoUrl("")}>Remover</Button>}
                      </div>
                    </div>
                  </div>

                  {/* Default texts */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <h4 className="text-xs sm:text-sm font-medium text-foreground">Textos padrão</h4>
                    <p className="text-xs text-muted-foreground">Preenchidos automaticamente em novas OS e orçamentos. Você pode alterar em cada documento.</p>
                    <div className="space-y-1">
                      <Label htmlFor="defWarranty" className="text-xs">Garantia</Label>
                      <Textarea id="defWarranty" rows={2} className="text-sm" placeholder="Garantia de 90 dias para peças e mão de obra, exceto mau uso." value={defaultWarranty} onChange={(e) => setDefaultWarranty(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="defOsNotes" className="text-xs">Observações da OS</Label>
                        <Textarea id="defOsNotes" rows={2} className="text-sm" placeholder="Ex.: Aparelhos não retirados em 90 dias..." value={defaultOsNotes} onChange={(e) => setDefaultOsNotes(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="defQuoteNotes" className="text-xs">Observações do orçamento</Label>
                        <Textarea id="defQuoteNotes" rows={2} className="text-sm" placeholder="Ex.: Pagamento em até 12x no cartão..." value={defaultQuoteNotes} onChange={(e) => setDefaultQuoteNotes(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button onClick={handleSaveCompany} disabled={isSaving} size="sm">
                      {isSaving && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="usuario" className="glass rounded-lg p-3 sm:p-4 lg:p-6 space-y-4">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">Dados do Usuário</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <Label htmlFor="nome" className="text-xs">Nome Completo</Label>
                  <Input id="nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <Label htmlFor="emailUser" className="text-xs">E-mail de acesso</Label>
                  <Input id="emailUser" type="email" value={user?.email || ""} disabled className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                  {savingName && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                  Salvar nome
                </Button>
              </div>

              <div className="pt-3 border-t border-border space-y-3">
                <h4 className="text-xs sm:text-sm font-medium text-foreground">Alterar Senha</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="senhaAtual" className="text-xs">Senha Atual</Label>
                    <Input id="senhaAtual" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="novaSenha" className="text-xs">Nova Senha</Label>
                    <Input id="novaSenha" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmarSenha" className="text-xs">Confirmar Nova Senha</Label>
                    <Input id="confirmarSenha" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleChangePassword} disabled={savingPassword}>
                    {savingPassword && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                    Alterar senha
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aparencia" className="glass rounded-lg p-3 sm:p-4 lg:p-6 space-y-3">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">Personalização</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Tema Escuro</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Ativar modo escuro</p>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Animações</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Habilitar animações</p>
                  </div>
                  <Switch checked={uiPrefs.animations} onCheckedChange={(v) => setUiPref("animations", v)} />
                </div>
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">Sidebar Compacta</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Menu lateral recolhido (computador)</p>
                  </div>
                  <Switch checked={uiPrefs.sidebarCompact} onCheckedChange={(v) => setUiPref("sidebarCompact", v)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}