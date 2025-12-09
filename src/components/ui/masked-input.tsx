import { forwardRef } from "react";
import { IMaskInput } from "react-imask";
import { cn } from "@/lib/utils";

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: string;
  value: string;
  onAccept: (value: string, unmaskedValue: string) => void;
  definitions?: Record<string, RegExp>;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, value, onAccept, definitions, ...props }, ref) => {
    return (
      <IMaskInput
        mask={mask}
        value={value}
        unmask={false}
        onAccept={(maskedValue: string, maskRef: any) => {
          onAccept(maskedValue, maskRef.unmaskedValue);
        }}
        definitions={definitions}
        inputRef={ref as any}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = "MaskedInput";

// Pre-configured mask components
export const CpfInput = forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask" | "definitions">
>(({ ...props }, ref) => (
  <MaskedInput ref={ref} mask="000.000.000-00" {...props} />
));
CpfInput.displayName = "CpfInput";

export const PhoneInput = forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask" | "definitions">
>(({ ...props }, ref) => (
  <MaskedInput
    ref={ref}
    mask="(00) 00000-0000"
    {...props}
  />
));
PhoneInput.displayName = "PhoneInput";

export const CepInput = forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask" | "definitions">
>(({ ...props }, ref) => (
  <MaskedInput ref={ref} mask="00000-000" {...props} />
));
CepInput.displayName = "CepInput";

export { MaskedInput };
