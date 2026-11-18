export type QueryResult = {
  data?: unknown
  error?: { message: string } | null
}

type QueueName = "gcs" | "deliveries"

export function createSupabaseMock(results: {
  gcs?: QueryResult[]
  deliveries?: QueryResult[]
}) {
  const queues: Record<QueueName, QueryResult[]> = {
    gcs: [...(results.gcs ?? [])],
    deliveries: [...(results.deliveries ?? [])],
  }

  const calls = {
    select: [] as unknown[][],
    order: [] as unknown[][],
    eq: [] as unknown[][],
    in: [] as unknown[][],
    gte: [] as unknown[][],
    lte: [] as unknown[][],
    limit: [] as unknown[][],
    insert: [] as unknown[],
    update: [] as unknown[],
    delete: [] as unknown[][],
  }

  const from = jest.fn((table: QueueName) => {
    const result = queues[table]?.shift() ?? { data: null, error: null }
    const builder: Record<string, unknown> = {}

    for (const method of [
      "select",
      "order",
      "eq",
      "in",
      "gte",
      "lte",
      "limit",
    ] as const) {
      builder[method] = jest.fn((...args: unknown[]) => {
        calls[method].push(args)
        return builder
      })
    }

    builder.insert = jest.fn((value: unknown) => {
      calls.insert.push(value)
      return builder
    })

    builder.update = jest.fn((value: unknown) => {
      calls.update.push(value)
      return builder
    })

    builder.delete = jest.fn((...args: unknown[]) => {
      calls.delete.push(args)
      return builder
    })

    builder.single = jest.fn(() => Promise.resolve(result))
    builder.maybeSingle = jest.fn(() => Promise.resolve(result))
    builder.then = (
      resolve: (value: QueryResult) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject)

    return builder
  })

  return {
    client: { from },
    from,
    calls,
  }
}
