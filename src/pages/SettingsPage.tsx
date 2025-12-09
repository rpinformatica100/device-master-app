import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="razao">Razão Social</Label>
                  <Input id="razao" placeholder="Razão social da empresa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fantasia">Nome Fantasia</Label>
                  <Input id="fantasia" placeholder="Nome fantasia" defaultValue="TechOS Assistência" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ie">Inscrição Estadual</Label>
                  <Input id="ie" placeholder="Inscrição estadual" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(00) 0000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="contato@empresa.com" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input id="endereco" placeholder="Rua, número, bairro, cidade - UF, CEP" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
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
                  <Input id="emailUser" type="email" defaultValue="admin@techos.com" />
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
                  <Switch defaultChecked />
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
