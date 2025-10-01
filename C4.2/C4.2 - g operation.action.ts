"use server";

import prisma from "@/database";
import { returnErrorIfInvalidSession, returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse } from "@/lib/auth";
import { _ERROR_CODE, PayloadWithPotentialError } from "@/lib/error";
import { getCurrentDayDateRange } from "@/lib/utils";
import { Parser } from "@json2csv/plainjs";
import { Operation, OpeType, Prisma } from "@prisma/client";
import OperationFindManyArgs = Prisma.OperationFindManyArgs;
import OperationGetPayload = Prisma.OperationGetPayload;
import OperationUpdateArgs = Prisma.OperationUpdateArgs;
import OperationUpdateInput = Prisma.OperationUpdateInput;

export async function createManyOperations(
  payload: Omit<Operation, "ope_id" | "ope_transfere" | "ope_created_at" | "ope_canceled" | "ope_canceled_by_id" | "ope_canceled_at" | "ope_created_by_id" | "ope_updated_at" | "ope_updated_by_id" | "ope_transfert_id">[],
): Promise<PayloadWithPotentialError<object>> {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error };

  for (const cai_id of [...new Set(payload.map(({ ope_caisse_id }) => ope_caisse_id))]) {
    const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id });
    if (error) return { error };
  }

  await prisma.operation.createMany({ data: payload.map((v) => ({ ope_created_at: new Date(), ope_transfere: false, ope_canceled: false, ope_created_by_id: id, ...v })) });
  return { error: null };
}

export async function getClientIDs(input?: string): Promise<PayloadWithPotentialError<{ IDs: string[] | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, IDs: null };

  return {
    error: null,
    IDs: await prisma.operation
      .findMany({
        distinct: ["ope_client_id"],
        orderBy: { ope_id: "desc" },
        where: { ope_client_id: { startsWith: input } },
        take: 10,
      })
      .then((data) => {
        return data.map(({ ope_client_id }) => ope_client_id).filter((id) => !!id) as string[];
      }),
  };
}

export async function getClientNames(input?: string): Promise<PayloadWithPotentialError<{ names: string[] | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, names: null };

  return {
    error: null,
    names: await prisma.operation
      .findMany({
        distinct: ["ope_client_nom"],
        orderBy: { ope_id: "desc" },
        where: { ope_client_nom: { contains: input } },
        take: 10,
      })
      .then((data) => data.map(({ ope_client_nom }) => ope_client_nom).filter((name) => !!name) as string[]),
  };
}

export async function getClientPhoneNumbers(input?: string): Promise<PayloadWithPotentialError<{ phoneNumbers: string[] | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, phoneNumbers: null };

  return {
    error: null,
    phoneNumbers: await prisma.operation
      .findMany({
        distinct: ["ope_client_tel"],
        orderBy: { ope_id: "desc" },
        where: { ope_client_tel: { contains: input } },
        take: 10,
      })
      .then((data) => data.map(({ ope_client_tel }) => ope_client_tel).filter((tel) => !!tel) as string[]),
  };
}

export async function getOperations({ ...findManyArgs }: OperationFindManyArgs): Promise<PayloadWithPotentialError<{ operations: Operation[]; pagination: { total: number } }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, operations: [], pagination: { total: 0 } };

  const query = {
    orderBy: { ope_created_at: "desc" },
    ...findManyArgs,
  } satisfies OperationFindManyArgs;

  const [operations, count] = await Promise.all([prisma.operation.findMany(query), prisma.operation.count({ where: query.where })]);
  return { pagination: { total: count }, operations, error: null };
}

export async function getSumByOperationType({ ope_caisse_id, ope_transfere }: Pick<Operation, "ope_caisse_id" | "ope_transfere">): Promise<PayloadWithPotentialError<{ sum: null | { _count: number, _sum: { ope_montant: number | null }; ope_type: OpeType; ope_hors_z: boolean | null }[] }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, sum: null };

  return {
    error: null,
    sum: await prisma.operation.groupBy({
      by: ["ope_type", "ope_hors_z"],
      where: {
        ope_caisse_id,
        ope_transfere,
        ope_created_at: { ...getCurrentDayDateRange() },
        ope_canceled: false,
      },
      _sum: {
        ope_montant: true,
      },
      _count: true,
    }),
  };
}

export async function getOperationsSumByTransferId({ tra_id }: { tra_id: number }): Promise<PayloadWithPotentialError<{ sum: null | { _count: number, _sum: { ope_montant: number | null }; ope_type: OpeType; ope_hors_z: boolean | null }[] }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, sum: null };

  return {
    error: null,
    sum: await prisma.operation.groupBy({
      by: ["ope_type", "ope_hors_z"],
      where: { ope_transfert_id: tra_id },
      _sum: { ope_montant: true },
      _count: true,
    }),
  };
}

export async function getOperationsAndGenerateCsv({ ...findManyArgs }: OperationFindManyArgs): Promise<PayloadWithPotentialError<{ csv: string | null }>> {
  const { error, operations } = (await getOperations({ ...findManyArgs, take: undefined, skip: undefined })) as unknown as { operations: OperationGetPayload<{ include: { ope_caisse: true; ope_created_by: true } }>[]; error: _ERROR_CODE | null };
  if (error) return { error, csv: null };

  const operationsFormated = operations.map(({ ope_caisse, ope_created_by, ...rest }) => ({
    ...rest,
    ope_caisse: ope_caisse.cai_nom,
    ope_created_by: [ope_created_by?.uti_prenom, ope_created_by?.uti_nom].filter(Boolean).join(" "),
  }));
  const parser = new Parser({ delimiter: ";" });
  return { error: null, csv: parser.parse(operationsFormated) };
}

export async function updateOperation({ where, data }: OperationUpdateArgs): Promise<PayloadWithPotentialError<{ operation: Operation | null }>> {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error, operation: null };

  const { uti_admin, uti_superviseur, uti_comptable } = await prisma.utilisateur.findUniqueOrThrow({ where: { uti_id: id } });
  if (!uti_admin && !uti_superviseur && !uti_comptable) {
    const assignedCaisses = await prisma.caissesUtilisateurs.findMany({ where: { utilisateur_id: id, caisse: { cai_desactive: false } } }).then((data) => data.map(({ caisse_id }) => caisse_id));
    const { ope_caisse_id } = (await prisma.operation.findUnique({ where: { ope_id: where.ope_id } })) || {};
    if (!ope_caisse_id || !assignedCaisses.includes(ope_caisse_id)) return { error: _ERROR_CODE._FORBIDDEN, operation: null };
  }

  return { error: null, operation: await prisma.operation.update({ where, data: { ope_updated_at: new Date(), ope_updated_by_id: id, ...data } as OperationUpdateInput }) };
}

export async function deleteOperation(ope_id: number): Promise<PayloadWithPotentialError<{ operation: Operation | null }>> {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error, operation: null };

  const { uti_admin, uti_superviseur, uti_comptable } = await prisma.utilisateur.findUniqueOrThrow({ where: { uti_id: id } });
  if (!uti_admin && !uti_superviseur && !uti_comptable) {
    const assignedCaisses = await prisma.caissesUtilisateurs.findMany({ where: { utilisateur_id: id, caisse: { cai_desactive: false } } }).then((data) => data.map(({ caisse_id }) => caisse_id));
    const { ope_caisse_id } = (await prisma.operation.findUnique({ where: { ope_id } })) || {};
    if (!ope_caisse_id || !assignedCaisses.includes(ope_caisse_id)) return { error: _ERROR_CODE._FORBIDDEN, operation: null };
  }

  return { error: null, operation: await prisma.operation.update({ where: { ope_id }, data: { ope_canceled: true, ope_canceled_at: new Date(), ope_canceled_by_id: id } }) };
}
