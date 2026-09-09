export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly fields?: Record<string, string[] | undefined>

  constructor(
    message: string,
    statusCode = 400,
    code = 'APP_ERROR',
    fields?: Record<string, string[] | undefined>,
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.fields = fields
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dados inválidos.', fields?: Record<string, string[] | undefined>) {
    super(message, 400, 'VALIDATION_ERROR', fields)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflito de negócio.') {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}
