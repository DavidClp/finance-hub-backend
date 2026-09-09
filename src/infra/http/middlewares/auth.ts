import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../../../shared/errors/AppError'
import { env } from '../../../shared/config/env'

export interface AuthPayload {
  sub: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
      }
    }
  }
}

export function ensureAuthenticated(request: Request, _response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new UnauthorizedError('Token não informado.')
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Token malformado.')
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload

    request.user = {
      id: decoded.sub,
      email: decoded.email,
    }

    return next()
  } catch {
    throw new UnauthorizedError('Token inválido ou expirado.')
  }
}
