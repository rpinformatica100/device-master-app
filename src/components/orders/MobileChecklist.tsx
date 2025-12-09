import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, Camera, Mic, Volume2, Wifi, Bluetooth, Battery, Fingerprint, Phone, Monitor, Vibrate } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  checked: boolean | null; // null = não testado, true = ok, false = defeito
}

interface MobileChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (checklist: Record<string, boolean | null>, observations: string) => void;
  initialChecklist?: Record<string, boolean | null>;
  initialObservations?: string;
}

const defaultChecklistItems: Omit<ChecklistItem, "checked">[] = [
  { id: "display", label: "Display (funcionamento, manchas, pixels)", icon: <Monitor className="w-4 h-4" /> },
  { id: "touchscreen", label: "Touchscreen (resposta ao toque)", icon: <Fingerprint className="w-4 h-4" /> },
  { id: "camera_frontal", label: "Câmera Frontal", icon: <Camera className="w-4 h-4" /> },
  { id: "camera_traseira", label: "Câmera Traseira", icon: <Camera className="w-4 h-4" /> },
  { id: "microfone", label: "Microfone", icon: <Mic className="w-4 h-4" /> },
  { id: "alto_falante", label: "Alto-falante", icon: <Volume2 className="w-4 h-4" /> },
  { id: "auricular", label: "Auricular (chamadas)", icon: <Phone className="w-4 h-4" /> },
  { id: "wifi", label: "Wi-Fi", icon: <Wifi className="w-4 h-4" /> },
  { id: "bluetooth", label: "Bluetooth", icon: <Bluetooth className="w-4 h-4" /> },
  { id: "bateria", label: "Bateria / Carregamento", icon: <Battery className="w-4 h-4" /> },
  { id: "biometria", label: "Biometria / Face ID", icon: <Fingerprint className="w-4 h-4" /> },
  { id: "vibracao", label: "Vibração", icon: <Vibrate className="w-4 h-4" /> },
  { id: "botoes", label: "Botões físicos (volume, power)", icon: <Phone className="w-4 h-4" /> },
  { id: "chip", label: "Leitor de Chip / eSIM", icon: <Phone className="w-4 h-4" /> },
  { id: "sensores", label: "Sensores (proximidade, giroscópio)", icon: <Phone className="w-4 h-4" /> },
];

export function MobileChecklist({ 
  open, 
  onOpenChange, 
  onSave, 
  initialChecklist = {},
  initialObservations = "" 
}: MobileChecklistProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean | null>>(() => {
    const initial: Record<string, boolean | null> = {};
    defaultChecklistItems.forEach(item => {
      initial[item.id] = initialChecklist[item.id] ?? null;
    });
    return initial;
  });
  const [observations, setObservations] = useState(initialObservations);

  const handleItemChange = (id: string, value: boolean | null) => {
    setChecklist(prev => ({ ...prev, [id]: value }));
  };

  const cycleValue = (id: string) => {
    const current = checklist[id];
    // null -> true -> false -> null
    let next: boolean | null;
    if (current === null) next = true;
    else if (current === true) next = false;
    else next = null;
    handleItemChange(id, next);
  };

  const handleSave = () => {
    onSave(checklist, observations);
    onOpenChange(false);
  };

  const getStatusBadge = (value: boolean | null) => {
    if (value === null) return <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Não testado</span>;
    if (value === true) return <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-600">OK</span>;
    return <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-600">Defeito</span>;
  };

  const testedCount = Object.values(checklist).filter(v => v !== null).length;
  const okCount = Object.values(checklist).filter(v => v === true).length;
  const defectCount = Object.values(checklist).filter(v => v === false).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Checklist de Entrada - Dispositivo Mobile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="flex gap-4 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="text-center">
              <p className="font-bold text-lg">{testedCount}/{defaultChecklistItems.length}</p>
              <p className="text-muted-foreground text-xs">Testados</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-green-600">{okCount}</p>
              <p className="text-muted-foreground text-xs">OK</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-red-600">{defectCount}</p>
              <p className="text-muted-foreground text-xs">Defeitos</p>
            </div>
          </div>

          {/* Instruction */}
          <p className="text-sm text-muted-foreground">
            Clique em cada item para alternar: <span className="text-muted-foreground">Não testado</span> → <span className="text-green-600">OK</span> → <span className="text-red-600">Defeito</span>
          </p>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {defaultChecklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => cycleValue(item.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                  checklist[item.id] === true 
                    ? "border-green-500/50 bg-green-500/10" 
                    : checklist[item.id] === false 
                      ? "border-red-500/50 bg-red-500/10" 
                      : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
                {getStatusBadge(checklist[item.id])}
              </button>
            ))}
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label>Observações do Checklist</Label>
            <Textarea
              placeholder="Anote detalhes sobre os defeitos encontrados ou observações importantes..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Salvar Checklist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
