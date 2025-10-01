import FormOperationLayout, { operationFormSchema } from "@/components/FormOperationLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import _QUERY_KEYS from "@/constants/queryKeys";
import { createManyOperations } from "@/database/server-actions/operation.action";
import { useCaisseStore, useOperationsStore, useOperationSumStore } from "@/hooks/store";
import { toastError } from "@/lib/error";
import { cn, formatCurrency, getNumberFromCurrency, transformPaymentTypeToOperationEnum } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import useSelfAssignedCashRegisters from "@/hooks/useSelfAssignedCashRegisters";

const paymentTypeValues: readonly [string, ...string[]] = ["Chèque", "Espèces", "Carte bancaire", "Sortie de caisse"];
const paymentTypeEnum = z.enum(paymentTypeValues);

const formSchema = operationFormSchema.extend({
  payments: z.array(
    z.object({
      type: paymentTypeEnum,
      amount: z.union([z.string(), z.number()]).refine((value) => getNumberFromCurrency(value) > 0, { message: "Vous devez renseigner un montant supérieur à 0 €" }),
    }),
  ),
});

export default function AddOperation() {
  const queryClient = useQueryClient();
  const { caisse } = useCaisseStore();
  const { data } = useSelfAssignedCashRegisters();
  const operationSumStore = useOperationSumStore();
  const operationsStore = useOperationsStore();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
      clientTel: "",
      factureId: "",
      horsZ: true,
      note: "",
      payments: [{ type: "Espèces", amount: formatCurrency(0) }],
    },
  });

  const { formState, control, handleSubmit, reset, setValue, watch } = form;

  const disabled = useMemo(() => {
    if (!caisse?.cai_id) return true;
    return !data?.map(({ cai_id }) => cai_id).includes(caisse?.cai_id);
  }, [caisse?.cai_id, data]);

  const amountTotal: () => number = useCallback(() => {
    return watch("payments").reduce((acc, { amount, type }) => {
      if (type === "Sortie de caisse") return acc - getNumberFromCurrency(amount);
      return acc + getNumberFromCurrency(amount);
    }, 0);
  }, [watch]);

  const { fields, append, remove } = useFieldArray({ control, name: "payments" });

  async function onSubmit({ clientId, clientName, clientTel, factureId, note, payments, horsZ }: z.infer<typeof formSchema>) {
    try {
      const { cai_id } = caisse || {};
      if (!cai_id) return;

      const payload = payments
        .map(({ type, amount }) => {
          return {
            ope_type: transformPaymentTypeToOperationEnum(type),
            ope_hors_z: horsZ,
            ope_caisse_id: cai_id,
            ope_client_id: clientId || null,
            ope_client_nom: clientName || null,
            ope_client_tel: clientTel || null,
            ope_facture: factureId || null,
            ope_montant: getNumberFromCurrency(amount),
            ope_note: note || null,
          };
        })
        .filter(({ ope_montant }) => ope_montant > 0);

      const { error } = await createManyOperations(payload);
      if (error) {
        toastError(error);
        return;
      }

      operationsStore.sync({ caisseId: cai_id });
      operationSumStore.sync({ caisseId: cai_id });

      await queryClient.invalidateQueries({ queryKey: [_QUERY_KEYS._OPERATIONS] });

      reset();
      setOpen(false);
    } catch (e) {
      toastError(null, e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <PlusIcon className={"mr-2"} />
          Ajouter un règlement
        </Button>
      </DialogTrigger>
      <DialogContent className={"max-h-screen overflow-y-scroll lg:overflow-auto"}>
        <DialogHeader>
          <DialogTitle>Ajouter un règlement</DialogTitle>
          <DialogDescription className={"hidden lg:block"}>Renseignez les informations</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className={"flex flex-col gap-y-1 lg:gap-y-3"} onSubmit={handleSubmit(onSubmit)}>
            <FormOperationLayout control={control as unknown as Control<z.infer<typeof operationFormSchema>>} setValue={setValue} clientId={form.watch("clientId")} clientName={form.watch("clientName")} clientTel={form.watch("clientTel")} />

            <Separator className={"my-6"} />

            <ScrollArea className={"max-h-64 px-4"}>
              {fields.map((field, index) => (
                <div key={field.id} className={"grid grid-cols-12 content-center gap-x-5 py-1"}>
                  <FormField
                    control={control}
                    name={`payments.${index}.type`}
                    render={({ field }) => (
                      <FormItem className={"col-span-6"}>
                        <FormLabel className={cn("text-xs", { hidden: index !== 0 })}>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentTypeValues
                              .filter((value) => {
                                if (value !== "Espèces" && value !== "Sortie de caisse") return true;
                                if (value === field.value) return true;
                                return !fields.some((f) => f.type === value);
                              })
                              .map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`payments.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className={"col-span-3"}>
                        <FormLabel className={cn("text-xs", { hidden: index !== 0 })}>Montant</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onBlur={(e) => {
                              const { value } = e.target;
                              field.onChange(formatCurrency(value || 0));
                            }}
                            onFocus={(e) => {
                              const { value } = e.target;
                              if (!value) return;
                              const valueFormatted = getNumberFromCurrency(value);
                              if (valueFormatted === 0) field.onChange("");
                              else field.onChange(getNumberFromCurrency(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    variant={"destructive"}
                    className={cn("col-span-2 mt-auto p-3", {
                      invisible: fields.length <= 1,
                    })}
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className={"aspect-square h-auto w-4"} />
                  </Button>
                </div>
              ))}
            </ScrollArea>

            <p className={"grid grid-cols-12 gap-x-5 p-3 text-sm font-bold"}>
              <span className={"col-start-7"}>{formatCurrency(amountTotal())}</span>
            </p>

            <Button
              variant={"ghost"}
              type={"button"}
              onClick={() => {
                if (fields.some((f) => f.type === "Espèces")) {
                  append({ type: "Carte bancaire", amount: formatCurrency(0) });
                } else {
                  append({ type: "Espèces", amount: formatCurrency(0) });
                }
              }}
            >
              <PlusIcon className={"mr-2"} />
              Ajouter un autre mode de règlement
            </Button>
            <Separator className={"my-6"} />

            <p>{JSON.stringify(formState.errors.root?.message)}</p>

            <Button type="submit" disabled={formState.isSubmitting || amountTotal() === 0}>
              Enregistrer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
