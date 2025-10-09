"use server";

import prisma from "@/database";
import { getCashRegistersAssigned } from "@/database/server-actions/caisse.action";
import { createSession, getSession } from "@/lib/cookie";
import { _ERROR_CODE } from "@/lib/error";
import { hasSatisfyingPrivileges } from "@/lib/utils";
import { Prisma, Utilisateur } from "@prisma/client";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import IntFilter = Prisma.IntFilter;

export async function login({ username, password }: { username: string; password: string }) {
  const { user, error } = await checkUsernameAndPassword({ username, password });

  if (!user) return { error: error || _ERROR_CODE._UNKNOWN };

  const jwt = await generateJwt(user);
  await createSession(jwt);

  redirect("/caisse");
}

export async function logout() {
  (await cookies()).delete("session-token");
  redirect("/connexion");
}

async function checkUsernameAndPassword({ username, password }: { username: string; password: string }): Promise<{ user?: Utilisateur; error?: _ERROR_CODE }> {
  try {
    const user = await prisma?.utilisateur.findFirst({
      where: { OR: [{ uti_identifiant: username }, { uti_email: username }] },
    });

    if (!user) return { error: _ERROR_CODE._BAD_CREDENTIALS };

    const { uti_mot_de_passe, uti_salt, uti_desactive } = user;

    const isCorrectPassword = await isPasswordMatchWithHash({ passwordToCheck: password, uti_salt, uti_mot_de_passe });

    if (!isCorrectPassword) return { error: _ERROR_CODE._BAD_CREDENTIALS };
    if (uti_desactive) return { error: _ERROR_CODE._ACCOUNT_DISABLE };
    return { user };
  } catch (e: unknown) {
    return { error: _ERROR_CODE._UNKNOWN };
  }
}

async function isPasswordMatchWithHash({ passwordToCheck, uti_salt, uti_mot_de_passe }: { passwordToCheck: string } & Pick<Utilisateur, "uti_salt" | "uti_mot_de_passe">) {
  const hash = createHash("sha256");
  hash.update(passwordToCheck + uti_salt);

  return hash.digest("hex") === uti_mot_de_passe;
}

async function generateJwt({ uti_id }: Utilisateur) {
  return jwt.sign(
    {
      id: uti_id,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: "12h" },
  );
}

export async function decodeJwt(token: string) {
  try {
    return { session: jwt.verify(token, process.env.JWT_SECRET_KEY as string), error: null };
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      return {
        error: "Session expirée. Veuillez vous reconnecter",
        session: null,
      };
    }

    return { session: null, error: JSON.stringify(e) };
  }
}

export async function returnErrorIfInvalidSession() {
  const { session } = await getSession();
  const { id } = session || {};
  if (!id) return { error: _ERROR_CODE._UNAUTHORIZED };
  return { id, error: null };
}

export async function returnErrorIfUnsatisfyingPrivileges() {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error };
  const { uti_admin, uti_superviseur, uti_comptable } = (await prisma.utilisateur.findUnique({ where: { uti_id: id } })) || {};
  if (!uti_admin && !uti_superviseur && !uti_comptable) return { error: _ERROR_CODE._FORBIDDEN };
  return { error: null };
}

export async function returnErrorIfTargetUserHasToHighPrivileges({ targetUserId }: { targetUserId?: number }) {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error };

  if (id === targetUserId) return { id }; // updating own account

  const currentUser = await prisma.utilisateur.findUnique({ where: { uti_id: id } });
  if (!currentUser) return { error: _ERROR_CODE._FORBIDDEN };

  const targetUser = await prisma.utilisateur.findUnique({ where: { uti_id: targetUserId } });
  if (!targetUser) return { error: _ERROR_CODE._FORBIDDEN };

  if (!hasSatisfyingPrivileges({ current: currentUser, target: targetUser })) return { error: _ERROR_CODE._FORBIDDEN };

  return { id, error: null };
}

export async function returnErrorIfTryToCreateUserWithTooHighPrivileges({ userToCreate }: { userToCreate: Partial<Utilisateur> }) {
  const { id, error } = await returnErrorIfInvalidSession();
  if (error) return { error };

  const currentUser = await prisma.utilisateur.findUnique({ where: { uti_id: id } });
  if (!currentUser) return { error: _ERROR_CODE._FORBIDDEN };

  if (!hasSatisfyingPrivileges({ current: currentUser, target: userToCreate })) return { error: _ERROR_CODE._FORBIDDEN };

  return { error: null };
}

export async function returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id }: { cai_id?: number | IntFilter<"ControleCaisse" | "FondDeCaisse" | "Transfert"> }) {
  const { cashRegisters, error } = await getCashRegistersAssigned();
  if (error) return { error };
  if (!cai_id) return { error: null };
  if (!cashRegisters?.map(({ cai_id }) => cai_id).includes(+cai_id)) return { error: _ERROR_CODE._FORBIDDEN };
  return { error: null };
}

export async function returnErrorIfUnsatisfyingPrivilegesForSpecificTransfer({ tra_id }: { tra_id: number }) {
  const { tra_caisse_id } = (await prisma.transfert.findUnique({ where: { tra_id } })) || {};
  const { error } = await returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id: tra_caisse_id });
  if (error) return { error };
  return { error: null };
}
