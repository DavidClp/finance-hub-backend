import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@financehub.local'
  const passwordHash = await bcrypt.hash('demo1234', 10)

  await prisma.transaction.deleteMany()
  await prisma.planningItem.deleteMany()
  await prisma.planning.deleteMany()
  await prisma.creditCard.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany({ where: { email } })

  const user = await prisma.user.create({
    data: {
      name: 'Demo FinanceHub',
      email,
      passwordHash,
    },
  })

  const [alimentacao, transporte, salario, lazer] = await Promise.all([
    prisma.category.create({
      data: { userId: user.id, name: 'Alimentação', icon: 'UtensilsCrossed', color: '#EF553B' },
    }),
    prisma.category.create({
      data: { userId: user.id, name: 'Transporte', icon: 'Car', color: '#3B82F6' },
    }),
    prisma.category.create({
      data: { userId: user.id, name: 'Salário', icon: 'Wallet', color: '#22C55E' },
    }),
    prisma.category.create({
      data: { userId: user.id, name: 'Lazer', icon: 'Gamepad2', color: '#A855F7' },
    }),
  ])

  const card = await prisma.creditCard.create({
    data: {
      userId: user.id,
      name: 'Nubank',
      bank: 'Nu Pagamentos',
      brand: 'mastercard',
      lastFourDigits: '1234',
      limitAmount: 500000,
      closingDay: 10,
      dueDay: 17,
      color: '#820AD1',
    },
  })

  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        categoryId: salario.id,
        description: 'Salário',
        amount: 1200000,
        type: 'income',
        date: new Date(Date.UTC(year, month, 5)),
        paymentDate: new Date(Date.UTC(year, month, 5)),
        paymentMethod: 'transfer',
      },
      {
        userId: user.id,
        categoryId: alimentacao.id,
        creditCardId: card.id,
        description: 'Supermercado',
        amount: 18990,
        type: 'expense',
        date: new Date(Date.UTC(year, month, 7)),
        paymentDate: new Date(Date.UTC(year, month + 1, 7)),
        paymentMethod: 'credit',
      },
      {
        userId: user.id,
        categoryId: transporte.id,
        description: 'Uber',
        amount: 4520,
        type: 'expense',
        date: new Date(Date.UTC(year, month, 8)),
        paymentDate: new Date(Date.UTC(year, month, 8)),
        paymentMethod: 'pix',
      },
      {
        userId: user.id,
        categoryId: lazer.id,
        creditCardId: card.id,
        description: 'Cinema',
        amount: 8000,
        type: 'expense',
        date: new Date(Date.UTC(year, month, 9)),
        paymentDate: new Date(Date.UTC(year, month + 1, 9)),
        paymentMethod: 'credit',
      },
    ],
  })

  await prisma.planning.create({
    data: {
      userId: user.id,
      name: 'Viagem 2026',
      description: 'Férias de fim de ano',
      targetAmount: 800000,
      deadline: new Date(Date.UTC(year, 11, 20)),
      icon: 'Plane',
      items: {
        create: [
          {
            name: 'Passagens',
            amount: 300000,
            completed: false,
            priority: 'high',
            category: 'Transporte',
          },
          {
            name: 'Hospedagem',
            amount: 250000,
            completed: false,
            priority: 'medium',
            category: 'Hospedagem',
          },
        ],
      },
    },
  })

  console.log('Seed concluído.')
  console.log(`Login: ${email} / demo1234`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
