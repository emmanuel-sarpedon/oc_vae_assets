"use server";

import prisma from "@/database";
import { returnErrorIfInvalidSession, returnErrorIfUnsatisfyingPrivileges } from "@/lib/auth";
import { PayloadWithPotentialError } from "@/lib/error";
import { Caisse, Prisma } from "@prisma/client";
import CaisseFindFirstArgs = Prisma.CaisseFindFirstArgs;
import CaisseUpdateArgs = Prisma.CaisseUpdateArgs;
import CaisseCreateArgs = Prisma.CaisseCreateArgs;
import CaisseGetPayload = Prisma.CaisseGetPayload;

export async function getCashRegistersAssigned(): Promise<PayloadWithPotentialError<{ cashRegisters: Caisse[] | null }>> {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error, cashRegisters: null };

  return {
    cashRegisters: await prisma.$transaction(async (tx) => {
      const { uti_admin, uti_comptable, uti_superviseur } = (await tx.utilisateur.findUnique({ where: { uti_id: id } })) || {};
      if (uti_admin || uti_comptable || uti_superviseur) return tx.caisse.findMany({ orderBy: { cai_nom: "asc" } });

      const caisses = await tx.caissesUtilisateurs.findMany({ where: { utilisateur_id: id, caisse: { cai_desactive: false } } }).then((data) => data.map(({ caisse_id }) => caisse_id));

      return tx.caisse.findMany({
        orderBy: { cai_nom: "asc" },
        where: {
          OR: caisses.map((id) => ({ cai_id: id })),
        },
      });
    }),
    error: null,
  };
}

export async function getCashRegisterById({ caisse_id }: { caisse_id: number }): Promise<PayloadWithPotentialError<{ cashRegister: null | Caisse }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, cashRegister: null };
  return { cashRegister: await prisma.caisse.findFirst({ where: { cai_id: caisse_id } }), error: null };
}

export async function getCashRegister(payload: CaisseFindFirstArgs): Promise<PayloadWithPotentialError<{ cashRegister: Caisse | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, cashRegister: null };
  return { cashRegister: await prisma.caisse.findFirst(payload), error: null };
}

export async function getCashRegistersUnassigned(): Promise<PayloadWithPotentialError<{ cashRegisters: Caisse[] | null }>> {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error, cashRegisters: null };

  return {
    cashRegisters: await prisma.$transaction(async (tx) => {
      const { uti_admin, uti_comptable, uti_superviseur } = (await tx.utilisateur.findUnique({ where: { uti_id: id } })) || {};
      if (uti_admin || uti_comptable || uti_superviseur) return [];

      const caisses = await tx.caissesUtilisateurs.findMany({ where: { utilisateur_id: id, caisse: { cai_desactive: false } } }).then((data) => data.map(({ caisse_id }) => caisse_id));

      return tx.caisse.findMany({
        orderBy: { cai_nom: "asc" },
        where: {
          cai_id: { notIn: caisses },
        },
      });
    }),
    error: null,
  };
}

export async function assignCashRegisterToUser({ uti_id, cai_id }: { uti_id: number; cai_id: number }): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error };
  await prisma.caissesUtilisateurs.upsert({ where: { caisse_id_utilisateur_id: { caisse_id: cai_id, utilisateur_id: uti_id } }, update: {}, create: { caisse_id: cai_id, utilisateur_id: uti_id } });
  return { error: null };
}

export async function unassignCashRegisterToUser({ uti_id, cai_id }: { uti_id: number; cai_id: number }): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error };
  await prisma.caissesUtilisateurs.delete({ where: { caisse_id_utilisateur_id: { caisse_id: cai_id, utilisateur_id: uti_id } } });
  return { error: null };
}

export async function getCashRegistersWithUsersAssigned(): Promise<PayloadWithPotentialError<{ cashRegisters: CaisseGetPayload<{ include: { CaissesUtilisateurs: { include: { utilisateur: { omit: { uti_salt: true; uti_mot_de_passe: true } } } } } }>[] | null }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error, cashRegisters: null };
  return {
    error: null,
    cashRegisters: await prisma.caisse.findMany({ include: { CaissesUtilisateurs: { include: { utilisateur: { omit: { uti_salt: true, uti_mot_de_passe: true } } } } } }),
  };
}

export async function updateCashRegister(payload: CaisseUpdateArgs): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error };
  await prisma.caisse.update(payload);
  return { error: null };
}

export async function createCaisse(payload: CaisseCreateArgs): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error };
  await prisma.caisse.create(payload);
  return { error: null };
}

export async function activeCaisse(cai_id: number): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error };
  await prisma.caisse.update({ where: { cai_id }, data: { cai_desactive: false } });
  return { error: null };
}

export async function disableCaisse(cai_id: number): Promise<PayloadWithPotentialError<object>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error };
  await prisma.caisse.update({ where: { cai_id }, data: { cai_desactive: true } });
  return { error: null };
}
