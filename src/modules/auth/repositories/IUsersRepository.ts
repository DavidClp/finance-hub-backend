export interface UserRecord {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  name: string
  email: string
  passwordHash: string
}

export interface IUsersRepository {
  create(data: CreateUserData): Promise<UserRecord>
  findByEmail(email: string): Promise<UserRecord | null>
  findById(id: string): Promise<UserRecord | null>
}
