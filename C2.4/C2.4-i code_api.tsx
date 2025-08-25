// prettier-ignore
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const { ope_caisse_id, ope_created_at_gte, ope_created_at_lt, ope_type, ope_client_nom, ope_note } = Z_QUERY.parse({
      ope_caisse_id:      searchParams.get("ope_caisse_id"),
      ope_created_at_gte: searchParams.get("ope_created_at_gte"),
      ope_created_at_lt:  searchParams.get("ope_created_at_lt"),
      ope_type:           searchParams.get("ope_type"),
      ope_client_nom:     searchParams.get("ope_client_nom"),
      ope_note:           searchParams.get("ope_note"),
    });

    const ope_created_at: DateTimeFilter<"Operation"> = {};
    if (ope_created_at_gte) ope_created_at.gte = ope_created_at_gte;
    if (ope_created_at_lt)  ope_created_at.lt = ope_created_at_lt;
    
    const query: OperationFindManyArgs = { where: { ope_created_at } };
    if (ope_caisse_id)  query.where = { ...query.where, ope_caisse_id:  +ope_caisse_id };
    if (ope_type)       query.where = { ...query.where, ope_type:       ope_type as EnumOpeTypeFilter<"Operation"> };
    if (ope_client_nom) query.where = { ...query.where, ope_client_nom: { contains: ope_client_nom } };
    if (ope_note)       query.where = { ...query.where, ope_note:       { contains: ope_note } };
    query.include = { ope_caisse: true, ope_created_by: true };

    const { csv } = await getOperationsAndGenerateCsv(query);
    if (!csv) return new NextResponse(null, {status: 400});

    const passThrough = new PassThrough();
    passThrough.write(csv);
    passThrough.end();

    const readableStream = streamToReadableStream(passThrough);

    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=export_${dayjs().locale("fr").format("YYYY_MM_DD-HH_mm_ss")}.csv`,
      },
    });
  } catch (e) {
    if (e instanceof ZodError) return new NextResponse(JSON.stringify({ error: e.issues }), { status: 400 });
    return new NextResponse(JSON.stringify({ error: e }), { status: 500 });
  }
}

const Z_QUERY = z
  .object({
    ope_caisse_id: z.string().optional().nullable(),
    ope_created_at_gte: z.string().optional().nullable(),
    ope_created_at_lt: z.string().optional().nullable(),
    ope_type: z.string().optional().nullable(),
    ope_client_nom: z.string().optional().nullable(),
    ope_note: z.string().optional().nullable(),
  })
  .strict();

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

export async function returnErrorIfInvalidSession() {
  const { session } = await getSession();
  const { id } = session || {};
  if (!id) return { error: _ERROR_CODE._UNAUTHORIZED };
  return { id, error: null };
}

export function streamToReadableStream(passThrough: PassThrough): ReadableStream {
  // prettier-ignore
  return new ReadableStream({
    start(controller) {
      passThrough.on("data",  (chunk) => controller.enqueue(chunk));
      passThrough.on("end",   () => controller.close());
      passThrough.on("error", (err) => controller.error(err));
    },
  });
}
