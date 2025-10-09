"use server";

import { decodeJwt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const _SAVED_ID_COOKIE_NAME = "app-caisse-id";
const _ONE_YEAR = 60 * 60 * 24 * 365 * 1000;

export async function saveIdInBrowserMemory(id: string) {
  (await cookies()).set(_SAVED_ID_COOKIE_NAME, id, { maxAge: _ONE_YEAR, expires: new Date(Date.now() + _ONE_YEAR) });
}

export async function getIdInBrowserMemory() {
  return (await cookies()).get(_SAVED_ID_COOKIE_NAME);
}

export async function deleteIdInBrowserMemory() {
  const id = await getIdInBrowserMemory();
  if (id) (await cookies()).delete(_SAVED_ID_COOKIE_NAME);
}

export async function createSession(jwt: string) {
  (await cookies()).set("session-token", jwt, { maxAge: _ONE_YEAR, expires: new Date(Date.now() + _ONE_YEAR) });
}

export async function getSession() {
  const { value } = (await cookies()).get("session-token") || {};
  if (!value) redirect("/connexion");

  return (await decodeJwt(value)) as { session: Session | null; error: string | null };
}
