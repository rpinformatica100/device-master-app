import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Users, 
  Package, 
  BarChart3, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Gestão de Ordens de Serviço",
    description: "Controle completo das OS, do início ao fim. Acompanhe status, peças e histórico."
  },
  {
    icon: Users,
    title: "Cadastro de Clientes",
    description: "Base de clientes organizada com histórico de serviços e informações de contato."
  },
  {
    icon: Package,
    title: "Controle de Estoque",
    description: "Gerencie peças e produtos com alertas de estoque mínimo e rastreamento."
  },
  {
    icon: BarChart3,
    title: "Financeiro Integrado",
    description: "Controle de receitas, despesas, lucros e fluxo de caixa em tempo real."
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Seus dados protegidos com autenticação segura e backup automático."
  },
  {
    icon: Zap,
    title: "Rápido e Intuitivo",
    description: "Interface moderna e responsiva, funciona em qualquer dispositivo."
  }
];

const benefits = [
  "Reduza o tempo de gestão em até 70%",
  "Nunca mais perca uma OS",
  "Controle financeiro preciso",
  "Relatórios detalhados",
  "Suporte técnico dedicado"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TechOS</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/auth">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Entrar
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="gradient-primary">
                Começar Agora
              </Button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Sistema completo de assistência técnica</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-foreground"
            >
              Gerencie sua{" "}
              <span className="text-primary">assistência técnica</span>
              {" "}com facilidade
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Sistema completo para gerenciar ordens de serviço, clientes, estoque e finanças. 
              Tudo em um só lugar, simples e eficiente.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gradient-primary text-lg px-8 py-6 shadow-glow">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Já tenho conta
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas poderosas para simplificar sua rotina
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Por que escolher o TechOS?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Desenvolvido por técnicos, para técnicos. Entendemos suas necessidades 
                e criamos a solução perfeita para o seu negócio.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                    <span className="text-lg text-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+500 OS</p>
                    <p className="text-sm text-muted-foreground">Gerenciadas este mês</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                  <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">R$ 45.000</p>
                    <p className="text-sm text-muted-foreground">Faturamento médio</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                  <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+200 Clientes</p>
                    <p className="text-sm text-muted-foreground">Cadastrados no sistema</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-foreground mb-6"
          >
            Pronto para transformar seu negócio?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8"
          >
            Comece agora mesmo e veja a diferença em poucos dias.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gradient-primary text-lg px-10 py-6 shadow-glow">
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">TechOS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 TechOS. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
