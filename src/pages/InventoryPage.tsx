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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, Wrench, AlertTriangle, Edit, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { toast } from "@/hooks/use-toast";

const productCategoryColors: Record<string, string> = {
  smartphone: "bg-info/20 text-info border-info/30",
  notebook: "bg-success/20 text-success border-success/30",
  tablet: "bg-warning/20 text-warning border-warning/30",
  desktop: "bg-primary/20 text-primary border-primary/30",
};

export default function InventoryPage() {
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { services, loading: servicesLoading, createService, updateService, deleteService } = useServices();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("products");
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"product" | "service">("product");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product form state
  const [productName, setProductName] = useState("");
  const [productSku, setProductSku] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productMinStock, setProductMinStock] = useState("");
  const [productCostPrice, setProductCostPrice] = useState("");
  const [productSalePrice, setProductSalePrice] = useState("");

  // Service form state
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceCostPrice, setServiceCostPrice] = useState("");
  const [serviceSalePrice, setServiceSalePrice] = useState("");

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const lowStockItems = products.filter((item) => item.stock <= item.min_stock);

  const resetForm = () => {
    setProductName("");
    setProductSku("");
    setProductCategory("");
    setProductStock("");
    setProductMinStock("");
    setProductCostPrice("");
    setProductSalePrice("");
    setServiceName("");
    setServiceDescription("");
    setServiceCostPrice("");
    setServiceSalePrice("");
    setEditingItem(null);
  };

  const openNewDialog = (type: "product" | "service") => {
    resetForm();
    setDialogType(type);
    setIsItemDialogOpen(true);
  };

  const openEditDialog = (item: any, type: "product" | "service") => {
    setEditingItem(item);
    setDialogType(type);
    if (type === "product") {
      setProductName(item.name);
      setProductSku(item.sku || "");
      setProductCategory(item.category || "");
      setProductStock(item.stock.toString());
      setProductMinStock(item.min_stock.toString());
      setProductCostPrice(item.cost_price.toString());
      setProductSalePrice(item.sale_price.toString());
    } else {
      setServiceName(item.name);
      setServiceDescription(item.description || "");
      setServiceCostPrice(item.cost_price.toString());
      setServiceSalePrice(item.sale_price.toString());
    }
    setIsItemDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (dialogType === "product") {
        const productData = {
          name: productName,
          sku: productSku || null,
          category: productCategory || null,
          stock: parseInt(productStock) || 0,
          min_stock: parseInt(productMinStock) || 0,
          cost_price: parseFloat(productCostPrice) || 0,
          sale_price: parseFloat(productSalePrice) || 0,
        };

        if (editingItem) {
          await updateProduct(editingItem.id, productData);
        } else {
          await createProduct(productData);
        }
      } else {
        const serviceData = {
          name: serviceName,
          description: serviceDescription || null,
          cost_price: parseFloat(serviceCostPrice) || 0,
          sale_price: parseFloat(serviceSalePrice) || 0,
        };

        if (editingItem) {
          await updateService(editingItem.id, serviceData);
        } else {
          await createService(serviceData);
        }
      }
      setIsItemDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: "product" | "service") => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    
    if (type === "product") {
      await deleteProduct(id);
    } else {
      await deleteService(id);
    }
  };

  const loading = productsLoading || servicesLoading;

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
            <p className="text-muted-foreground mt-1">Produtos e serviços do seu negócio</p>
          </div>
          <Button className="gap-2" onClick={() => openNewDialog(activeTab === "products" ? "product" : "service")}>
            <Plus className="w-4 h-4" />
            Novo Item
          </Button>
        </motion.div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-foreground">
              <strong>{lowStockItems.length} produtos</strong> estão abaixo do estoque mínimo
            </span>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <TabsList className="glass">
              <TabsTrigger value="products" className="gap-2">
                <Package className="w-4 h-4" />
                Produtos ({products.length})
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <Wrench className="w-4 h-4" />
                Serviços ({services.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === "products" && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </motion.div>

          {/* Products Tab */}
          <TabsContent value="products">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
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
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Produto</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoria</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantidade</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Custo</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Venda</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            Nenhum produto encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                            className={cn(
                              "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                              item.stock <= item.min_stock && "bg-destructive/5"
                            )}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {item.stock <= item.min_stock && (
                                  <AlertTriangle className="w-4 h-4 text-destructive" />
                                )}
                                <span className="font-medium text-foreground">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-sm text-muted-foreground">{item.sku || "-"}</span>
                            </td>
                            <td className="p-4">
                              {item.category && (
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs capitalize", productCategoryColors[item.category] || "")}
                                >
                                  {item.category}
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div>
                                <span
                                  className={cn(
                                    "font-semibold",
                                    item.stock <= item.min_stock ? "text-destructive" : "text-foreground"
                                  )}
                                >
                                  {item.stock}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">/ mín. {item.min_stock}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">R$ {Number(item.cost_price).toFixed(2)}</td>
                            <td className="p-4 font-medium text-foreground">R$ {Number(item.sale_price).toFixed(2)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item, "product")}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id, "product")}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
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
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Serviço</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Descrição</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Custo</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Venda</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Nenhum serviço encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredServices.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Wrench className="w-4 h-4 text-success" />
                                <span className="font-medium text-foreground">{item.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground max-w-[300px] truncate">
                              {item.description || "-"}
                            </td>
                            <td className="p-4 text-muted-foreground">R$ {Number(item.cost_price).toFixed(2)}</td>
                            <td className="p-4 font-medium text-foreground">R$ {Number(item.sale_price).toFixed(2)}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item, "service")}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id, "service")}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Unified Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar" : "Novo"} {dialogType === "product" ? "Produto" : "Serviço"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do {dialogType === "product" ? "produto" : "serviço"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={dialogType} onValueChange={(v) => setDialogType(v as "product" | "service")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="product" className="gap-2" disabled={!!editingItem}>
                <Package className="w-4 h-4" />
                Produto
              </TabsTrigger>
              <TabsTrigger value="service" className="gap-2" disabled={!!editingItem}>
                <Wrench className="w-4 h-4" />
                Serviço
              </TabsTrigger>
            </TabsList>
            
            <div className="max-h-[50vh] overflow-y-auto pr-2 -mr-2">
              <TabsContent value="product" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input 
                      id="name" 
                      placeholder="Ex: Tela iPhone 14 Pro" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                      id="sku" 
                      placeholder="Código único" 
                      value={productSku}
                      onChange={(e) => setProductSku(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={productCategory} onValueChange={setProductCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smartphone">Smartphone</SelectItem>
                        <SelectItem value="notebook">Notebook</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      placeholder="0" 
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="minQuantity">Qtd. Mínima</Label>
                    <Input 
                      id="minQuantity" 
                      type="number" 
                      placeholder="0" 
                      value={productMinStock}
                      onChange={(e) => setProductMinStock(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                    <Input 
                      id="costPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="0,00" 
                      value={productCostPrice}
                      onChange={(e) => setProductCostPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sellPrice">Preço de Venda (R$)</Label>
                    <Input 
                      id="sellPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="0,00" 
                      value={productSalePrice}
                      onChange={(e) => setProductSalePrice(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="service" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="serviceName">Nome do Serviço *</Label>
                    <Input 
                      id="serviceName" 
                      placeholder="Ex: Mão de Obra - Troca de Tela" 
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva o serviço..." 
                      rows={2} 
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="serviceCostPrice">Preço de Custo (R$)</Label>
                    <Input 
                      id="serviceCostPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="0,00" 
                      value={serviceCostPrice}
                      onChange={(e) => setServiceCostPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="serviceSellPrice">Preço de Venda (R$)</Label>
                    <Input 
                      id="serviceSellPrice" 
                      type="number" 
                      step="0.01"
                      placeholder="0,00" 
                      value={serviceSalePrice}
                      onChange={(e) => setServiceSalePrice(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setIsItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (dialogType === "product" ? !productName : !serviceName)}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingItem ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
