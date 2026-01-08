import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, X, FileSpreadsheet, FileText } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FinancialTransaction } from "@/types/database";

export interface FilterState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  type: string;
  status: string;
  category: string;
  searchTerm: string;
}

interface FinancialFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  transactions: FinancialTransaction[];
}

const defaultFilters: FilterState = {
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
  type: "all",
  status: "all",
  category: "all",
  searchTerm: "",
};

export function FinancialFilters({
  filters,
  onFiltersChange,
  onExportExcel,
  onExportPDF,
}: FinancialFiltersProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handlePresetClick = (preset: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfMonth(now);

    switch (preset) {
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth":
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case "last3Months":
        startDate = startOfMonth(subMonths(now, 2));
        break;
      case "last6Months":
        startDate = startOfMonth(subMonths(now, 5));
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(now);
    }

    onFiltersChange({ ...filters, startDate, endDate });
  };

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.searchTerm !== "";

  return (
    <div className="glass rounded-xl p-4 mb-6 space-y-4">
      {/* Period Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center mr-2">Período:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick("thisMonth")}
        >
          Este mês
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick("lastMonth")}
        >
          Mês passado
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick("last3Months")}
        >
          Últimos 3 meses
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick("last6Months")}
        >
          Últimos 6 meses
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick("thisYear")}
        >
          Este ano
        </Button>
      </div>

      {/* Date Range & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Data Inicial</Label>
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate
                  ? format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
                  : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => {
                  onFiltersChange({ ...filters, startDate: date });
                  setIsStartOpen(false);
                }}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Data Final</Label>
          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate
                  ? format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })
                  : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => {
                  onFiltersChange({ ...filters, endDate: date });
                  setIsEndOpen(false);
                }}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ordem_servico">Ordem de Serviço</SelectItem>
              <SelectItem value="venda_direta">Venda Direta</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="fornecedor">Fornecedor</SelectItem>
              <SelectItem value="salario">Salário</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Buscar</Label>
          <Input
            placeholder="Descrição..."
            value={filters.searchTerm}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchTerm: e.target.value })
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar filtros
            </Button>
          )}
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Filter className="w-4 h-4" />
            {filters.startDate && filters.endDate && (
              <>
                {format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })}
              </>
            )}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export { defaultFilters };
