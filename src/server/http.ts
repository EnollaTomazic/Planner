import { type ZodSchema } from 'zod'

class HttpError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message?: string,
  ) {
    super(message)
  }
}

function buildErrorBody(code: string, message?: string): Record<string, string> {
  if (message) {
    return { error: code, message }
  }

  return { error: code }
}

export type HandlerContext = {
  req: Request
  json<T>(schema: ZodSchema<T>): Promise<T>
}

export type HandlerOptions = {
  methods?: string[]
}

export function createHandler(
  handler: (ctx: HandlerContext) => Promise<Response>,
  options: HandlerOptions = {},
) {
  const allowedMethods = options.methods?.map((method) => method.toUpperCase())

  return async function handleRequest(req: Request): Promise<Response> {
    try {
      if (allowedMethods && !allowedMethods.includes(req.method.toUpperCase())) {
        return Response.json(buildErrorBody('method_not_allowed'), {
          status: 405,
          headers: {
            ...(allowedMethods.length ? { Allow: allowedMethods.join(', ') } : {}),
            'Cache-Control': 'no-store',
          },
        })
      }

      const context: HandlerContext = {
        req,
        async json<T>(schema: ZodSchema<T>): Promise<T> {
          let payload: unknown

          try {
            payload = await req.json()
          } catch (error) {
            throw new HttpError('invalid_json', 400, error instanceof Error ? error.message : undefined)
          }

          const parsed = schema.safeParse(payload)
          if (!parsed.success) {
            throw new HttpError('invalid_payload', 400)
          }

          return parsed.data
        },
      }

      return await handler(context)
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json(buildErrorBody(error.code, error.message), {
          status: error.status,
          headers: { 'Cache-Control': 'no-store' },
        })
      }

      return Response.json(buildErrorBody('internal_error'), {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      })
    }
  }
}
