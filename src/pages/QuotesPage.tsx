import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Search, Filter, Eye, Edit, Trash2, Loader2, FileBarChart, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteFormDialog } from "@/components/quotes/QuoteFormDialog";
import { QuoteViewDialog } from "@/components/quotes/QuoteViewDialog";
import { useQuotes } from "@/hooks/useQuotes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Quote } from "@/types/quote";

const statusConfig: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning/20 text-warning border-warning/30" },
  aprovado: { label: "Aprovado", className: "bg-success/20 text-success border-success/30" },
  rejeitado: { label: "Rejeitado", className: "bg-destructive/20 text-destructive border-destructive/30" },
  expirado: { label: "Expirado", className: "bg-muted text-muted-foreground border-muted" },
};

export default function QuotesPage() {
  const { quotes, loading, deleteQuote } = useQuotes();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredQuotes = quotes.filter((q) => {
    const clientName = q.client?.name || "";
    const matchesSearch =
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (q: Quote) => { setSelectedQuote(q); setIsViewOpen(true); };
  const handleEdit = (q: Quote) => { setSelectedQuote(q); setFormMode("edit"); setIsFormOpen(true); setIsViewOpen(false); };
  const handleNewQuote = () => { setSelectedQuote(null); setFormMode("create"); setIsFormOpen(true); };
  const handleDeleteClick = (q: Quote) => { setSelectedQuote(q); setIsDeleteDialogOpen(true); };

  const handleDelete = async () => {
    if (!selectedQuote) return;
    setIsDeleting(true);
    try {
      await deleteQuote(selectedQuote.id);
      setIsDeleteDialogOpen(false);
      setSelectedQuote(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

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
      <div className="p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Orçamentos</h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">Gerencie seus orçamentos profissionais</p>
          </div>
          <Button className="gap-2" size={isMobile ? "sm" : "default"} onClick={handleNewQuote}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Orçamento</span>
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-xl p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Empty State */}
        {quotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileBarChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum orçamento</h3>
            <p className="text-muted-foreground mb-4">Crie seu primeiro orçamento profissional</p>
            <Button onClick={handleNewQuote}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </motion.div>
        )}

        {/* Mobile Cards */}
        {quotes.length > 0 && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3"
          >
            {filteredQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.03 }}
                className="glass rounded-xl p-3 space-y-2"
                onClick={() => handleView(quote)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-primary font-medium">{quote.quote_number}</span>
                  <Badge variant="outline" className={cn("text-[10px]", statusConfig[quote.status]?.className)}>
                    {statusConfig[quote.status]?.label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground">{quote.title}</p>
                <p className="text-xs text-muted-foreground">{quote.client?.name || "Sem cliente"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-bold text-primary">{fmt(Number(quote.total_sale))}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Desktop Table */}
        {quotes.length > 0 && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground w-[110px]">Nº</th>
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground">Título</th>
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground min-w-[120px]">Cliente</th>
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground w-[100px]">Status</th>
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground w-[90px]">Valor</th>
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground w-[80px]">Data</th>
                    <th className="text-left p-2 lg:p-3 text-xs font-medium text-muted-foreground w-[120px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((quote, index) => (
                    <motion.tr
                      key={quote.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => handleView(quote)}
                    >
                      <td className="p-2 lg:p-3">
                        <span className="font-mono text-xs text-primary">{quote.quote_number}</span>
                      </td>
                      <td className="p-2 lg:p-3">
                        <p className="text-xs font-medium text-foreground truncate max-w-[200px]">{quote.title}</p>
                      </td>
                      <td className="p-2 lg:p-3">
                        <p className="text-xs text-foreground truncate max-w-[120px]">{quote.client?.name || "—"}</p>
                      </td>
                      <td className="p-2 lg:p-3">
                        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusConfig[quote.status]?.className)}>
                          {statusConfig[quote.status]?.label || quote.status}
                        </Badge>
                      </td>
                      <td className="p-2 lg:p-3">
                        <span className="text-xs font-medium text-foreground">{fmt(Number(quote.total_sale))}</span>
                      </td>
                      <td className="p-2 lg:p-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="p-2 lg:p-3">
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(quote)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/orcamentos/${quote.id}/imprimir`)}>
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(quote)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteClick(quote)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <QuoteFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        quoteData={formMode === "edit" ? selectedQuote : undefined}
      />

      <QuoteViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        quote={selectedQuote}
        onEdit={() => selectedQuote && handleEdit(selectedQuote)}
        onQuoteUpdated={() => { setIsViewOpen(false); }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento "{selectedQuote?.quote_number}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
