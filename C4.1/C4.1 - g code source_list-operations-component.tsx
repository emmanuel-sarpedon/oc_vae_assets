import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OperationSum } from "@/hooks/store";
import { cn, formatCurrency } from "@/lib/utils";
import { useMemo } from "react";

export default function OperationsSummaryLayout({ isLoading, operationSum }: { isLoading: boolean; operationSum: OperationSum[] }) {
  const findCallback = ({ ope_hors_z }: { ope_hors_z: boolean | null }) => ope_hors_z === false;
  const findHorsZCallback = ({ ope_hors_z }: { ope_hors_z: boolean | null }) => ope_hors_z === true;

  const cashSum = useMemo(() => {
    const cash = operationSum.filter(({ ope_type }) => ope_type === "ESPECES");
    return { z: cash.find(findCallback)?._sum.ope_montant, horsZ: cash.find(findHorsZCallback)?._sum.ope_montant };
  }, [operationSum]);

  const cardSum = useMemo(() => {
    const card = operationSum.filter(({ ope_type }) => ope_type === "CB");
    return { z: card.find(findCallback)?._sum.ope_montant, horsZ: card.find(findHorsZCallback)?._sum.ope_montant };
  }, [operationSum]);

  const checkSum = useMemo(() => {
    const check = operationSum.filter(({ ope_type }) => ope_type === "CHEQUES");
    return { z: check.find(findCallback)?._sum.ope_montant, horsZ: check.find(findHorsZCallback)?._sum.ope_montant };
  }, [operationSum]);

  const outSum = useMemo(() => {
    const out = operationSum.filter(({ ope_type }) => ope_type === "SORTIE");
    return out.at(0)?._sum.ope_montant;
  }, [operationSum]);

  const cashCount = useMemo(() => {
    const cash = operationSum.filter(({ ope_type }) => ope_type === "ESPECES");
    return { z: cash.find(findCallback)?._count, horsZ: cash.find(findHorsZCallback)?._count };
  }, [operationSum]);

  const cardCount = useMemo(() => {
    const card = operationSum.filter(({ ope_type }) => ope_type === "CB");
    return { z: card.find(findCallback)?._count, horsZ: card.find(findHorsZCallback)?._count };
  }, [operationSum]);

  const checkCount = useMemo(() => {
    const check = operationSum.filter(({ ope_type }) => ope_type === "CHEQUES");
    return { z: check.find(findCallback)?._count, horsZ: check.find(findHorsZCallback)?._count };
  }, [operationSum]);

  const outCount = useMemo(() => {
    const out = operationSum.filter(({ ope_type }) => ope_type === "SORTIE");
    return out.at(0)?._count;
  }, [operationSum]);

  const rows = [
    {
      label: "Espèces",
      value: [formatCurrency(cashSum.z || 0, { doNotReturnZero: true }), cashCount.z ? `(${cashCount.z})` : null].filter(Boolean).join(" "),
    },
    {
      label: "Espèces hors Z",
      value: [formatCurrency(cashSum.horsZ || 0, { doNotReturnZero: true }), cashCount.horsZ ? `(${cashCount.horsZ})` : null].filter(Boolean).join(" "),
    },
    {
      label: "Carte bancaire",
      value: [formatCurrency(cardSum.z || 0, { doNotReturnZero: true }), cardCount.z ? `(${cardCount.z})` : null].filter(Boolean).join(" "),
    },
    {
      label: "Carte bancaire hors Z",
      value: [formatCurrency(cardSum.horsZ || 0, { doNotReturnZero: true }), cardCount.horsZ ? `(${cardCount.horsZ})` : null].filter(Boolean).join(" "),
    },
    {
      label: "Chèque",
      value: [formatCurrency(checkSum.z || 0, { doNotReturnZero: true }), checkCount.z ? `(${checkCount.z})` : null].filter(Boolean).join(" "),
    },
    {
      label: "Chèque hors Z",
      value: [formatCurrency(checkSum.horsZ || 0, { doNotReturnZero: true }), checkCount.horsZ ? `(${checkCount.horsZ})` : null].filter(Boolean).join(" "),
    },
    {
      label: "Sortie de caisse",
      value: [formatCurrency((outSum || 0) * -1, { doNotReturnZero: true }), outCount ? `(${outCount})` : null].filter(Boolean).join(" "),
    },
  ];

  return (
    <div>
      <Table className={"bg-white"}>
        <TableHeader className={"bg-primary"}>
          <TableRow>
            <TableHead className={"whitespace-nowrap text-white"}>Catégorie</TableHead>
            <TableHead className={"whitespace-nowrap text-white"}>Sous-total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map(({ label, value }, index) => (
            <TableRow key={index} className={cn({ "bg-red-50 text-red-400": label === "Sortie de caisse" })}>
              <TableCell className={"whitespace-nowrap font-semibold"}>{label}</TableCell>
              <TableCell className={"whitespace-nowrap"}>{isLoading ? <Skeleton className={"h-4 w-full"} /> : value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
