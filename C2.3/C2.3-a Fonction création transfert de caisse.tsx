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


export async function returnErrorIfUnsatisfyingPrivilegesForSpecificCaisse({ cai_id }: { cai_id?: number | IntFilter<"ControleCaisse" | "FondDeCaisse" | "Transfert"> }) {
  const { cashRegisters, error } = await getCashRegistersAssigned();
  if (error) return { error };
  if (!cai_id) return { error: null };
  if (!cashRegisters?.map(({ cai_id }) => cai_id).includes(+cai_id)) return { error: _ERROR_CODE._FORBIDDEN };
  return { error: null };
}
