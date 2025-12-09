import { type ZodSchema } from 'zod'

export type HandlerContext<RequestType extends Request> = {
  req: RequestType
  json<T>(schema: ZodSchema<T>): Promise<T>
}

export type HandlerOptions = {
  methods?: string[]
  onMethodNotAllowed?: (request: Request, allowedMethods: string[]) => Response | Promise<Response>
}

export function createHandler<RequestType extends Request = Request>(
  handler: (ctx: HandlerContext<RequestType>) => Promise<Response>,
  options?: HandlerOptions,
): (request: RequestType) => Promise<Response> {
  const allowedMethods = options?.methods?.map((method) => method.toUpperCase()) ?? null

  return async function handle(request: RequestType): Promise<Response> {
    if (allowedMethods && !allowedMethods.includes(request.method.toUpperCase())) {
      if (options?.onMethodNotAllowed) {
        return options.onMethodNotAllowed(request, allowedMethods)
      }

      return Response.json(
        { error: 'method_not_allowed' },
        {
          status: 405,
          headers: {
            Allow: allowedMethods.join(', '),
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    let cachedBody: unknown
    let bodyParsed = false

    const parseJson = async <T>(schema: ZodSchema<T>): Promise<T> => {
      if (!bodyParsed) {
        cachedBody = await request.json()
        bodyParsed = true
      }

      return schema.parse(cachedBody)
    }

    try {
      return await handler({
        req: request,
        json: parseJson,
      })
    } catch (error) {
      return Response.json(
        { error: 'internal_server_error' },
        {
          status: 500,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    }
  }
}
