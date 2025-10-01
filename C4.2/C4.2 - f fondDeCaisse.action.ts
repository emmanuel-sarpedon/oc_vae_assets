"use server";
import prisma from "@/database";
import { returnErrorIfInvalidSession, returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse } from "@/lib/auth";
import { PayloadWithPotentialError } from "@/lib/error";
import { getCurrentDayDateRange, getDateRangeWithGapFromToday } from "@/lib/utils";
import { FondDeCaisse, Prisma } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import FondDeCaisseFindFirstArgs = Prisma.FondDeCaisseFindFirstArgs;
dayjs.extend(utc);

export async function createCashFloat({ fdc_caisse_id, ...rest }: { fdc_caisse_id: number; fdc_montant: number; fdc_coupure_id: number }): Promise<PayloadWithPotentialError<{ cashFloat: FondDeCaisse | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: fdc_caisse_id });
  if (error) return { error, cashFloat: null };
  return { error: null, cashFloat: await prisma.fondDeCaisse.create({ data: { ...rest, fdc_caisse_id, fdc_date: new Date() } }) };
}

export async function getCashFloat({ fdc_caisse_id }: { fdc_caisse_id: number }): Promise<PayloadWithPotentialError<{ cashFloat: FondDeCaisse | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: fdc_caisse_id });
  if (error) return { error, cashFloat: null };
  return { error: null, cashFloat: await prisma.fondDeCaisse.findFirst({ where: { fdc_caisse_id, fdc_date: { ...getCurrentDayDateRange() } }, orderBy: { fdc_date: "desc" }, include: { fdc_coupure: true } }) };
}

export async function getCashFloatOfDayBefore({ fdc_caisse_id }: { fdc_caisse_id: number }): Promise<PayloadWithPotentialError<{ cashFloat: FondDeCaisse | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: fdc_caisse_id });
  if (error) return { error, cashFloat: null };
  const DAY_GAP = -1; // Yesterday
  return { error: null, cashFloat: await prisma.fondDeCaisse.findFirst({ where: { fdc_caisse_id, fdc_date: { ...getDateRangeWithGapFromToday(DAY_GAP) } }, orderBy: { fdc_date: "desc" }, include: { fdc_coupure: true } }) };
}

export async function getLastCashFloat({ fdc_caisse_id }: { fdc_caisse_id: number }): Promise<PayloadWithPotentialError<{ cashFloat: FondDeCaisse | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: fdc_caisse_id });
  if (error) return { error, cashFloat: null };
  return { error: null, cashFloat: await prisma.fondDeCaisse.findMany({ where: { fdc_caisse_id }, orderBy: { fdc_date: "desc" }, include: { fdc_coupure: true }, take: 1 }).then((results) => results[0]) };
}

export async function getCashFloats(payload: FondDeCaisseFindFirstArgs): Promise<PayloadWithPotentialError<{ cashFloats: FondDeCaisse[] | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, cashFloats: null };
  return { error: null, cashFloats: await prisma.fondDeCaisse.findMany(payload) };
}
