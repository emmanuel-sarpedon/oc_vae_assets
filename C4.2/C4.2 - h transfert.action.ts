"use server";

import prisma from "@/database";
import { returnErrorIfInvalidSession, returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse, returnErrorIfUnsatisfyingPrivilegesForSpecificTransfer } from "@/lib/auth";
import { PayloadWithPotentialError } from "@/lib/error";
import { Prisma, Transfert } from "@prisma/client";
import TransfertFindManyArgs = Prisma.TransfertFindManyArgs;
import CoupureCreateManyInput = Prisma.CoupureCreateManyInput;
import TransfertUpdateArgs = Prisma.TransfertUpdateArgs;

export async function createTransfer(payload: {
  coupure: CoupureCreateManyInput;
  cca_id: number;
  cai_id: number;
  transfert: Pick<Transfert, "tra_nom" | "tra_caisse_id" | "tra_montant" | "tra_note">;
  operations: number[];
  fdc_id: number;
}): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: payload.cai_id });
  if (error) return { error };

  await prisma?.$transaction(async (tx) => {
    const coupureTransfert = await tx.coupure.create({ data: { ...payload.coupure } });

    const { tra_id } = await tx.transfert.create({
      data: {
        ...payload.transfert,
        tra_coupure_id: coupureTransfert.cou_id,
        tra_controle_caisse_id: payload.cca_id,
        tra_date: new Date(),
        tra_fond_de_caisse_id: payload.fdc_id,
      },
    });

    await tx.controleCaisse.update({
      where: { cca_id: payload.cca_id },
      data: { cca_transfere: true },
    });

    await tx.operation.updateMany({
      where: {
        OR: payload.operations.map((id) => ({ ope_id: id })),
      },
      data: {
        ope_transfert_id: tra_id,
        ope_transfere: true,
      },
    });
  });

  return { error: null };
}

export async function getTransfers({ ...findManyArgs }: TransfertFindManyArgs): Promise<PayloadWithPotentialError<{ pagination: { total: number }; transfers: Transfert[] }>> {
  const { error } = await returnErrorIfInvalidSession();

  if (error) return { error, pagination: { total: 0 }, transfers: [] };

  const query = {
    orderBy: { tra_date: "desc" },
    ...findManyArgs,
  } satisfies TransfertFindManyArgs;

  const [transfers, count] = await Promise.all([prisma.transfert.findMany(query), prisma.transfert.count({ where: query.where })]);
  return { pagination: { total: count }, transfers, error: null };
}

export async function updateTransfer(payload: TransfertUpdateArgs): Promise<PayloadWithPotentialError<{ transfer: Transfert | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificTransfer({ tra_id: payload.where.tra_id || 0 });
  if (error) return { error, transfer: null };
  return { transfer: await prisma.transfert.update(payload), error: null };
}
