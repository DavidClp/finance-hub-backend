import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from '../../../shared/errors/AppError'

type RequestTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: RequestTarget = 'body') {
  return (request: Request, _response: Response, next: NextFunction) => {
    const parsed = schema.safeParse(request[target])

    if (!parsed.success) {
      throw new ValidationError('Dados inválidos.', parsed.error.flatten().fieldErrors)
    }

    if (target === 'query') {
      Object.defineProperty(request, 'query', {
        value: parsed.data,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    } else {
      request[target] = parsed.data
    }

    next()
  }
}
