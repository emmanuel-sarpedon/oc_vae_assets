import CashRegisterForm from "@/components/CashRegisterForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFondDeCaisseStore } from "@/hooks/store";
import { useCaisseId } from "@/hooks/sync";
import useSelfAssignedCashRegisters from "@/hooks/useSelfAssignedCashRegisters";
import { cn, formatCurrency } from "@/lib/utils";
import { ExclamationTriangleIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";

export default function CashRegister() {
  const { cai_id } = useCaisseId();
  const { data } = useSelfAssignedCashRegisters();
  const fdcStore = useFondDeCaisseStore();
  const [open, setOpen] = useState(false);

  const disabled = useMemo(() => {
    if (!cai_id) return true;
    return !data?.map(({ cai_id }) => cai_id).includes(cai_id);
  }, [cai_id, data]);

  return (
    <>
      <div className={"flex items-center"}>
        <span className={"mr-4 shrink-0 font-semibold"}>Fond de caisse :</span>

        {fdcStore.isLoading ? <Skeleton className={"h-6 w-24"} /> : null}
        {!fdcStore.isLoading && !disabled? (
          <span className={cn("flex shrink-0 items-center font-bold", { "text-red-500": fdcStore.toControl })}>
            {fdcStore.toControl ? <ExclamationTriangleIcon className={"mr-2 h-4 w-4 text-red-500"} /> : null}
            {formatCurrency(fdcStore.fondDeCaisse?.fdc_montant || 0, { doNotReturnZero: true })}
          </span>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={fdcStore.toControl ? "destructive" : "outline"} disabled={disabled}>
            <Pencil2Icon className={"mr-2 h-4 w-4"} />
            {fdcStore.toControl ? "Contrôler" : "Modifier"} le fond de caisse
          </Button>
        </DialogTrigger>
        <DialogContent className={"max-h-screen overflow-y-scroll"}>
          <DialogHeader>
            <DialogTitle>Mise à jour du fond de caisse</DialogTitle>
            <DialogDescription>Nous ne pouvez modifier que le fond de caisse du jour ({new Date().toLocaleDateString()})</DialogDescription>
          </DialogHeader>

          <div>
            <CashRegisterForm onFormSubmitted={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
