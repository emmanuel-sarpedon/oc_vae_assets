"use server";

import prisma from "@/database";
import { returnErrorIfInvalidSession } from "@/lib/auth";
import { PayloadWithPotentialError } from "@/lib/error";
import { Coupure, Prisma } from "@prisma/client";
import CoupureFindManyArgs = Prisma.CoupureFindManyArgs;

export async function createDenomination({ coupure }: { coupure: Omit<Coupure, "cou_id"> }): Promise<PayloadWithPotentialError<{ denomination: Coupure | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, denomination: null };
  return {
    error: null,
    denomination: await prisma.coupure.create({
      data: { ...coupure },
    }),
  };
}

export async function getDenominations({ ...findManyArgs }: CoupureFindManyArgs): Promise<PayloadWithPotentialError<{ denominations: Coupure[] | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, denominations: null };
  return { error: null, denominations: await prisma.coupure.findMany(findManyArgs) };
}
