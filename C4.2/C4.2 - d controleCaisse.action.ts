"use server";

import prisma from "@/database";
import { returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse } from "@/lib/auth";
import { PayloadWithPotentialError } from "@/lib/error";
import { getAmountOfCoupure } from "@/lib/utils";
import { ControleCaisse, Coupure, Prisma } from "@prisma/client";
import ControleCaisseFindFirstArgs = Prisma.ControleCaisseFindFirstArgs;

export async function createControlCashRegister({ coupure, cai_id }: { cai_id: number; coupure: Omit<Coupure, "cou_id" | "cou_montant"> }): Promise<PayloadWithPotentialError<{ controlCashRegister: ControleCaisse | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id });
  if (error) return { error, controlCashRegister: null };
  return {
    error: null,
    controlCashRegister: await prisma?.$transaction(async (tx) => {
      const { cou_id } = await tx.coupure.create({ data: { ...coupure, cou_montant: getAmountOfCoupure(coupure) } });
      return tx.controleCaisse.create({ data: { cca_caisse_id: cai_id, cca_date: new Date(), cca_coupure_id: cou_id, cca_montant: getAmountOfCoupure(coupure) } });
    }),
  };
}

export async function getLastControlCashRegister({ ...findFirstArgs }: ControleCaisseFindFirstArgs): Promise<PayloadWithPotentialError<{ controlCashRegister: ControleCaisse | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: findFirstArgs.where?.cca_caisse_id });
  if (error) return { error, controlCashRegister: null };
  return { error: null, controlCashRegister: await prisma?.controleCaisse.findFirst(findFirstArgs) };
}
