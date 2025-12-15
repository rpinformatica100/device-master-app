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
  ArrowRight,
  Star,
  MessageSquare,
  ChevronDown,
  Sparkles,
  Clock,
  TrendingUp
} from "lucide-react";
import { useState } from "react";

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

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Proprietário - TechFix Assistência",
    avatar: "CS",
    rating: 5,
    text: "O TechOS transformou minha assistência técnica. Antes eu perdia horas organizando papéis, agora tudo está na palma da mão. Meu faturamento aumentou 40% em 3 meses!"
  },
  {
    name: "Ana Paula Mendes",
    role: "Gestora - CellRepair",
    avatar: "AM",
    rating: 5,
    text: "A melhor decisão que tomei para meu negócio. O controle financeiro me mostrou onde eu estava perdendo dinheiro. Agora tenho lucro real!"
  },
  {
    name: "Roberto Santos",
    role: "Técnico Autônomo",
    avatar: "RS",
    rating: 5,
    text: "Simples de usar e muito completo. Meus clientes ficam impressionados com o profissionalismo das OS impressas. Recomendo demais!"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Grátis",
    period: "para sempre",
    description: "Perfeito para começar",
    features: [
      "Até 50 OS por mês",
      "Cadastro de clientes ilimitado",
      "Controle de estoque básico",
      "Relatórios simples"
    ],
    popular: false,
    cta: "Começar Grátis"
  },
  {
    name: "Profissional",
    price: "R$ 49",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: [
      "OS ilimitadas",
      "Todos os recursos Starter",
      "Financeiro completo",
      "Relatórios avançados",
      "Suporte prioritário",
      "Exportação de dados"
    ],
    popular: true,
    cta: "Testar 7 dias grátis"
  },
  {
    name: "Empresarial",
    price: "R$ 99",
    period: "/mês",
    description: "Para múltiplos técnicos",
    features: [
      "Tudo do Profissional",
      "Até 5 usuários",
      "Gestão de equipe",
      "API de integração",
      "Suporte 24/7",
      "Treinamento incluso"
    ],
    popular: false,
    cta: "Falar com vendas"
  }
];

const faqs = [
  {
    question: "Posso testar o TechOS antes de pagar?",
    answer: "Sim! Oferecemos um plano gratuito para sempre com até 50 OS por mês. Você também pode testar o plano Profissional por 7 dias sem compromisso."
  },
  {
    question: "Meus dados ficam seguros?",
    answer: "Absolutamente! Utilizamos criptografia de ponta a ponta e servidores seguros. Seus dados são backupeados automaticamente todos os dias."
  },
  {
    question: "Funciona no celular?",
    answer: "Sim! O TechOS é 100% responsivo e funciona perfeitamente em celulares, tablets e computadores. Acesse de qualquer lugar!"
  },
  {
    question: "Como faço para migrar meus dados?",
    answer: "Nossa equipe de suporte ajuda você a importar seus dados de planilhas ou outros sistemas. O processo é simples e rápido."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, não há fidelidade. Você pode cancelar quando quiser e seus dados ficam disponíveis para exportação por 30 dias."
  }
];

const stats = [
  { value: "10.000+", label: "Ordens de serviço gerenciadas", icon: Wrench },
  { value: "500+", label: "Assistências técnicas ativas", icon: Users },
  { value: "R$ 2M+", label: "Faturamento processado", icon: TrendingUp },
  { value: "99.9%", label: "Uptime garantido", icon: Clock }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
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
              <Button className="gradient-primary shadow-glow">
                Começar Agora
              </Button>
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Sistema completo de assistência técnica</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight"
            >
              Gerencie sua{" "}
              <span className="text-gradient">assistência técnica</span>
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
                <Button size="lg" className="gradient-primary text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass border-primary/20 hover:bg-primary/10">
                  Já tenho conta
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Dados seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Sem instalação</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span>4.9/5 avaliação</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-border/50 bg-secondary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
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
                className="glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 group hover:shadow-glow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
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
      <section className="py-24 px-6 bg-secondary/10">
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
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-lg text-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                    <Wrench className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+500 OS</p>
                    <p className="text-sm text-muted-foreground">Gerenciadas este mês</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">R$ 45.000</p>
                    <p className="text-sm text-muted-foreground">Faturamento médio</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
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

      {/* Testimonials Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Histórias reais de quem transformou seu negócio com o TechOS
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-secondary/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para o seu negócio
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular 
                    ? 'glass border-primary/50 shadow-glow' 
                    : 'glass hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-foreground">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button 
                    className={`w-full ${plan.popular ? 'gradient-primary shadow-glow' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre o TechOS
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-muted-foreground">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12"
          >
            <MessageSquare className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de assistências técnicas que já otimizaram sua gestão com o TechOS.
              Comece gratuitamente hoje mesmo!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gradient-primary text-lg px-10 py-6 shadow-glow hover:scale-105 transition-transform">
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                  Fazer Login
                </Button>
              </Link>
            </div>
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