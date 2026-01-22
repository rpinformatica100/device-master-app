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
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="glass rounded-xl p-3 mb-4 space-y-2">
      {/* Compact Period Presets - Horizontal Scroll on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Período:</span>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => handlePresetClick("thisMonth")}
          >
            Este mês
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => handlePresetClick("lastMonth")}
          >
            Mês passado
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => handlePresetClick("last3Months")}
          >
            3 meses
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => handlePresetClick("last6Months")}
          >
            6 meses
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => handlePresetClick("thisYear")}
          >
            Ano
          </Button>
        </div>
      </div>

      {/* Collapsible Filters - Toggle on Mobile */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-muted-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="w-3 h-3 mr-1" />
          {isExpanded ? "Ocultar filtros" : "Mostrar filtros"}
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Date Range & Filters - Always visible on desktop, collapsible on mobile */}
      <div className={cn(
        "grid grid-cols-2 md:grid-cols-6 gap-2",
        !isExpanded && "hidden md:grid"
      )}>
        {/* Start Date */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Início</Label>
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full h-8 justify-start text-left text-xs font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3 w-3" />
                {filters.startDate
                  ? format(filters.startDate, "dd/MM/yy", { locale: ptBR })
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
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Fim</Label>
          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full h-8 justify-start text-left text-xs font-normal",
                  !filters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1.5 h-3 w-3" />
                {filters.endDate
                  ? format(filters.endDate, "dd/MM/yy", { locale: ptBR })
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
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Tipo</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
          >
            <SelectTrigger className="h-8 text-xs">
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
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="h-8 text-xs">
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
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Categoria</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="ordem_servico">OS</SelectItem>
              <SelectItem value="venda_direta">Venda</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="fornecedor">Fornecedor</SelectItem>
              <SelectItem value="salario">Salário</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-1 col-span-2 md:col-span-1">
          <Label className="text-[10px] text-muted-foreground">Buscar</Label>
          <Input
            placeholder="Descrição..."
            className="h-8 text-xs"
            value={filters.searchTerm}
            onChange={(e) =>
              onFiltersChange({ ...filters, searchTerm: e.target.value })
            }
          />
        </div>
      </div>

      {/* Actions - Compact */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {filters.startDate && filters.endDate && (
              <span className="hidden sm:inline">
                {format(filters.startDate, "dd/MM", { locale: ptBR })} -{" "}
                {format(filters.endDate, "dd/MM", { locale: ptBR })}
              </span>
            )}
          </span>
        </div>

        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onExportExcel}>
            <FileSpreadsheet className="w-3 h-3 md:mr-1" />
            <span className="hidden md:inline">Excel</span>
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onExportPDF}>
            <FileText className="w-3 h-3 md:mr-1" />
            <span className="hidden md:inline">PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { defaultFilters };
