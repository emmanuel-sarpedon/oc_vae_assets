"use server";

import prisma from "@/database";
import { returnErrorIfInvalidSession, returnErrorIfTargetUserHasToHighPrivileges, returnErrorIfTryToCreateUserWithTooHighPrivileges, returnErrorIfUnsatisfyingPrivileges } from "@/lib/auth";
import { _ERROR_CODE, PayloadWithPotentialError } from "@/lib/error";
import { Prisma, Utilisateur } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import UtilisateurUpdateArgs = Prisma.UtilisateurUpdateArgs;
import UtilisateurFindUniqueArgs = Prisma.UtilisateurFindUniqueArgs;
import StringFilter = Prisma.StringFilter;
import UtilisateurCreateInput = Prisma.UtilisateurCreateInput;
import UtilisateurGetPayload = Prisma.UtilisateurGetPayload;

export async function getUsersWithCashRegisterAssigned(): Promise<PayloadWithPotentialError<{ pagination: { total: number }; users: UtilisateurGetPayload<{ omit: { uti_salt: true; uti_mot_de_passe: true }; include: { CaissesUtilisateurs: { include: { caisse: true } } } }>[] }>> {
  const { error } = await returnErrorIfUnsatisfyingPrivileges();
  if (error) return { error, pagination: { total: 0 }, users: [] };
  const [users, count] = await prisma.$transaction([prisma.utilisateur.findMany({ omit: { uti_salt: true, uti_mot_de_passe: true }, include: { CaissesUtilisateurs: { include: { caisse: true } } } }), prisma.utilisateur.count(), prisma.caissesUtilisateurs.findMany()]);
  return { pagination: { total: count }, users, error: null };
}

export async function getUser(payload: UtilisateurFindUniqueArgs): Promise<PayloadWithPotentialError<{ user: Utilisateur | null }>> {
  const { error } = await returnErrorIfInvalidSession();
  if (error) return { error, user: null };
  return { error: null, user: await prisma.utilisateur.findFirst(payload) };
}

export async function disableUser(uti_id: number): Promise<PayloadWithPotentialError<object>> {
  const { id, error } = await returnErrorIfTargetUserHasToHighPrivileges({ targetUserId: uti_id });
  if (error) return { error };
  if (id === uti_id) return { error: _ERROR_CODE._CANNOT_DISABLE_SELF_ACCOUNT };
  await prisma.utilisateur.update({ where: { uti_id }, data: { uti_desactive: true } });
  return { error: null };
}

export async function activeUser(uti_id: number): Promise<PayloadWithPotentialError<object>> {
  const { id, error } = await returnErrorIfTargetUserHasToHighPrivileges({ targetUserId: uti_id });
  if (error) return { error };
  if (id === uti_id) return { error: _ERROR_CODE._CANNOT_DISABLE_SELF_ACCOUNT };
  await prisma.utilisateur.update({ where: { uti_id }, data: { uti_desactive: false } });
  return { error: null };
}

export async function editUser(payload: UtilisateurUpdateArgs): Promise<PayloadWithPotentialError<{ user: Utilisateur | null }>> {
  const { error } = await returnErrorIfTargetUserHasToHighPrivileges({ targetUserId: payload.where.uti_id });
  if (error) return { error, user: null };
  const { data, where } = payload;
  const existingUserWithThisIdentifier = await prisma.utilisateur.findFirst({ where: { uti_identifiant: data.uti_identifiant as string | StringFilter<"Utilisateur"> | undefined } });
  if (existingUserWithThisIdentifier && existingUserWithThisIdentifier.uti_id !== where.uti_id) return { error: _ERROR_CODE._CONFLICT, user: null };

  if (data.uti_mot_de_passe) {
    const hash = createHash("sha256");
    const salt = randomBytes(8).toString("hex");
    hash.update(data.uti_mot_de_passe + salt);

    data.uti_salt = salt;
    data.uti_mot_de_passe = hash.digest("hex");
  }

  return { error: null, user: await prisma.utilisateur.update({ data, where }) };
}

export async function createUser({ data }: { data: Omit<UtilisateurCreateInput, "uti_salt"> & { passwordConfirm?: string } }): Promise<PayloadWithPotentialError<{ user: Utilisateur | null }>> {
  const { error } = await returnErrorIfTryToCreateUserWithTooHighPrivileges({ userToCreate: data });
  if (error) return { error, user: null };

  if (data.passwordConfirm !== data.uti_mot_de_passe) return { error: _ERROR_CODE._PASSWORD, user: null };
  delete data.passwordConfirm;

  const hash = createHash("sha256");
  const salt = randomBytes(8).toString("hex");
  hash.update(data.uti_mot_de_passe + salt);
  data.uti_mot_de_passe = hash.digest("hex");

  return {
    error: null,
    user: await prisma.$transaction(async (tx) => {
      let identifier = data.uti_identifiant;
      let index = 0;
      let idIsUnique = false;

      while (!idIsUnique) {
        const count = await prisma.utilisateur.count({
          where: {
            uti_identifiant: index ? `${identifier}${index}` : identifier,
          },
        });

        if (count === 0) idIsUnique = true;
        else index++;
      }

      identifier = index ? `${identifier}${index}` : identifier;

      return tx.utilisateur.create({ data: { ...data, uti_identifiant: identifier, uti_salt: salt } });
    }),
  };
}
